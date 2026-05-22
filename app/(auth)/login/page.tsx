"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type LoginValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState<string>("/account");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get("callbackUrl") ?? "/account");
  }, []);

  async function onSubmit(values: LoginValues) {
    setError("");
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
      remember,
      callbackUrl,
    });

    if (result?.error) {
      setError(result.error);
      return;
    }

    try {
      const sessionResponse = await fetch("/api/auth/session", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!sessionResponse.ok) {
        const body = await sessionResponse.text();
        throw new Error(body || "Unable to load session.");
      }

      const contentType = sessionResponse.headers.get("content-type") ?? "";
      const session = contentType.includes("application/json")
        ? await sessionResponse.json()
        : null;

      if (session?.user?.role === "admin" || session?.user?.role === "superadmin") {
        router.push("/admin/dashboard");
        return;
      }

      router.push(callbackUrl || "/account");
    } catch (fetchError) {
      setError((fetchError as Error).message || "An error occurred while fetching session.");
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8 px-6 py-16">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Member Login</p>
        <h1 className="text-3xl font-semibold text-[#0A1628]">Sign in to Ratna Jewels</h1>
        <p className="text-slate-600">Secure login to manage your orders, wishlist, and account details.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Your secure password" {...register("password")} />
          {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
        </div>
        <label className="inline-flex items-center gap-3 text-sm text-slate-600">
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#C9A84C] focus:ring-[#C9A84C]" />
          Remember me
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Signing in…" : "Sign in"}</Button>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <a href="/forgot-password" className="underline decoration-[#C9A84C]/40">Forgot password?</a>
          <a href="/register" className="underline decoration-[#C9A84C]/40">Create account</a>
        </div>
      </form>
    </div>
  );
}
