import { expect, test } from "@playwright/test";

test("admin pages redirect unauthenticated users to login", async ({ page }) => {
  await page.goto("/admin/products");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("admin login page is reachable", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: /sign in to ratna admin/i })).toBeVisible();
  await expect(page.getByLabel(/admin email/i)).toBeVisible();
});

test("main login page exposes user and admin choices", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /choose how you want to continue/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /continue as user/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /admin login/i })).toBeVisible();
});
