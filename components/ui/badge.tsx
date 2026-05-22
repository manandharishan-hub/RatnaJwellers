import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "gold" | "light" | "outline";
  className?: string;
  children: ReactNode;
}

export function Badge({ variant = "gold", className, children }: BadgeProps) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]";
  const styles =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-700"
      : variant === "light"
      ? "bg-slate-100 text-slate-800"
      : "bg-[#C9A84C] text-[#0A1628]";
  return <span className={cn(base, styles, className)}>{children}</span>;
}
