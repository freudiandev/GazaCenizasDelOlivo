import { describe, expect, it } from "vitest";
import { BALANCE } from "@/game/data/balance";
import {
  createPlayerBody,
  stepPlayerBody,
  type Platform,
} from "@/game/utils/physics";

const ground: Platform[] = [{ x: -1000, y: 620, width: 4000, height: 100 }];
const neutral = { axisX: 0, jumpDown: false, jumpPressed: false, run: false };

describe("player physics", () => {
  it("lands on a platform without penetrating it", () => {
    const body = createPlayerBody(100, 500);
    for (let i = 0; i < 120; i += 1)
      stepPlayerBody(body, neutral, ground, BALANCE.fixedDelta);
    expect(body.y).toBe(620);
    expect(body.vy).toBe(0);
    expect(body.onGround).toBe(true);
  });

  it("supports coyote time after leaving the floor", () => {
    const shortGround: Platform[] = [{ x: 0, y: 620, width: 80, height: 100 }];
    const body = createPlayerBody(65, 620);
    stepPlayerBody(body, neutral, shortGround, BALANCE.fixedDelta);
    for (let i = 0; i < 3; i += 1) {
      stepPlayerBody(
        body,
        { ...neutral, axisX: 1, run: true },
        shortGround,
        BALANCE.fixedDelta,
      );
    }
    stepPlayerBody(
      body,
      { ...neutral, jumpDown: true, jumpPressed: true },
      shortGround,
      BALANCE.fixedDelta,
    );
    expect(body.vy).toBeLessThan(0);
  });

  it("buffers a jump shortly before landing", () => {
    const body = createPlayerBody(100, 570);
    body.vy = 360;
    stepPlayerBody(
      body,
      { ...neutral, jumpDown: true, jumpPressed: true },
      ground,
      BALANCE.fixedDelta,
    );
    for (let i = 0; i < 12; i += 1) {
      stepPlayerBody(
        body,
        { ...neutral, jumpDown: true, jumpPressed: false },
        ground,
        BALANCE.fixedDelta,
      );
    }
    expect(body.vy).toBeLessThan(0);
  });

  it("cuts jump height when the button is released", () => {
    const held = createPlayerBody(100, 620);
    const released = createPlayerBody(100, 620);
    stepPlayerBody(held, neutral, ground, BALANCE.fixedDelta);
    stepPlayerBody(released, neutral, ground, BALANCE.fixedDelta);
    stepPlayerBody(
      held,
      { ...neutral, jumpDown: true, jumpPressed: true },
      ground,
      BALANCE.fixedDelta,
    );
    stepPlayerBody(
      released,
      { ...neutral, jumpDown: true, jumpPressed: true },
      ground,
      BALANCE.fixedDelta,
    );
    stepPlayerBody(
      held,
      { ...neutral, jumpDown: true },
      ground,
      BALANCE.fixedDelta,
    );
    stepPlayerBody(released, neutral, ground, BALANCE.fixedDelta);
    expect(released.vy).toBeGreaterThan(held.vy);
  });
});
