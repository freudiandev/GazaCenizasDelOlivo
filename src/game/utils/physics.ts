import { BALANCE } from "@/game/data/balance";

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  oneWay?: boolean;
}

export interface KinematicBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  onGround: boolean;
  coyoteRemaining: number;
  jumpBufferRemaining: number;
}

export interface PlayerInputFrame {
  axisX: number;
  jumpDown: boolean;
  jumpPressed: boolean;
  run: boolean;
}

export function createPlayerBody(x: number, y: number): KinematicBody {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    width: 36,
    height: 76,
    onGround: false,
    coyoteRemaining: 0,
    jumpBufferRemaining: 0,
  };
}

export function overlaps(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function stepPlayerBody(
  body: KinematicBody,
  input: PlayerInputFrame,
  platforms: readonly Platform[],
  dt: number,
): void {
  if (input.jumpPressed) body.jumpBufferRemaining = BALANCE.jumpBufferTime;
  else body.jumpBufferRemaining = Math.max(0, body.jumpBufferRemaining - dt);

  if (body.onGround) body.coyoteRemaining = BALANCE.coyoteTime;
  else body.coyoteRemaining = Math.max(0, body.coyoteRemaining - dt);

  const targetSpeed =
    input.axisX * (input.run ? BALANCE.runSpeed : BALANCE.moveSpeed);
  const acceleration = body.onGround
    ? BALANCE.runAcceleration
    : BALANCE.airAcceleration;
  if (Math.abs(input.axisX) > 0.01) {
    body.vx = moveToward(body.vx, targetSpeed, acceleration * dt);
  } else {
    body.vx = moveToward(body.vx, 0, BALANCE.groundFriction * dt);
  }

  if (body.jumpBufferRemaining > 0 && body.coyoteRemaining > 0) {
    body.vy = BALANCE.jumpVelocity;
    body.onGround = false;
    body.coyoteRemaining = 0;
    body.jumpBufferRemaining = 0;
  }
  if (!input.jumpDown && body.vy < -260) body.vy = -260;

  body.vy = Math.min(BALANCE.maxFallSpeed, body.vy + BALANCE.gravity * dt);
  moveHorizontally(body, platforms, dt);
  moveVertically(body, platforms, dt);
}

function moveHorizontally(
  body: KinematicBody,
  platforms: readonly Platform[],
  dt: number,
): void {
  body.x += body.vx * dt;
  for (const platform of platforms) {
    if (platform.oneWay) continue;
    const left = body.x - body.width / 2;
    const top = body.y - body.height;
    if (
      !overlaps(
        left,
        top,
        body.width,
        body.height,
        platform.x,
        platform.y,
        platform.width,
        platform.height,
      )
    )
      continue;
    if (body.vx > 0) body.x = platform.x - body.width / 2;
    else if (body.vx < 0) body.x = platform.x + platform.width + body.width / 2;
    body.vx = 0;
  }
}

function moveVertically(
  body: KinematicBody,
  platforms: readonly Platform[],
  dt: number,
): void {
  const previousBottom = body.y;
  body.y += body.vy * dt;
  body.onGround = false;
  for (const platform of platforms) {
    const left = body.x - body.width / 2;
    const top = body.y - body.height;
    const isCrossingTop =
      body.vy >= 0 && previousBottom <= platform.y && body.y >= platform.y;
    if (platform.oneWay && !isCrossingTop) continue;
    if (
      !overlaps(
        left,
        top,
        body.width,
        body.height,
        platform.x,
        platform.y,
        platform.width,
        platform.height,
      )
    )
      continue;
    if (body.vy >= 0) {
      body.y = platform.y;
      body.vy = 0;
      body.onGround = true;
    } else if (!platform.oneWay) {
      body.y = platform.y + platform.height + body.height;
      body.vy = 0;
    }
  }
}

function moveToward(value: number, target: number, amount: number): number {
  if (value < target) return Math.min(value + amount, target);
  if (value > target) return Math.max(value - amount, target);
  return target;
}
