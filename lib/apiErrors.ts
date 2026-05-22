import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export function firstZodMessage(error: { issues?: { message: string }[] }, fallback: string) {
  return error.issues?.[0]?.message ?? fallback;
}
