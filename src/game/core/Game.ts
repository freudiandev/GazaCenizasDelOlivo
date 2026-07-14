import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
  Texture,
} from "pixi.js";
import { AudioManager } from "@/game/core/AudioManager";
import { Input } from "@/game/core/Input";
import { BALANCE } from "@/game/data/balance";
import { loadGame, saveGame } from "@/game/save/SaveManager";
import {
  createPlayerBody,
  overlaps,
  stepPlayerBody,
  type KinematicBody,
  type Platform,
} from "@/game/utils/physics";
import { useGameStore } from "@/store/gameStore";

interface Bullet {
  view: Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hostile: boolean;
  life: number;
}

interface Enemy {
  view: Sprite;
  x: number;
  y: number;
  originX: number;
  direction: -1 | 1;
  health: number;
  cooldown: number;
  state: "patrol" | "alert" | "dead";
}

interface Boss {
  view: Sprite;
  x: number;
  y: number;
  health: number;
  cooldown: number;
  active: boolean;
  dead: boolean;
  time: number;
}

export class Game {
  private readonly app = new Application();
  private readonly input = new Input();
  private readonly audio = new AudioManager();
  private readonly world = new Container();
  private readonly debugLayer = new Graphics();
  private readonly bullets: Bullet[] = [];
  private readonly platforms: Platform[] = [
    { x: 0, y: BALANCE.groundY, width: BALANCE.worldWidth, height: 100 },
    { x: 720, y: 520, width: 260, height: 22, oneWay: true },
    { x: 1500, y: 485, width: 310, height: 22, oneWay: true },
    { x: 2670, y: 535, width: 230, height: 22, oneWay: true },
    { x: 3450, y: 470, width: 310, height: 22, oneWay: true },
  ];

  private readonly player: KinematicBody = createPlayerBody(
    180,
    BALANCE.groundY,
  );
  private playerView!: Sprite;
  private background!: Sprite;
  private enemy!: Enemy;
  private boss!: Boss;
  private runTextures: Texture[] = [];
  private frameHandle = 0;
  private lastTime = 0;
  private accumulator = 0;
  private facing: -1 | 1 = 1;
  private shootCooldown = 0;
  private hurtCooldown = 0;
  private health: number = BALANCE.playerMaxHealth;
  private ammo = 30;
  private score = 0;
  private cameraX = 0;
  private paused = false;
  private debug = false;
  private checkpointReached = false;
  private radioFound = false;
  private completed = false;
  private animationTime = 0;

  constructor(private readonly host: HTMLElement) {}

