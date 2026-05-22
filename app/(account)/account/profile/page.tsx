"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountProfilePage() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: { name: "", email: "" } });

  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch("/api/user/profile", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Unable to load profile.");
        }
        const data = await res.json();
        reset({ name: data.user?.name ?? "", email: data.user?.email ?? "" });
      } catch {
        setMessage("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [status, reset]);

  async function onSubmit(values: { name: string; email: string }) {
    setMessage("");
    const response = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Unable to update profile.");
      return;
    }

    setMessage("Your profile has been updated.");
    reset({ name: data.user?.name ?? values.name, email: data.user?.email ?? values.email });
  }

  if (status === "loading") {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Loading profile…</h1>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Please sign in to access your profile.</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-6 py-10 md:px-10 lg:px-16">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">My account</p>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Profile</h1>
        </div>
        <Button type="button" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...register("name", { required: true })} />
        </div>
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" {...register("email")} disabled />
        </div>
        <div className="text-slate-600">{message}</div>
        <Button type="submit" disabled={isSubmitting || loading}>Save changes</Button>
      </form>
    </div>
  );
}
