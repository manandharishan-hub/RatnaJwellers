"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Enter a message"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [status, setStatus] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactForm) {
    setStatus("");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (response.ok) {
      setStatus("Message sent successfully. We will get back to you shortly.");
    } else {
      const data = await response.json();
      setStatus(data.message || "Unable to send your message at this time.");
    }
  }

  return (
    <div className="px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Contact us</p>
          <h1 className="text-4xl font-semibold text-[#0A1628]">We&apos;re happy to help with any inquiry.</h1>
          <p className="text-slate-600">Send us a message and our customer team will reply within one business day.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" {...register("message")} />
            {errors.message && <p className="mt-2 text-sm text-red-600">{errors.message.message}</p>}
          </div>
          {status && <p className="text-sm text-[#0A1628]">{status}</p>}
          <Button type="submit" disabled={isSubmitting}>Send message</Button>
        </form>
      </div>
    </div>
  );
}
