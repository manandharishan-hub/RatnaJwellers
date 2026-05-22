"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type VerificationState = "idle" | "verifying" | "success" | "error";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationState>("idle");
  const [message, setMessage] = useState("We sent a verification link to your inbox. Click the link to activate your account and start shopping luxury jewelry.");
  const hasVerificationParams = Boolean(searchParams.get("token") && searchParams.get("email"));

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) return;

    let isCurrent = true;

    async function verifyEmail() {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });
        const data = await response.json();

        if (!isCurrent) return;

        setMessage(data?.message ?? (response.ok ? "Email verified successfully." : "Unable to verify email."));
        setStatus(response.ok ? "success" : "error");
      } catch {
        if (!isCurrent) return;
        setMessage("Unable to verify email right now. Please try the link again.");
        setStatus("error");
      }
    }

    verifyEmail();

    return () => {
      isCurrent = false;
    };
  }, [searchParams]);

  const heading = status === "success" ? "Your account is verified" : "Verify your Ratna Jewels account";
  const isVerifying = hasVerificationParams && status === "idle";

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-sm">
      <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Email verification</p>
      <h1 className="mt-4 text-3xl font-semibold text-[#0A1628]">{heading}</h1>
      <p className={status === "error" ? "mt-4 text-red-600" : "mt-4 text-slate-600"}>
        {isVerifying ? "Verifying your email..." : message}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Return to login</Link>
        <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#C9A84C]">Back to home</Link>
      </div>
    </div>
  );
}