  async start(): Promise<void> {
    this.host.dataset.phase = "renderer-init";
    await this.app.init({
      resizeTo: this.host,
      autoStart: false,
      preference: "webgl",
      antialias: false,
      background: "#111512",
      resolution: Math.min(window.devicePixelRatio, 2),
      autoDensity: true,
    });
    this.host.dataset.phase = "assets-load";
    this.app.canvas.className = "game-canvas";
    this.app.canvas.setAttribute(
      "aria-label",
      "Gaza Cenizas del Olivo: misión La señal perdida",
    );
    this.host.appendChild(this.app.canvas);

    const [
      backgroundTexture,
      idleTexture,
      runOne,
      runTwo,
      enemyTexture,
      bossTexture,
    ] = await Promise.all([
      Assets.load<Texture>(
        "/assets/generated/backgrounds/barrio-del-olivo.png",
      ),
      Assets.load<Texture>("/assets/generated/characters/samir/idle.png"),
      Assets.load<Texture>("/assets/generated/characters/samir/run-1.png"),
      Assets.load<Texture>("/assets/generated/characters/samir/run-2.png"),
      Assets.load<Texture>("/assets/generated/enemies/directorio/rifleman.png"),
      Assets.load<Texture>("/assets/generated/bosses/ojo-del-cielo.png"),
    ]);
    this.host.dataset.phase = "world-build";

    [idleTexture, runOne, runTwo, enemyTexture, bossTexture].forEach(
      (texture) => {
        texture.source.scaleMode = "nearest";
      },
    );
    this.runTextures = [runOne, runTwo];
    this.background = new Sprite(backgroundTexture);
    this.fitBackground();
    this.app.stage.addChild(this.background, this.world);
    this.buildWorld();

    this.playerView = new Sprite(idleTexture);
    this.playerView.anchor.set(0.5, 0.94);
    this.playerView.position.set(this.player.x, this.player.y);
    this.world.addChild(this.playerView);

    const enemyView = new Sprite(enemyTexture);
    enemyView.anchor.set(0.5, 0.95);
    this.enemy = {
      view: enemyView,
      x: 1380,
      y: BALANCE.groundY,
      originX: 1380,
      direction: -1,
      health: 40,
      cooldown: 0.5,
      state: "patrol",
    };
    enemyView.position.set(this.enemy.x, this.enemy.y);
    this.world.addChild(enemyView);

    const bossView = new Sprite(bossTexture);
    bossView.anchor.set(0.5);
    bossView.scale.set(1.25);
    this.boss = {
      view: bossView,
      x: 3230,
      y: 400,
      health: 120,
      cooldown: 0.8,
      active: false,
      dead: false,
      time: 0,
    };
    bossView.position.set(this.boss.x, this.boss.y);
    this.world.addChild(bossView, this.debugLayer);

    const save = await loadGame();
    if (save?.checkpointId === "olive-square") {
      this.checkpointReached = true;
      this.player.x = save.playerX;
      this.updateHud({ checkpoint: "Plaza del olivo" });
    }

    this.input.attach();
    this.host.dataset.phase = "running";
    this.host.dataset.ready = "true";
    window.addEventListener("resize", this.fitBackground);
    this.lastTime = performance.now();
    this.frameHandle = requestAnimationFrame(this.frame);
  }

  destroy(): void {
    cancelAnimationFrame(this.frameHandle);
    this.input.detach();
    this.audio.destroy();
    window.removeEventListener("resize", this.fitBackground);
    this.app.destroy(true, { children: true });
  }

  private readonly frame = (time: number) => {
    const frameTime = Math.min(
      BALANCE.maxFrameDelta,
      (time - this.lastTime) / 1000,
    );
    this.lastTime = time;
    this.input.updateGamepad();

    const pausePressed = this.input.wasPressed("pause");
    const debugPressed = this.input.wasPressed("debug");
    const restartPressed = this.input.wasPressed("restart");
    if (pausePressed) {
      this.paused = !this.paused;
      this.updateHud({ paused: this.paused });
    }
    if (debugPressed) this.debug = !this.debug;
    if (restartPressed) this.respawn();

    let simulated = false;
    if (!this.paused) {
      this.accumulator += frameTime;
      while (this.accumulator >= BALANCE.fixedDelta) {
        this.update(BALANCE.fixedDelta);
        this.accumulator -= BALANCE.fixedDelta;
        simulated = true;
      }
    }

    this.render();
    if (simulated || pausePressed || debugPressed || restartPressed)
      this.input.endFrame();
    this.frameHandle = requestAnimationFrame(this.frame);
  };

  private update(dt: number): void {
    if (this.completed) return;
    this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    this.hurtCooldown = Math.max(0, this.hurtCooldown - dt);

    stepPlayerBody(
      this.player,
      {
        axisX: this.input.axisX(),
        jumpDown: this.input.isDown("jump"),
        jumpPressed: this.input.wasPressed("jump"),
        run: this.input.isDown("run"),
      },
      this.platforms,
      dt,
    );
    this.player.x = Math.max(
      20,
      Math.min(BALANCE.worldWidth - 20, this.player.x),
    );
    if (Math.abs(this.player.vx) > 5) this.facing = this.player.vx > 0 ? 1 : -1;
    if (this.player.y > 900) this.respawn();

    if (
      this.input.isDown("shoot") &&
      this.shootCooldown <= 0 &&
      this.ammo > 0
    ) {
      this.firePlayerBullet();
    }

    this.updateEnemy(dt);
    this.updateBoss(dt);
    this.updateBullets(dt);
    this.updateObjectives();
    this.updateCamera(dt);
    this.updateAnimation(dt);
  }

