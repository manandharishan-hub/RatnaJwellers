import { expect, test } from "@playwright/test";

test("account orders redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/account/orders");
  await expect(page).toHaveURL(/\/login/);
});

test("shop page is reachable and cart is open to guests", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByRole("heading", { name: /shop elegant designer pieces/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /apply filters/i })).toBeVisible();
  await page.getByLabel(/material/i).selectOption("Gold");
  await page.getByRole("button", { name: /apply filters/i }).click();
  await expect(page).toHaveURL(/material=Gold/);

  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: /review your jewelry selection/i })).toBeVisible();
});

test("checkout supports guest login and register choices", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByText(/guest checkout/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /^Login/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Register/i })).toBeVisible();
});

test("navbar hides dashboard before login and shows auth links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /^Dashboard$/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /login \/ register/i })).toBeVisible();
});

test("auth pages expose validation-oriented forms", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: /welcome to ratna jewels/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();

  await page.goto("/forgot-password");
  await expect(page.getByRole("heading", { name: /reset your password/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
});
