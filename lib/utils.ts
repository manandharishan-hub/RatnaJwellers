export function buildOrderNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const randomPart = Math.floor(100 + Math.random() * 900).toString();
  return `RJ-${timestamp}-${randomPart}`;
}

export function centsToCurrency(cents: number) {
  return (cents / 100).toLocaleString("en-NP", {
    style: "currency",
    currency: "NPR",
  });
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeText(value: string) {
  return value.replace(/[<>"'`;&]/g, "").trim();
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
