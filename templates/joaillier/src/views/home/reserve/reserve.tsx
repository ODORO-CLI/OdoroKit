/**
 * Reserve — GetLayers composition `altitude-cta`.
 *
 * Under a two-line display heading, ONE rounded translucent capsule holds the
 * whole enquiry: two unlabelled fields side by side on the left and a filled
 * action pill inset flush against the capsule's own right edge — a pill inside
 * a pill, which is what makes it read as one object rather than a form plus a
 * button. All the air is outside the capsule. Below the small breakpoint it
 * opens into a stacked card with a full-width action.
 *
 * The request goes to the starter's own `/api/contact` route, which logs it
 * server-side until `CONTACT_ENDPOINT` points at a real list.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import { useState, type FormEvent } from "react";
import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import { focusRing, hoverTiming } from "@/components/ui/action-link";
import { apiFetch } from "@/lib/api-client";
import { LINE_REVEAL, RISE } from "@/lib/motion/reveals";

import type { ReserveContent } from "./reserve.types";

type Status = "idle" | "sending" | "sent" | "error";

/** Between one heading line's arrival and the next, in ms. */
const LINE_DELAY = 140;

/** What the list receives alongside the name and the address. */
const MESSAGE = "Liste d'attente — prochaine édition ODORO";

const fieldClass = `jo-font-ui jo-text-body jo-leading-copy jo-text-foreground-accent jo-placeholder-text-foreground-accent-muted o-min-w-0 o-flex-1 o-bg-transparent jo-py-md o-outline-none jo-focus-visible-placeholder-text-foreground-accent-soft jo-max-md-border-line jo-max-md-border-b`;

export interface ReserveProps {
  content: ReserveContent;
}

export const Reserve = ({ content }: ReserveProps) => {
  const [status, setStatus] = useState<Status>("idle");

  /* Typed on `HTMLElement`: the handler is handed to `<Inview tag="form">`,
     whose attributes are the generic element's — the target is still the form. */
  const onSubmit = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    const data = new FormData(event.currentTarget as HTMLFormElement);
    setStatus("sending");
    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: MESSAGE,
        }),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="reserver"
      aria-labelledby="reserve-heading"
      className="jo-px-page jo-py-section jo-max-md-py-stack"
    >
      <div className="o-mx-auto o-flex jo-max-w-52rem o-flex-col o-items-center o-text-center">
        <h2
          id="reserve-heading"
          className="jo-text-headline jo-leading-headline jo-text-foreground-accent jo-font-display jo-max-md-text-40px jo-max-md-leading-40px"
        >
          {content.heading.map((line, index) => (
            <TextEngine
              key={line}
              tag="span"
              mode="once"
              delayIn={index * LINE_DELAY}
              className="o-block o-justify-center o-text-center"
              {...LINE_REVEAL}
            >
              {line}
            </TextEngine>
          ))}
        </h2>

        <Inview
          tag="p"
          mode="once"
          delayIn={240}
          className="jo-text-lead jo-leading-lead jo-text-foreground-accent-soft jo-font-ui jo-mt-lg jo-max-w-34rem"
          {...RISE}
        >
          {content.sub}
        </Inview>

        {status === "sent" ? (
          <Inview
            tag="p"
            role="status"
            mode="once"
            className="jo-border-line jo-bg-surface-glass jo-rounded-pill jo-text-lead jo-leading-lead jo-text-foreground-accent jo-font-ui jo-mt-xl o-w-full o-border-w-1 jo-px-xl jo-py-lg o-backdrop-blur-md jo-max-md-rounded-media"
            {...RISE}
          >
            {content.success}
          </Inview>
        ) : (
          <Inview
            tag="form"
            mode="once"
            delayIn={400}
            onSubmit={onSubmit}
            className="jo-border-line jo-bg-surface-glass jo-rounded-pill jo-mt-xl o-flex o-w-full o-items-center jo-gap-lg o-border-w-1 jo-p-xs jo-pl-xl o-backdrop-blur-md jo-max-md-rounded-media jo-max-md-flex-col jo-max-md-items-stretch jo-max-md-gap-md jo-max-md-p-lg"
            {...RISE}
          >
              <label htmlFor="reserve-name" className="o-sr-only">
                {content.fields.name}
              </label>
              <input
                id="reserve-name"
                name="name"
                type="text"
                required
                autoComplete="given-name"
                placeholder={content.fields.name}
                className={fieldClass}
              />

              <label htmlFor="reserve-email" className="o-sr-only">
                {content.fields.email}
              </label>
              <input
                id="reserve-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={content.fields.email}
                className={fieldClass}
              />

              <button
                type="submit"
                disabled={status === "sending"}
                className={`jo-rounded-pill jo-bg-action-primary jo-text-action-primary-ink jo-font-ui jo-text-body jo-leading-body jo-hover-bg-foreground-accent o-shrink-0 o-cursor-pointer jo-px-xl jo-py-md o-uppercase jo-tracking-0-08em o-transition-colors jo-disabled-cursor-wait jo-disabled-opacity-70 ${hoverTiming} ${focusRing}`}
              >
                {content.action}
              </button>
          </Inview>
        )}

        {status === "error" ? (
          <p
            role="alert"
            className="jo-font-ui jo-text-body jo-leading-copy jo-text-foreground-silver jo-mt-md"
          >
            {content.error}
          </p>
        ) : null}
      </div>
    </section>
  );
};
