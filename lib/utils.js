import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function buildOrderNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const randomPart = Math.floor(100 + Math.random() * 900).toString();
  return `RJ-${timestamp}-${randomPart}`;
}

export function centsToCurrency(cents) {
  return (cents / 100).toLocaleString("en-NP", {
    style: "currency",
    currency: "NPR",
  });
}

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