  private updateEnemy(dt: number): void {
    if (this.enemy.state === "dead") return;
    const distance = this.player.x - this.enemy.x;
    if (Math.abs(distance) < 560) {
      this.enemy.state = "alert";
      this.enemy.direction = distance < 0 ? -1 : 1;
      this.enemy.cooldown -= dt;
      if (this.enemy.cooldown <= 0 && Math.abs(distance) > 130) {
        this.fireEnemyBullet();
        this.enemy.cooldown = 1.25;
      }
    } else {
      this.enemy.state = "patrol";
      this.enemy.x += this.enemy.direction * 45 * dt;
      if (Math.abs(this.enemy.x - this.enemy.originX) > 145)
        this.enemy.direction *= -1;
    }
  }

  private updateBullets(dt: number): void {
    for (let index = this.bullets.length - 1; index >= 0; index -= 1) {
      const bullet = this.bullets[index];
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.life -= dt;

      if (
        !bullet.hostile &&
        this.enemy.state !== "dead" &&
        overlaps(
          bullet.x - 5,
          bullet.y - 3,
          10,
          6,
          this.enemy.x - 20,
          this.enemy.y - 74,
          40,
          74,
        )
      ) {
        this.enemy.health -= 20;
        this.score += 100;
        this.audio.playTone(110, 0.08);
        if (this.enemy.health <= 0) {
          this.enemy.state = "dead";
          this.enemy.view.visible = false;
          this.score += 500;
        }
        this.removeBullet(index);
        continue;
      }

      if (
        !bullet.hostile &&
        !this.boss.dead &&
        overlaps(
          bullet.x - 5,
          bullet.y - 3,
          10,
          6,
          this.boss.x - 48,
          this.boss.y - 34,
          96,
          68,
        )
      ) {
        this.boss.health = Math.max(0, this.boss.health - 20);
        this.score += 150;
        this.audio.playTone(95, 0.09);
        this.updateHud({
          bossHealth: Math.round((this.boss.health / 120) * 100),
          score: this.score,
        });
        if (this.boss.health <= 0) {
          this.boss.dead = true;
          this.boss.view.visible = false;
          this.score += 1200;
          this.updateHud({
            bossHealth: null,
            objective: "Repara la antena del cerro",
            score: this.score,
          });
        }
        this.removeBullet(index);
        continue;
      }

      if (
        bullet.hostile &&
        this.hurtCooldown <= 0 &&
        overlaps(
          bullet.x - 5,
          bullet.y - 3,
          10,
          6,
          this.player.x - 22,
          this.player.y - 82,
          44,
          82,
        )
      ) {
        this.health = Math.max(0, this.health - 18);
        this.hurtCooldown = 0.8;
        this.player.vx = bullet.vx > 0 ? 220 : -220;
        this.player.vy = -180;
        this.audio.playTone(75, 0.14, 0.06);
        this.updateHud({ health: this.health });
        this.removeBullet(index);
        if (this.health <= 0) this.respawn();
        continue;
      }

      if (bullet.life <= 0 || bullet.x < 0 || bullet.x > BALANCE.worldWidth)
        this.removeBullet(index);
    }
  }

  private updateObjectives(): void {
    if (!this.checkpointReached && this.player.x > 850) {
      this.checkpointReached = true;
      this.audio.playTone(660, 0.18);
      this.updateHud({
        checkpoint: "Plaza del olivo",
        score: this.score + 250,
      });
      this.score += 250;
      void saveGame({
        version: 1,
        profileId: "default",
        currentMission: "mission-01",
        checkpointId: "olive-square",
        playerX: 880,
        unlockedMissions: ["mission-01"],
        rescues: 0,
        moral: 0,
        updatedAt: new Date().toISOString(),
      });
    }

    if (
      !this.radioFound &&
      Math.abs(this.player.x - 2200) < 90 &&
      this.input.wasPressed("interact")
    ) {
      this.radioFound = true;
      this.score += 750;
      this.audio.playTone(880, 0.2);
      this.updateHud({
        objective: "Neutraliza el bloqueador sobre las azoteas",
        score: this.score,
      });
    }

    if (
      this.radioFound &&
      this.boss.dead &&
      Math.abs(this.player.x - 3740) < 110 &&
      this.input.wasPressed("interact")
    ) {
      this.completed = true;
      this.score += 2000;
      this.audio.playTone(1040, 0.35, 0.05);
      this.updateHud({
        objective: "Señal restablecida — transmisión recibida",
        score: this.score,
        completed: true,
      });
    }
  }

