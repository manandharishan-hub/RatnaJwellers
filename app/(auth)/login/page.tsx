"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gem, ShieldCheck, UserRound } from "lucide-react";
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
  if (error === "CredentialsSignin") return "Invalid email or password.";
  return error;
}

function getSafeCallbackUrl() {
  if (typeof window === "undefined") return "/dashboard";
  const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) return "/dashboard";
  return callbackUrl;
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (status !== "authenticated") return;
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role !== "admin") {
      router.replace("/dashboard");
    }
  }, [router, session?.user, status]);

  async function onSubmit(values: LoginValues) {
    setError("");
    const callbackUrl = getSafeCallbackUrl();
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email.trim().toLowerCase(),
      password: values.password,
      callbackUrl,
    }).catch(() => null);

    if (result?.error) {
      setError(getLoginErrorMessage(result.error));
      return;
    }
    if (!result) {
      setError("Unable to reach the sign-in service. Please try again.");
      return;
    }

    const destination = result.url ?? callbackUrl;
    window.location.assign(destination);
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] px-5 py-10 md:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0A1628] text-[#D8B35A]">
            <Gem size={27} />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#9A7627]">Ratna Jeweler&apos;s login</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#0A1628]">Choose how you want to continue</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Shop fine jewellery as a customer, or use the restricted admin entrance to manage products, orders, users, and sales.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-lg border border-[#D8B35A]/60 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0A1628] text-white">
                <UserRound size={22} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#0A1628]">Continue as User</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">Sign in with your registered email or Gmail address to view orders, cart, wishlist, and profile.</p>
              </div>
            </div>

            <form method="post" onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-5">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="username" placeholder="yourname@gmail.com" {...register("email")} />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="current-password" placeholder="Your password" {...register("password")} />
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Signing in..." : "Continue as User"}
              </Button>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <Link href="/forgot-password" className="underline decoration-[#D8B35A]/50">Forgot password?</Link>
                <Link href="/register" className="underline decoration-[#D8B35A]/50">Create account</Link>
              </div>
            </form>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D8B35A] text-[#0A1628]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#0A1628]">Admin Login</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">Open the admin workspace for jewellery product, category, order, user, stock, and revenue management.</p>
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-[#FBFAF7] p-4 text-sm text-slate-600">
              Admin demo access is validated on the server using environment variables and is separate from customer accounts.
            </div>
            <Link href="/admin/login" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#0A1628] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
              Admin Login
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
