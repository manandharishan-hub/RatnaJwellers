"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("We sent a verification link to your inbox. Click the link to activate your account and start shopping luxury jewelry.");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");

    if (!token || !email) {
      return;
    }

    async function verify() {
      setStatus("loading");
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Unable to verify your email.");
        }

        setStatus("success");
        setMessage(data?.message || "Email verified successfully.");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Unable to verify your email.");
      }
    }

    verify();
  }, []);

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Email verification</p>
        <h1 className="mt-4 text-3xl font-semibold text-[#0A1628]">Verify your Ratna Jewels account</h1>
        <p className={`mt-4 text-sm ${status === "error" ? "text-red-600" : "text-slate-600"}`}>
          {message}
        </p>
        {status === "loading" && <p className="mt-2 text-slate-500">Verifying your email, please wait…</p>}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href="/login" className="inline-flex items-center justify-center rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Return to login</a>
          <a href="/" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#C9A84C]">Back to home</a>
        </div>
      </div>
    </div>
  );
}
