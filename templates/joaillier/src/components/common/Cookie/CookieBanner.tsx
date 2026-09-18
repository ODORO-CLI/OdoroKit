// 📖 Docs: obsidian/frontend/components/common.md
import { animated, useTransition } from "@react-spring/web";

import { CookieButton } from "./CookieButton";
import { useCookieStore } from "./cookieStore";

export const CookieBanner = () => {
  const consent = useCookieStore((s) => s.consent);
  const hydrated = useCookieStore((s) => s.hydrated);
  const modalOpen = useCookieStore((s) => s.modalOpen);
  const acceptAll = useCookieStore((s) => s.acceptAll);
  const rejectAll = useCookieStore((s) => s.rejectAll);
  const openModal = useCookieStore((s) => s.openModal);

  // Banner shows only after hydration confirmed no prior consent. Hidden while
  // the preferences modal is up so the two surfaces never compete for focus.
  const shouldShow = hydrated && consent === null && !modalOpen;

  // react-spring keeps the node mounted through the leave animation — no
  // manual mount/timeout juggling needed.
  const transitions = useTransition(shouldShow, {
    from: { opacity: 0, y: 24 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: 24 },
    config: { tension: 280, friction: 32 },
  });

  return transitions((style, show) =>
    show ? (
      <animated.section
        aria-label="Cookie consent"
        style={{
          opacity: style.opacity,
          transform: style.y.to((v) => `translateY(${v}px)`),
        }}
        className="o-fixed o-bottom-4 o-left-4 o-right-4 o-z-50 o-flex o-flex-col o-gap-3 o-rounded-xl o-border-w-1 jo-border-foreground-10 jo-bg-background-95 o-p-5 jo-font-sans jo-text-foreground o-shadow-2xl o-backdrop-blur-xl jo-sm-bottom-12 jo-sm-left-auto jo-sm-right-12 jo-sm-w-420px jo-sm-p-6"
      >
        <h2 className="o-text-base o-font-medium o-leading-snug sm:o-text-lg">
          This website uses cookies
        </h2>
        <p className="o-text-sm o-leading-relaxed jo-text-foreground-70">
          We use cookies to keep the site working, learn how it&apos;s used, and
          improve what we ship next. Accept everything, reject the non-essential,
          or pick category by category. See our{" "}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="o-underline o-underline-offset-2 jo-hover-text-foreground-70"
          >
            privacy policy
          </a>
          .
        </p>
        <div className="o-mt-1 o-flex o-flex-wrap o-items-center o-gap-2">
          <CookieButton onClick={acceptAll}>Accept all</CookieButton>
          <CookieButton variant="secondary" onClick={rejectAll}>
            Reject all
          </CookieButton>
          <button
            type="button"
            onClick={openModal}
            className="o-px-2 o-py-2 o-text-sm o-font-medium jo-leading-none jo-text-foreground o-underline o-underline-offset-2 jo-hover-text-foreground-70 jo-focus-visible-outline-2 jo-focus-visible-outline-offset-2 jo-focus-visible-outline-foreground"
          >
            Manage preferences
          </button>
        </div>
      </animated.section>
    ) : null,
  );
};
