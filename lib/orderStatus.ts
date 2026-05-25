export const trackingSteps = ["processing", "packed", "out-for-delivery", "delivered"];

export function formatOrderStatus(status: string) {
  const labels: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    packed: "Packed",
    "out-for-delivery": "Out for Delivery",
    shipped: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return labels[status] ?? status;
}

export function trackingStepIndex(status: string) {
  if (status === "shipped") return trackingSteps.indexOf("out-for-delivery");
  return trackingSteps.indexOf(status);
}
