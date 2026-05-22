import { Suspense } from "react";
import { EsewaSuccessClient } from "./EsewaSuccessClient";

export default function EsewaSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F6F2] px-5 py-16 text-center text-slate-600">Verifying eSewa payment...</div>}>
      <EsewaSuccessClient />
    </Suspense>
  );
}
