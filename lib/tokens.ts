import { jwtVerify, SignJWT, type JWTPayload } from "jose";

function getJwtSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET must be set to sign tokens.");
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(payload: Record<string, string>, expiresIn: string) {
  const jwtSecret = getJwtSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .sign(jwtSecret);
}

export async function verifyToken(token: string) {
  const jwtSecret = getJwtSecret();
  const { payload } = await jwtVerify(token, jwtSecret);
  return payload as JWTPayload;
}