  private updateCamera(dt: number): void {
    const lookAhead = this.facing * 130;
    const maxCamera = Math.max(0, BALANCE.worldWidth - this.app.screen.width);
    const target = Math.max(
      0,
      Math.min(
        maxCamera,
        this.player.x + lookAhead - this.app.screen.width * 0.42,
      ),
    );
    this.cameraX += (target - this.cameraX) * Math.min(1, dt * 5);
  }

  private updateBoss(dt: number): void {
    if (this.boss.dead || !this.radioFound) return;
    const distance = this.player.x - this.boss.x;
    if (!this.boss.active && Math.abs(distance) < 720) {
      this.boss.active = true;
      this.updateHud({
        bossHealth: 100,
        objective: "Ojo del Cielo: apunta arriba y destruye sus sensores",
      });
    }
    if (!this.boss.active) return;

    this.boss.time += dt;
    this.boss.y = 390 + Math.sin(this.boss.time * 1.8) * 72;
    this.boss.x = 3230 + Math.sin(this.boss.time * 0.75) * 135;
    this.boss.cooldown -= dt;
    if (this.boss.cooldown <= 0) {
      const dx = this.player.x - this.boss.x;
      const dy = this.player.y - 48 - this.boss.y;
      const length = Math.hypot(dx, dy) || 1;
      for (const spread of [-0.16, 0, 0.16]) {
        const cos = Math.cos(spread);
        const sin = Math.sin(spread);
        const aimX = dx / length;
        const aimY = dy / length;
        this.spawnBullet(
          this.boss.x,
          this.boss.y + 24,
          (aimX * cos - aimY * sin) * 330,
          (aimX * sin + aimY * cos) * 330,
          true,
        );
      }
      this.audio.playTone(115, 0.1, 0.035);
      this.boss.cooldown = 1.45;
    }
  }

  private updateAnimation(dt: number): void {
    this.animationTime += dt;
    if (this.player.onGround && Math.abs(this.player.vx) > 30) {
      const frame =
        Math.floor(this.animationTime / 0.11) % this.runTextures.length;
      this.playerView.texture = this.runTextures[frame];
    }
  }

  private render(): void {
    this.playerView.position.set(
      Math.round(this.player.x),
      Math.round(this.player.y),
    );
    this.playerView.scale.x = this.facing;
    this.enemy.view.position.set(
      Math.round(this.enemy.x),
      Math.round(this.enemy.y),
    );
    this.enemy.view.scale.x = this.enemy.direction;
    this.boss.view.position.set(
      Math.round(this.boss.x),
      Math.round(this.boss.y),
    );
    this.world.x = -Math.round(this.cameraX);
    this.host.dataset.playerX = this.player.x.toFixed(2);
    this.host.dataset.playerY = this.player.y.toFixed(2);
    for (const bullet of this.bullets)
      bullet.view.position.set(Math.round(bullet.x), Math.round(bullet.y));
    this.drawDebug();
    this.app.renderer.render({ container: this.app.stage });
  }

  private firePlayerBullet(): void {
    const vertical =
      Number(this.input.isDown("down")) - Number(this.input.isDown("up"));
    const horizontal = vertical === 0 ? this.facing : this.facing * 0.72;
    const magnitude = Math.hypot(horizontal, vertical) || 1;
    this.spawnBullet(
      this.player.x + this.facing * 32,
      this.player.y - 55,
      (horizontal / magnitude) * 680,
      (vertical / magnitude) * 680,
      false,
    );
    this.ammo -= 1;
    this.shootCooldown = 0.16;
    this.audio.playTone(190, 0.045);
    this.updateHud({ ammo: this.ammo });
  }

