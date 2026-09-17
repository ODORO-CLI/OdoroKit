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
        aria-label="Consentement aux cookies"
        style={{
          opacity: style.opacity,
          transform: style.y.to((v) => `translateY(${v}px)`),
        }}
        className="o-fixed o-bottom-4 o-left-4 o-right-4 o-z-50 o-flex o-flex-col o-gap-3 o-rounded-xl o-border-w-1 sn-border-foreground-10 sn-bg-background-95 o-p-5 sn-font-sans sn-text-foreground o-shadow-2xl o-backdrop-blur-xl sm:o-bottom-12 sm:o-left-auto sm:o-right-12 sn-sm-w-420px sm:o-p-6"
      >
        <h2 className="o-text-base o-font-medium o-leading-snug sm:o-text-lg">
          Ce site utilise des cookies
        </h2>
        <p className="o-text-sm o-leading-relaxed sn-text-foreground-70">
          Nous utilisons des cookies pour faire fonctionner le site, comprendre
          son usage et améliorer ce que nous publions. Vous pouvez tout accepter,
          refuser ce qui n&apos;est pas nécessaire, ou choisir catégorie par
          catégorie. Voir notre{" "}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="o-underline o-underline-offset-2 sn-hover-text-foreground-70"
          >
            politique de confidentialité
          </a>
          .
        </p>
        <div className="o-mt-1 o-flex o-flex-wrap o-items-center o-gap-2">
          <CookieButton onClick={acceptAll}>Tout accepter</CookieButton>
          <CookieButton variant="secondary" onClick={rejectAll}>
            Tout refuser
          </CookieButton>
          <button
            type="button"
            onClick={openModal}
            className="o-px-2 o-py-2 o-text-sm o-font-medium sn-leading-none sn-text-foreground o-underline o-underline-offset-2 sn-hover-text-foreground-70 sn-focus-visible-outline-2 sn-focus-visible-outline-offset-2 sn-focus-visible-outline-foreground"
          >
            Gérer mes préférences
          </button>
        </div>
      </animated.section>
    ) : null,
  );
};
