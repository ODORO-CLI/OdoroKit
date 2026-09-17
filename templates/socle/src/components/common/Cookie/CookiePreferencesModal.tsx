// 📖 Docs: obsidian/frontend/components/common.md
import { useEffect, useRef, useState } from "react";
import { animated, useSpring, useTransition } from "@react-spring/web";

import { useScroll } from "@/hooks/smooth-scroll/use-scroll";

import { CookieButton } from "./CookieButton";
import { useCookieStore } from "./cookieStore";

type CategoryKey = "necessary" | "analytics" | "marketing";

interface Category {
  key: CategoryKey;
  title: string;
  body: string;
  required?: boolean;
}

const CATEGORIES: Category[] = [
  {
    key: "necessary",
    title: "Strictement nécessaires",
    body: "Indispensables au fonctionnement du site : connexion, sécurité, navigation. Ils ne peuvent pas être désactivés.",
    required: true,
  },
  {
    key: "analytics",
    title: "Mesure d'audience",
    body: "Statistiques d'usage anonymisées, pour savoir quelles pages aident et lesquelles échouent. Aucun profil personnel n'est constitué.",
  },
  {
    key: "marketing",
    title: "Marketing",
    body: "Nous permet de mesurer la performance des annonces et de vous reproposer un contenu laissé en cours de lecture. Désactivable à tout moment.",
  },
];

const TITLE_ID = "cookie-preferences-title";

