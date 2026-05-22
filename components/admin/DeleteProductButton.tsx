"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!window.confirm(`Delete ${productName}? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setError("");
    const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    setIsDeleting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message || data.error || "Unable to delete product.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
      >
        <Trash2 size={14} />
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
