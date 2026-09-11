"use client";

import { useState, type FormEvent } from "react";

import { Hover } from "@/components/animation/springs/hover";
import type { HeroFormContent } from "@/data/mocks/home";

/**
 * The frosted wait-list pill shared by the hero and the closing logo scene.
 *
 * `layout="row"` is the desktop composition's inline pill (prénom · e-mail · CTA
 * on one line); `layout="stack"` is the mobile reflow (full-width fields stacked
 * over a full-width CTA). The submit button carries the spring hover (`<Hover>`,
 * auto-off on touch), so every CTA on the site lifts the same way.
 *
 * It really submits (ADR-0046): the form posts to `/api/contact`, and the
 * confirmation line is shown ONLY once the server has answered 200 — the cadrage
 * forbids the interface from announcing a success the server has not confirmed.
 * On failure the pill stays, with the failure line under it, so nothing is lost.
 */

const HOVER = { tension: 320, friction: 22 } as const;

const FIELD_ROW =
  "w-[180px] bg-transparent font-mulish text-[16px] leading-[1.2] font-normal text-foreground placeholder:text-foreground/90";
const FIELD_STACK =
  "w-full rounded-[16px] bg-foreground/[0.06] px-[18px] py-[14px] font-mulish text-[16px] leading-none font-normal text-foreground placeholder:text-foreground/70 focus:bg-foreground/[0.1] focus:outline-none";

const PILL_ROW =
  "rounded-[32px] border border-[color:var(--hero-glass-border)] bg-[var(--hero-glass)] backdrop-blur-[8px]";
const PILL_STACK =
  "rounded-[24px] border border-[color:var(--hero-glass-border)] bg-[var(--hero-glass)] backdrop-blur-[8px]";

/** What the endpoint receives as the message body — this form has no free text. */
const WAITLIST_MESSAGE = "Liste d'attente ODORO";

type Status = "idle" | "sending" | "done" | "failed";

export interface ContactFormProps {
  form: HeroFormContent;
  layout?: "row" | "stack";
}

export const ContactForm = ({ form, layout = "row" }: ContactFormProps) => {
  const row = layout === "row";
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message: WAITLIST_MESSAGE }),
      });
      setStatus(response.ok ? "done" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "done") {
    return (
      <p
        role="status"
        className={`m-0 flex items-center font-mulish text-[16px] leading-[1.2] font-normal text-foreground ${
          row
            ? `h-[43px] px-[32px] ${PILL_ROW}`
            : `justify-center px-[18px] py-[16px] text-center ${PILL_STACK}`
        }`}
      >
        {form.done}
      </p>
    );
  }

  return (
    <div className="relative">
      <form
        onSubmit={onSubmit}
        aria-busy={status === "sending"}
        className={
          row
            ? `flex items-center gap-[25px] py-[2px] pr-[2px] pl-[32px] ${PILL_ROW}`
            : `flex flex-col gap-[10px] p-[10px] ${PILL_STACK}`
        }
      >
        <input
          type="text"
          name="name"
          autoComplete="given-name"
          required
          aria-label={form.name}
          placeholder={form.name}
          className={row ? FIELD_ROW : FIELD_STACK}
        />
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          aria-label={form.email}
          placeholder={form.email}
          className={row ? FIELD_ROW : FIELD_STACK}
        />
        <Hover
          tag="div"
          from={{ scale: 1 }}
          to={{ scale: 1.03 }}
          config={HOVER}
          className={row ? "shrink-0" : "w-full"}
        >
          <button
            type="submit"
            disabled={status === "sending"}
            className={
              row
                ? "flex w-full shrink-0 items-center justify-center gap-[8px] rounded-[50px] py-[2px] pr-[28px] pl-[2px] disabled:cursor-progress"
                : "flex w-full items-center justify-center gap-[10px] rounded-[50px] py-[6px] pr-[24px] pl-[6px] disabled:cursor-progress"
            }
            style={{ backgroundImage: "var(--gradient-hero-cta)" }}
          >
            <span className="relative block size-[39px] shrink-0">
              <span className="absolute top-0 left-0 size-[39px] rounded-[50px] bg-foreground" />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 size-[23px] -translate-x-1/2 -translate-y-1/2"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="var(--background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-mulish text-[16px] leading-[1.2] font-normal whitespace-nowrap text-foreground">
              {status === "sending" ? form.sending : form.submit}
            </span>
          </button>
        </Hover>
      </form>

      {status === "failed" && (
        <p
          role="alert"
          className={`m-0 font-mulish text-[14px] leading-[1.3] font-normal text-accent-300 ${
            row
              ? "absolute top-full left-[32px] mt-[10px] whitespace-nowrap"
              : "mt-[10px] px-[10px]"
          }`}
        >
          {form.failed}
        </p>
      )}
    </div>
  );
};