  private fireEnemyBullet(): void {
    this.spawnBullet(
      this.enemy.x + this.enemy.direction * 25,
      this.enemy.y - 52,
      this.enemy.direction * 410,
      0,
      true,
    );
    this.audio.playTone(140, 0.055, 0.025);
  }

  private spawnBullet(
    x: number,
    y: number,
    vx: number,
    vy: number,
    hostile: boolean,
  ): void {
    const view = new Graphics()
      .rect(-5, -2, 10, 4)
      .fill(hostile ? 0x5fa8ff : 0xffb454);
    this.world.addChild(view);
    this.bullets.push({ view, x, y, vx, vy, hostile, life: 2.2 });
  }

  private removeBullet(index: number): void {
    const [bullet] = this.bullets.splice(index, 1);
    bullet.view.destroy();
  }

  private respawn(): void {
    this.health = BALANCE.playerMaxHealth;
    this.ammo = 30;
    this.player.x = this.checkpointReached ? 880 : 180;
    this.player.y = BALANCE.groundY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.updateHud({ health: this.health, ammo: this.ammo });
  }

  private buildWorld(): void {
    const terrain = new Graphics();
    terrain.rect(0, BALANCE.groundY, BALANCE.worldWidth, 100).fill(0x28251f);
    terrain.rect(0, BALANCE.groundY, BALANCE.worldWidth, 5).fill(0x8b6e45);
    for (const platform of this.platforms.slice(1)) {
      terrain
        .rect(platform.x, platform.y, platform.width, platform.height)
        .fill(0x4a4438);
      terrain.rect(platform.x, platform.y, platform.width, 4).fill(0xb08b53);
    }
    this.world.addChild(terrain);
    this.addMarker(880, BALANCE.groundY - 18, "PUNTO SEGURO", 0x7e9160);
    this.addMarker(2200, BALANCE.groundY - 18, "RADIO — L / E", 0xd3a457);
    this.addMarker(3740, BALANCE.groundY - 18, "ANTENA — L / E", 0xd3a457);
  }

  private addMarker(x: number, y: number, label: string, color: number): void {
    const marker = new Graphics().circle(0, 0, 12).stroke({ width: 3, color });
    marker.position.set(x, y);
    const text = new Text({
      text: label,
      style: {
        fill: color,
        fontFamily: "monospace",
        fontSize: 13,
        fontWeight: "bold",
      },
    });
    text.anchor.set(0.5, 1);
    text.position.set(x, y - 22);
    this.world.addChild(marker, text);
  }

  private drawDebug(): void {
    this.debugLayer.clear();
    if (!this.debug) return;
    this.debugLayer
      .rect(this.player.x - 18, this.player.y - 76, 36, 76)
      .stroke({ width: 2, color: 0x55ff88 })
      .rect(this.player.x - 22, this.player.y - 82, 44, 82)
      .stroke({ width: 1, color: 0xffcc44 });
    if (this.enemy.state !== "dead") {
      this.debugLayer
        .rect(this.enemy.x - 20, this.enemy.y - 74, 40, 74)
        .stroke({ width: 2, color: 0xff5555 });
    }
    if (!this.boss.dead) {
      this.debugLayer
        .rect(this.boss.x - 48, this.boss.y - 34, 96, 68)
        .stroke({ width: 2, color: 0x66bbff });
    }
  }

  private readonly fitBackground = () => {
    if (!this.background) return;
    const scale = Math.max(
      this.app.screen.width / this.background.texture.width,
      this.app.screen.height / this.background.texture.height,
    );
    this.background.scale.set(scale);
    this.background.x =
      (this.app.screen.width - this.background.texture.width * scale) / 2;
    this.background.y =
      (this.app.screen.height - this.background.texture.height * scale) / 2;
  };

  private updateHud(
    values: Partial<Parameters<typeof useGameStore.setState>[0]>,
  ): void {
    useGameStore.setState(values);
  }
}
