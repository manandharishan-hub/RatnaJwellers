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

  async function handleDelete() {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });

    if (response.ok) {
      router.refresh();
    } else {
      alert("Failed to delete product");
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
      title="Delete"
    >
      <Trash2 className={`w-4 h-4 ${isDeleting ? "text-gray-400" : "text-red-600"}`} />
    </button>
  );
}
