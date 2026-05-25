"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { loginSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginValues = {
  email: string;
  password: string;
};

function getLoginErrorMessage(error?: string | null) {
  if (!error) return "Unable to sign in. Please try again.";
  if (error === "CredentialsSignin") return "Invalid admin email or password.";
  return error;
}

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setError("");
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email.trim().toLowerCase(),
      password: values.password,
      callbackUrl: "/admin/dashboard",
      adminOnly: "true",
    }).catch(() => null);

    if (result?.error) {
      setError(getLoginErrorMessage(result.error));
      return;
    }
    if (!result) {
      setError("Unable to reach the sign-in service. Please try again.");
      return;
    }

    window.location.assign("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] px-5 py-10 md:px-8">
      <section className="mx-auto max-w-md">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0A1628] text-[#D8B35A]">
            <ShieldCheck size={26} />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9A7627]">Admin Login</p>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Sign in to Ratna admin</h1>
          <p className="text-slate-600">Use the demo admin credential configured in server environment variables.</p>
        </div>
        <form method="post" onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <Label htmlFor="email">Admin email</Label>
            <Input id="email" type="email" autoComplete="username" placeholder="admin123@gmail.com" {...register("email")} />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Admin password</Label>
            <Input id="password" type="password" autoComplete="current-password" placeholder="admin123" {...register("password")} />
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Signing in..." : "Admin Login"}
          </Button>
          <p className="text-center text-sm text-slate-600">
            Not an admin? <Link href="/login" className="underline decoration-[#D8B35A]/50">Continue as User</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
