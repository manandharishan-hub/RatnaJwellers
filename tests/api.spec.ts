import { expect, test } from "@playwright/test";

test("product write APIs require authentication", async ({ request }) => {
  const productResponse = await request.post("/api/products", { data: {} });
  expect(productResponse.status()).toBe(401);

  const updateResponse = await request.put("/api/products/000000000000000000000000", { data: {} });
  expect(updateResponse.status()).toBe(401);

  const deleteResponse = await request.delete("/api/products/000000000000000000000000");
  expect(deleteResponse.status()).toBe(401);
});

test("order list API requires authentication", async ({ request }) => {
  const response = await request.get("/api/orders");
  expect(response.status()).toBe(401);
});

test("order status update API requires admin authentication", async ({ request }) => {
  const response = await request.put("/api/orders/000000000000000000000000", {
    data: { status: "processing" },
  });
  expect(response.status()).toBe(401);
});

test("order creation validates cart payload before database work", async ({ request }) => {
  const response = await request.post("/api/orders", {
    data: {
      shippingAddress: {
        firstName: "Test",
        lastName: "Buyer",
        email: "buyer@example.com",
        phone: "5551234567",
        street: "1 Main Street",
        city: "Kathmandu",
        state: "Bagmati",
        zip: "44600",
        country: "Nepal",
      },
      billingAddress: {
        firstName: "Test",
        lastName: "Buyer",
        phone: "5551234567",
        street: "1 Main Street",
        city: "Kathmandu",
        state: "Bagmati",
        zip: "44600",
        country: "Nepal",
      },
      items: [],
    },
  });
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body).toEqual(expect.objectContaining({ message: expect.any(String) }));
});

test("payment intent API validates minimum amount", async ({ request }) => {
  const response = await request.post("/api/payments/create-intent", {
    data: { amount: 99 },
  });
  expect(response.status()).toBe(400);
});

test("admin upload API requires authentication", async ({ request }) => {
  const response = await request.post("/api/admin/uploads", {
    multipart: {
      file: {
        name: "piece.png",
        mimeType: "image/png",
        buffer: Buffer.from("not really an image"),
      },
    },
  });
  expect(response.status()).toBe(401);
});
