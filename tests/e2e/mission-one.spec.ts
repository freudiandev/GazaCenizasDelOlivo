import { expect, test } from "@playwright/test";

test("starts the mission, moves Samir, pauses and resumes", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Comenzar misión 1" }).click();
  const host = page.getByTestId("game-canvas-host");
  await expect(host).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
  const initialX = Number(await host.getAttribute("data-player-x"));

  await page.keyboard.down("KeyD");
  await page.waitForTimeout(700);
  await page.keyboard.up("KeyD");
  const movedX = Number(await host.getAttribute("data-player-x"));
  expect(movedX).toBeGreaterThan(initialX + 30);

  await page.keyboard.down("Space");
  await page.waitForTimeout(100);
  const airborneY = Number(await host.getAttribute("data-player-y"));
  await page.keyboard.up("Space");
  expect(airborneY).toBeLessThan(620);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Pausa" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Pausa" })).toBeHidden();
});

test("persists and restores the olive-square checkpoint", async ({ page }) => {
  await page.goto("/game");
  const host = page.getByTestId("game-canvas-host");
  await expect(host).toHaveAttribute("data-ready", "true", { timeout: 30_000 });

  await page.keyboard.down("KeyD");
  await page.waitForTimeout(3_200);
  await page.keyboard.up("KeyD");
  await expect(
    page.getByText("Plaza del olivo", { exact: false }),
  ).toBeVisible();

  await page.reload();
  await expect(host).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
  await expect
    .poll(async () => Number(await host.getAttribute("data-player-x")))
    .toBeGreaterThanOrEqual(879);
});
