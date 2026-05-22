"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotValues = {
  email: string;
};

async function readErrorMessage(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  return data?.message || fallback;
}

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({ resolver: zodResolver(emailSchema) });

  async function onSubmit(values: ForgotValues) {
    setError("");
    setMessage("");
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setError(await readErrorMessage(response, "Unable to process your request."));
      return;
    }

    setMessage("A password reset link has been sent to your email address.");
  }

  return (
    <div className="mx-auto max-w-md space-y-8 px-6 py-16">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Forgot your password?</p>
        <h1 className="text-3xl font-semibold text-[#0A1628]">Reset your password</h1>
        <p className="text-slate-600">Enter your email and we&apos;ll send you a secure reset link.</p>
      </div>
      <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Sending…" : "Send reset link"}</Button>
      </form>
    </div>
  );
}
