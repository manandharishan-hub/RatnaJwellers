import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
  onUpdate: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({ item, onUpdate, onRemove }: CartItemProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
      <div className="h-28 w-28 overflow-hidden rounded-3xl bg-slate-100">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
        <p className="text-sm text-slate-500">Variant: {item.variant ?? "Standard"}</p>
        <p className="mt-2 text-base font-semibold text-[#0A1628]">${(item.price / 100).toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onUpdate(item.productId, item.quantity - 1)} className="rounded-full border border-slate-300 p-2 text-slate-700">
          <Minus size={16} />
        </button>
        <span className="min-w-[2rem] text-center text-sm font-semibold">{item.quantity}</span>
        <button type="button" onClick={() => onUpdate(item.productId, item.quantity + 1)} className="rounded-full border border-slate-300 p-2 text-slate-700">
          <Plus size={16} />
        </button>
      </div>
      <button type="button" onClick={() => onRemove(item.productId)} className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
