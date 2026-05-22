import { NextResponse } from "next/server";
import { jsonError, firstZodMessage } from "@/lib/apiErrors";
import { centsToEsewaAmount, createEsewaTransactionUuid, ESEWA_SIGNED_FIELD_NAMES, generateEsewaSignature, getEsewaConfig } from "@/lib/esewa";
import { connectDB } from "@/lib/mongodb";
import { priceOrderItems } from "@/lib/orderPricing";
import { orderCreateSchema } from "@/lib/validation";

function getBaseUrl(request: Request) {
  return (process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin).replace(/\/$/, "");
}

export async function POST(request: Request) {
  const data = await request.json();
  const parsed = orderCreateSchema.safeParse({
    ...data,
    paymentMethod: "esewa",
    paymentStatus: "pending",
    status: "pending",
  });

  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid checkout data."), 400);
  }

  await connectDB();
  let pricedOrder;
  try {
    pricedOrder = await priceOrderItems(parsed.data.items);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to price order.";
    return jsonError(message, 400);
  }

  const config = getEsewaConfig();
  const baseUrl = getBaseUrl(request);
  const amount = centsToEsewaAmount(pricedOrder.subtotal);
  const taxAmount = centsToEsewaAmount(pricedOrder.tax);
  const deliveryCharge = centsToEsewaAmount(pricedOrder.shippingCost);
  const serviceCharge = centsToEsewaAmount(0);
  const totalAmount = centsToEsewaAmount(pricedOrder.total);
  const transactionUuid = createEsewaTransactionUuid();
  const signature = generateEsewaSignature({
    totalAmount,
    transactionUuid,
    productCode: config.productCode,
    secretKey: config.secretKey,
  });

  return NextResponse.json({
    action: config.formAction,
    transactionUuid,
    amount: pricedOrder.total,
    fields: {
      amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: config.productCode,
      product_service_charge: serviceCharge,
      product_delivery_charge: deliveryCharge,
      success_url: `${baseUrl}/payment/esewa/success`,
      failure_url: `${baseUrl}/payment/esewa/failure`,
      signed_field_names: ESEWA_SIGNED_FIELD_NAMES,
      signature,
    },
  });
}
