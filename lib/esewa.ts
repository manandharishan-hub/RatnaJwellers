import crypto from "crypto";

export const ESEWA_SIGNED_FIELD_NAMES = "total_amount,transaction_uuid,product_code";

export type EsewaResponsePayload = {
  transaction_code?: string;
  status?: string;
  total_amount?: string | number;
  transaction_uuid?: string;
  product_code?: string;
  signed_field_names?: string;
  signature?: string;
};

function getRequiredEnv(name: string, fallback?: string) {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`${name} must be set for eSewa payments.`);
  }
  return value;
}

export function getEsewaConfig() {
  const environment = process.env.ESEWA_ENV === "production" ? "production" : "uat";
  return {
    environment,
    productCode: getRequiredEnv("ESEWA_PRODUCT_CODE", "EPAYTEST"),
    secretKey: getRequiredEnv("ESEWA_SECRET_KEY"),
    formAction:
      environment === "production"
        ? "https://epay.esewa.com.np/api/epay/main/v2/form"
        : "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    statusUrl:
      environment === "production"
        ? "https://epay.esewa.com.np/api/epay/transaction/status/"
        : "https://uat.esewa.com.np/api/epay/transaction/status/",
  };
}

export function centsToEsewaAmount(cents: number) {
  return (cents / 100).toFixed(2);
}

export function generateEsewaSignature({
  totalAmount,
  transactionUuid,
  productCode,
  secretKey,
}: {
  totalAmount: string;
  transactionUuid: string;
  productCode: string;
  secretKey: string;
}) {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto.createHmac("sha256", secretKey).update(message).digest("base64");
}

export function createEsewaTransactionUuid() {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `RJ-${Date.now()}-${randomPart}`;
}

export function decodeEsewaResponse(data: string): EsewaResponsePayload {
  const decoded = Buffer.from(data, "base64").toString("utf8");
  return JSON.parse(decoded) as EsewaResponsePayload;
}

export function verifyEsewaResponseSignature(payload: EsewaResponsePayload, secretKey: string) {
  if (!payload.signature || !payload.signed_field_names) return false;

  const signedFields = payload.signed_field_names.split(",").map((field) => field.trim()).filter(Boolean);
  const message = signedFields.map((field) => `${field}=${payload[field as keyof EsewaResponsePayload] ?? ""}`).join(",");
  const expectedSignature = crypto.createHmac("sha256", secretKey).update(message).digest("base64");

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(payload.signature));
  } catch {
    return false;
  }
}
