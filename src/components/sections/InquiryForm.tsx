"use client";

import { CalendarCheck } from "lucide-react";
import React, { useId, useState } from "react";
import { PillChip, bookingUrl, openBooking } from "@/components/site/BookCall";
import { cn } from "@/lib/utils";

type Field = "name" | "email" | "company" | "message";
type Errors = Partial<Record<Field, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InquiryForm() {
  const id = useId();
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", company: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const validate = (v: typeof values): Errors => {
    const e: Errors = {};
    if (!v.name.trim()) e.name = "Add your name so we know who we're meeting.";
    if (!v.email.trim()) e.email = "Add an email so the booking can reach you.";
    else if (!EMAIL.test(v.email.trim())) e.email = "That email doesn't look complete. Check for a missing @ or domain.";
    if (v.message.trim().length < 10) e.message = "A sentence or two about the project helps us prepare.";
    return e;
  };

  const prefill = () => ({
    name: values.name.trim(),
    email: values.email.trim(),
    notes: [values.company.trim() && `Company: ${values.company.trim()}`, values.message.trim()]
      .filter(Boolean)
      .join("\n\n"),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = (Object.keys(found) as Field[])[0];
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    const p = prefill();
    if (!openBooking(p)) window.open(bookingUrl(p), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  const update = (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  if (sent) {
    return (
      <div className="flex h-full flex-col items-start justify-center gap-5 py-6" role="status">
        <span className="inline-flex size-12 items-center justify-center rounded-full border border-violet/40 bg-violet/10 text-violet">
          <CalendarCheck className="size-5" />
        </span>
        <h3 className="font-display text-2xl font-medium tracking-[-0.03em] text-fg">Pick a time that suits you</h3>
        <p className="max-w-[44ch] text-[0.9375rem] leading-relaxed text-fg-muted">
          Your details are already in the booking form, so choosing a slot is all that&apos;s left. If the
          booking window didn&apos;t open, use the button below.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={bookingUrl(prefill())}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (openBooking(prefill())) e.preventDefault();
            }}
            className="group inline-flex rounded-full"
          >
            <PillChip size="md" variant="primary">
              Open booking
            </PillChip>
          </a>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-[0.9375rem] font-medium text-fg-muted transition-colors hover:text-fg"
          >
            Edit details
          </button>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5" aria-label="Project inquiry">
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldShell id={`${id}-name`} label="Name" error={errors.name}>
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={update("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            className={inputClass(!!errors.name)}
            placeholder="Jordan Lee"
          />
        </FieldShell>
        <FieldShell id={`${id}-email`} label="Work email" error={errors.email}>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={values.email}
            onChange={update("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
            className={inputClass(!!errors.email)}
            placeholder="jordan@company.com"
          />
        </FieldShell>
      </div>
      <FieldShell id={`${id}-company`} label="Company" optional>
        <input
          id={`${id}-company`}
          name="company"
          autoComplete="organization"
          value={values.company}
          onChange={update("company")}
          className={inputClass(false)}
          placeholder="Company or organisation"
        />
      </FieldShell>
      <FieldShell id={`${id}-message`} label="What are you building?" error={errors.message}>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={4}
          value={values.message}
          onChange={update("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${id}-message-error` : undefined}
          className={cn(inputClass(!!errors.message), "h-auto min-h-[120px] resize-y py-3 leading-relaxed")}
          placeholder="The problem, who it's for, and anything already in place."
        />
      </FieldShell>
      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.8125rem] leading-relaxed text-fg-subtle">
          Next you&apos;ll pick a time. Your details carry over.
        </p>
        <button type="submit" className="group inline-flex shrink-0 rounded-full">
          <PillChip size="lg" variant="primary">
            Continue to booking
          </PillChip>
        </button>
      </div>
    </form>
  );
}

function inputClass(invalid: boolean) {
  return cn(
    "h-12 w-full rounded-[12px] border bg-bg-deep/70 px-4 text-[0.9375rem] text-fg outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-fg-subtle",
    "focus:border-violet/70 focus:shadow-[0_0_0_4px_var(--field-halo)] focus-visible:outline-none",
    invalid ? "border-rose/70" : "border-line-strong hover:border-fg/20"
  );
}

function FieldShell({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline justify-between text-[0.8125rem] font-medium text-fg-muted">
        {label}
        {optional && <span className="font-normal text-fg-subtle">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-[0.8125rem] text-rose">
          {error}
        </p>
      )}
    </div>
  );
}
