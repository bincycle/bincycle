"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { toast } from "sonner";

interface FormState {
  name: string;
  email: string;
  topic: string;
  message: string;
}

const INITIAL: FormState = { name: "", email: "", topic: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in name, email and message.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForm(INITIAL);
      toast.success("Message sent — we'll write back within 24 hours.");
    }, 800);
  };

  return (
    <form
      onSubmit={onSubmit}
      data-testid="contact-form"
      className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="font-mono-label text-xs text-[#596155]"
          >
            Your name
          </Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={onChange}
            data-testid="contact-input-name"
            placeholder="Aanya R."
            className="h-12 rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="font-mono-label text-xs text-[#596155]"
          >
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            data-testid="contact-input-email"
            placeholder="you@email.com"
            className="h-12 rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
          />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <Label
          htmlFor="topic"
          className="font-mono-label text-xs text-[#596155]"
        >
          Topic
        </Label>
        <Input
          id="topic"
          name="topic"
          value={form.topic}
          onChange={onChange}
          data-testid="contact-input-topic"
          placeholder="Society onboarding / billing / press / something else"
          className="h-12 rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
        />
      </div>
      <div className="mt-5 space-y-2">
        <Label
          htmlFor="message"
          className="font-mono-label text-xs text-[#596155]"
        >
          Message
        </Label>
        <Textarea
          id="message"
          name="message"
          value={form.message}
          onChange={onChange}
          data-testid="contact-input-message"
          rows={6}
          placeholder="Tell us what's on your mind..."
          className="rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        data-testid="contact-submit-btn"
        className="mt-7 group inline-flex items-center gap-2 rounded-sm bg-[#284226] px-6 py-3.5 text-base font-medium text-[#F7F5F0] transition-colors hover:bg-[#1C2E1A] disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send message"}
        <ArrowUpRight
          size={18}
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </button>
    </form>
  );
}
