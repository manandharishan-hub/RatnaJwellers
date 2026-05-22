"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetValues = {
  password: string;
  confirmPassword: string;
};

const resetPasswordFormSchema = z
  .object({
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

interface ResetPasswordClientProps {
  token: string;
  email: string;
}

export default function ResetPasswordClient({ token, email }: ResetPasswordClientProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({ resolver: zodResolver(resetPasswordFormSchema) });

  async function onSubmit(values: ResetValues) {
    setError("");
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password: values.password, confirmPassword: values.confirmPassword }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data?.message || "Unable to reset password.");
      return;
    }

    setSuccess("Your password has been reset. You can now log in.");
    setTimeout(() => router.push("/login"), 1500);
  }

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token, email]);

  return (
    <div className="mx-auto max-w-md space-y-8 px-6 py-16">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Reset password</p>
        <h1 className="text-3xl font-semibold text-[#0A1628]">Create a new password</h1>
        <p className="text-slate-600">Use the secure token sent to your email to update your account password.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" placeholder="New password" {...register("password")} />
          {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" type="password" {...register("confirmPassword")} placeholder="Confirm password" />
          {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
        <Button type="submit" disabled={isSubmitting || !token || !email} className="w-full">
          {isSubmitting ? "Resetting…" : "Reset password"}
        </Button>
      </form>
    </div>
  );
}
