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
  "hl-w-180px o-bg-transparent hl-font-mulish hl-text-16px hl-leading-1-2 o-font-normal hl-text-foreground hl-placeholder-text-foreground-90";
const FIELD_STACK =
  "o-w-full hl-rounded-16px hl-bg-foreground-0-06 hl-px-18px hl-py-14px hl-font-mulish hl-text-16px hl-leading-none o-font-normal hl-text-foreground hl-placeholder-text-foreground-70 hl-focus-bg-foreground-0-1 focus:o-outline-none";

const PILL_ROW =
  "hl-rounded-32px o-border-w-1 hl-border-color-var-hero-glass-border hl-bg-var-hero-glass hl-backdrop-blur-8px";
const PILL_STACK =
  "hl-rounded-24px o-border-w-1 hl-border-color-var-hero-glass-border hl-bg-var-hero-glass hl-backdrop-blur-8px";

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
        className={`o-m-0 o-flex o-items-center hl-font-mulish hl-text-16px hl-leading-1-2 o-font-normal hl-text-foreground ${
          row
            ? `hl-h-43px hl-px-32px ${PILL_ROW}`
            : `o-justify-center hl-px-18px hl-py-16px o-text-center ${PILL_STACK}`
        }`}
      >
        {form.done}
      </p>
    );
  }

  return (
    <div className="o-relative">
      <form
        onSubmit={onSubmit}
        aria-busy={status === "sending"}
        className={
          row
            ? `o-flex o-items-center hl-gap-25px hl-py-2px hl-pr-2px hl-pl-32px ${PILL_ROW}`
            : `o-flex o-flex-col hl-gap-10px hl-p-10px ${PILL_STACK}`
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
          className={row ? "o-shrink-0" : "o-w-full"}
        >
          <button
            type="submit"
            disabled={status === "sending"}
            className={
              row
                ? "o-flex o-w-full o-shrink-0 o-items-center o-justify-center hl-gap-8px hl-rounded-50px hl-py-2px hl-pr-28px hl-pl-2px disabled:o-cursor-progress"
                : "o-flex o-w-full o-items-center o-justify-center hl-gap-10px hl-rounded-50px hl-py-6px hl-pr-24px hl-pl-6px disabled:o-cursor-progress"
            }
            style={{ backgroundImage: "var(--gradient-hero-cta)" }}
          >
            <span className="o-relative o-block hl-size-39px o-shrink-0">
              <span className="o-absolute o-top-0 o-left-0 hl-size-39px hl-rounded-50px hl-bg-foreground" />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="o-absolute o-top-1/2 o-left-1/2 hl-size-23px hl-translate-x-1-2 hl-translate-y-1-2"
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
            <span className="hl-font-mulish hl-text-16px hl-leading-1-2 o-font-normal o-whitespace-nowrap hl-text-foreground">
              {status === "sending" ? form.sending : form.submit}
            </span>
          </button>
        </Hover>
      </form>

      {status === "failed" && (
        <p
          role="alert"
          className={`o-m-0 hl-font-mulish hl-text-14px hl-leading-1-3 o-font-normal hl-text-accent-300 ${
            row
              ? "o-absolute o-top-full hl-left-32px hl-mt-10px o-whitespace-nowrap"
              : "hl-mt-10px hl-px-10px"
          }`}
        >
          {form.failed}
        </p>
      )}
    </div>
  );
};