export const CookiePreferencesModal = () => {
  const open = useCookieStore((s) => s.modalOpen);
  const consent = useCookieStore((s) => s.consent);
  const closeModal = useCookieStore((s) => s.closeModal);
  const acceptAll = useCookieStore((s) => s.acceptAll);
  const rejectAll = useCookieStore((s) => s.rejectAll);
  const savePreferences = useCookieStore((s) => s.savePreferences);

  const stopScroll = useScroll((s) => s.stop);
  const startScroll = useScroll((s) => s.start);

  // Pre-fill toggles as ON when no prior decision exists. Once a user has
  // saved a choice, that choice wins.
  const [analytics, setAnalytics] = useState<boolean>(consent?.analytics ?? true);
  const [marketing, setMarketing] = useState<boolean>(consent?.marketing ?? true);

  // Re-seed local toggles every time the modal opens so users see their saved
  // state, not whatever was in flight from a previous open.
  useEffect(() => {
    if (!open) return;
    setAnalytics(consent?.analytics ?? true);
    setMarketing(consent?.marketing ?? true);
  }, [open, consent]);

  // ESC closes; lock Lenis scroll while open; restore focus to the opener.
  const triggerRef = useRef<Element | null>(null);
  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;
    stopScroll();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      startScroll();
      const t = triggerRef.current as HTMLElement | null;
      if (t && typeof t.focus === "function") t.focus();
    };
  }, [open, closeModal, stopScroll, startScroll]);

  const handleSave = () => savePreferences({ analytics, marketing });

  // Spring-driven mount/unmount for backdrop + panel.
  const transitions = useTransition(open, {
    from: { opacity: 0, scale: 0.94 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0.94 },
    config: { tension: 320, friction: 32 },
  });

  return transitions((style, isOpen) =>
    isOpen ? (
      <animated.div
        className="o-fixed o-inset-0 sn-z-100 sn-font-sans"
        style={{ opacity: style.opacity }}
      >
        <div
          aria-hidden
          onMouseDown={closeModal}
          className="o-absolute o-inset-0 sn-bg-black-40 o-backdrop-blur-sm"
        />
        <animated.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={TITLE_ID}
          style={{
            transform: style.scale.to((s) => `translate(-50%, -50%) scale(${s})`),
          }}
          className="o-absolute o-left-1/2 o-top-1/2 o-flex sn-max-h-calc-100dvh-1-5rem sn-w-calc-100vw-1-5rem sn-max-w-560px o-flex-col o-gap-5 o-overflow-hidden o-rounded-xl o-border-w-1 sn-border-foreground-10 sn-bg-background o-p-5 sn-text-foreground o-shadow-2xl sm:o-p-7"
        >
          <header className="o-flex o-items-start o-justify-between o-gap-3">
            <h2 id={TITLE_ID} className="o-text-xl o-font-medium o-leading-tight">
              Préférences de cookies
            </h2>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Fermer les préférences de cookies"
              className="o-flex o-h-8 o-w-8 o-shrink-0 o-items-center o-justify-center o-rounded-lg o-border-w-1 sn-border-foreground-10 sn-text-foreground sn-hover-bg-foreground-5 sn-focus-visible-outline-2 sn-focus-visible-outline-offset-2 sn-focus-visible-outline-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>

          <p className="o-text-sm o-leading-relaxed sn-text-foreground-60">
            Choisissez les catégories de cookies que nous pouvons utiliser. Vous
            pouvez modifier ce choix à tout moment. Voir notre{" "}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="sn-text-foreground o-underline o-underline-offset-2"
            >
              politique de confidentialité
            </a>
            .
          </p>

          <div className="o-flex o-min-h-0 o-flex-1 o-flex-col o-gap-3 o-overflow-y-auto o-py-1">
            {CATEGORIES.map((c) => {
              const value =
                c.key === "necessary"
                  ? true
                  : c.key === "analytics"
                    ? analytics
                    : marketing;
              const setValue =
                c.key === "analytics"
                  ? setAnalytics
                  : c.key === "marketing"
                    ? setMarketing
                    : undefined;
              return (
                <div
                  key={c.key}
                  className="o-flex o-items-start o-justify-between o-gap-4 sn-rounded-10px o-border-w-1 sn-border-foreground-10 o-px-4 o-py-3.5"
                >
                  <div className="o-flex o-min-w-0 o-flex-col o-gap-1">
                    <h3 className="o-text-sm o-font-medium o-leading-snug">{c.title}</h3>
                    <p className="o-text-xs o-leading-relaxed sn-text-foreground-60">
                      {c.body}
                    </p>
                  </div>
                  <Toggle
                    on={value}
                    disabled={c.required}
                    label={c.title}
                    onChange={setValue ? () => setValue((v) => !v) : undefined}
                  />
                </div>
              );
            })}
          </div>

          <footer className="o-mt-1 o-flex o-flex-col-reverse o-gap-2 sm:o-flex-row sm:o-items-center sm:o-justify-between">
            <CookieButton variant="secondary" onClick={rejectAll}>
              Tout refuser
            </CookieButton>
            <div className="o-flex o-flex-col-reverse o-gap-2 sm:o-flex-row sm:o-items-center">
              <CookieButton variant="secondary" onClick={handleSave}>
                Enregistrer mes choix
              </CookieButton>
              <CookieButton onClick={acceptAll}>Tout accepter</CookieButton>
            </div>
          </footer>
        </animated.div>
      </animated.div>
    ) : null,
  );
};

// ─── Toggle ──────────────────────────────────────────────────────────────────

interface ToggleProps {
  on: boolean;
  disabled?: boolean;
  onChange?: () => void;
  label: string;
}

const Toggle = ({ on, disabled, onChange, label }: ToggleProps) => {
  // Knob slides on a spring — track colour snaps (a state change, not motion).
  const knob = useSpring({ x: on ? 20 : 0, config: { tension: 320, friction: 26 } });

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onChange}
      className={`o-relative o-h-6 o-w-11 o-shrink-0 o-rounded-full sn-focus-visible-outline-2 sn-focus-visible-outline-offset-2 sn-focus-visible-outline-foreground ${
        on ? "sn-bg-foreground" : "sn-bg-foreground-15"
      } ${disabled ? "o-cursor-not-allowed o-opacity-55" : "o-cursor-pointer"}`}
    >
      <animated.span
        style={{ transform: knob.x.to((v) => `translateX(${v}px)`) }}
        className="o-absolute sn-left-3px sn-top-3px o-block sn-h-18px sn-w-18px o-rounded-full sn-bg-background sn-shadow"
      />
    </button>
  );
};
