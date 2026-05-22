import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <Suspense fallback={<div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-sm text-slate-600">Loading verification...</div>}>
        <VerifyEmailClient />
      </Suspense>
    </div>
  );
}
