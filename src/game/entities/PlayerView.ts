import {
  AnimatedSprite,
  Container,
  Graphics,
  Texture,
} from "pixi.js";

export type PlayerAnimationName =
  | "idle"
  | "walk"
  | "run"
  | "jump"
  | "fall"
  | "land"
  | "crouch"
  | "roll"
  | "shoot"
  | "hurt"
  | "death";

export interface PlayerAnimationDefinition {
  textures: Texture[];
  durations: number[];
  loop: boolean;
}

export type PlayerAnimationLibrary = Record<
  PlayerAnimationName,
  PlayerAnimationDefinition
>;

export class PlayerView {
  readonly root = new Container({ label: "PlayerContainer" });
  readonly shadow = new Graphics({ label: "GroundShadow" });
  readonly sprite: AnimatedSprite;
  readonly effects = new Container({ label: "OptionalEffectsContainer" });
  readonly debug = new Graphics({ label: "DebugGraphics" });

  private currentAnimation: PlayerAnimationName = "idle";
  private frameIndex = 0;
  private frameElapsed = 0;
  private paused = false;

  constructor(private readonly animations: PlayerAnimationLibrary) {
    this.shadow.ellipse(0, -3, 24, 6).fill({ color: 0x080a08, alpha: 0.45 });
    this.sprite = new AnimatedSprite({
      textures: animations.idle.textures,
      autoUpdate: false,
      label: "PlayerAnimatedSprite",
    });
    this.sprite.anchor.set(0.5, 1);
    this.sprite.gotoAndStop(0);
    this.root.addChild(this.shadow, this.sprite, this.effects, this.debug);
  }

  play(name: PlayerAnimationName): void {
    if (this.currentAnimation === name) return;
    this.currentAnimation = name;
    this.frameIndex = 0;
    this.frameElapsed = 0;
    this.sprite.stop();
    this.sprite.textures = this.animations[name].textures;
    this.sprite.anchor.set(0.5, 1);
    this.sprite.gotoAndStop(0);
  }

  update(dtSeconds: number): void {
    if (this.paused || this.sprite.textures.length <= 1) return;
    this.frameElapsed += dtSeconds * 1000;
    const animation = this.animations[this.currentAnimation];
    const duration = animation.durations[this.frameIndex] ?? 100;
    if (this.frameElapsed < duration) return;
    this.frameElapsed -= duration;
    const next = this.frameIndex + 1;
    if (next >= this.sprite.textures.length) {
      this.frameIndex = animation.loop ? 0 : this.sprite.textures.length - 1;
    } else {
      this.frameIndex = next;
    }
    this.sprite.gotoAndStop(this.frameIndex);
  }

  setFacing(direction: -1 | 1): void {
    this.sprite.scale.x = direction;
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
  }

  nextFrame(): void {
    this.frameIndex = (this.frameIndex + 1) % this.sprite.textures.length;
    this.sprite.gotoAndStop(this.frameIndex);
  }

  previousFrame(): void {
    this.frameIndex =
      (this.frameIndex - 1 + this.sprite.textures.length) %
      this.sprite.textures.length;
    this.sprite.gotoAndStop(this.frameIndex);
  }

  showBounds(visible: boolean): void {
    this.debug.clear();
    if (!visible) return;
    this.debug
      .rect(-56, -112, 112, 112)
      .stroke({ width: 1, color: 0x58a6ff })
      .rect(-18, -76, 36, 76)
      .stroke({ width: 2, color: 0x55ff88 })
      .rect(-22, -84, 44, 84)
      .stroke({ width: 1, color: 0xffcc44 })
      .circle(0, 0, 3)
      .fill(0xff5577);
  }

  get animation(): PlayerAnimationName {
    return this.currentAnimation;
  }

  get childCount(): number {
    return this.root.children.length;
  }

  get visibleAnimatedSpriteCount(): number {
    return this.root.children.filter(
      (child) => child instanceof AnimatedSprite && child.visible,
    ).length;
  }

  destroy(): void {
    this.root.destroy({ children: true });
  }
}
