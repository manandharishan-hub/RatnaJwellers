"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type RegisterValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

async function readErrorMessage(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  return data?.message || fallback;
}

function getSafeCallbackUrl() {
  if (typeof window === "undefined") return "";
  const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) return "";
  return callbackUrl;
}

export default function RegisterPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    setError("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setError(await readErrorMessage(response, "Unable to register at this time."));
      return;
    }

    const data = await response.json().catch(() => null);
    const callbackUrl = getSafeCallbackUrl();
    const queryParams = new URLSearchParams();
    if (callbackUrl) queryParams.set("callbackUrl", callbackUrl);
    queryParams.set("email", values.email.trim().toLowerCase());
    const query = `?${queryParams.toString()}`;
    router.push(data?.requiresVerification ? `/verify-email${query}` : `/login${query}`);
  }

  return (
    <div className="mx-auto max-w-md space-y-8 px-6 py-16">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Create an account</p>
        <h1 className="text-3xl font-semibold text-[#0A1628]">Welcome to Ratna Jewels</h1>
        <p className="text-slate-600">Join now to save favorites, checkout faster, and track every order.</p>
      </div>
      <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register("name")} placeholder="Your full name" />
          {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="yourname@gmail.com" {...register("email")} />
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder="Create a strong password" {...register("password")} />
          {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} placeholder="Repeat your password" />
          {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid gap-3">
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Creating account..." : "Create account"}</Button>
          <Button type="button" className="w-full border border-slate-300 bg-white text-[#0A1628] hover:border-[#C9A84C] hover:shadow-none" onClick={() => {
            const callbackUrl = getSafeCallbackUrl();
            router.push(callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login");
          }}>
            Sign in
          </Button>
        </div>
      </form>
    </div>
  );
}
