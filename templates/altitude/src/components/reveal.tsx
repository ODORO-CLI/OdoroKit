import { useMemo } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   Word reveal.

   Opacity + blur, and deliberately NO translate: there is a film moving behind
   every line on this page, and a word that also slides reads as a second,
   competing motion. Words materialise in place instead.

   Two details that are the difference between expensive and cheap:
   · opacity lands early in the curve, so the word is solid while it is still
     de-blurring — that is what reads as depth rather than as a fade;
   · nothing here is clipped, because `overflow` shears a blur halo at the line
     box, which is the entire effect.
   ══════════════════════════════════════════════════════════════════════════ */

type Props = {
  text: string;
  /** Latched by the film clock. */
  show: boolean;
  /** ms between words. 75 for a title, ~22 for body copy. */
  stagger?: number;
  /** ms before the first word. Continue a second engine from the first's count
      so two designed lines still read as one sweep. */
  delay?: number;
  className?: string;
  as?: "h2" | "h3" | "p" | "span" | "div";
};

export function Reveal({
  text,
  show,
  stagger = 75,
  delay = 0,
  className = "",
  as: Tag = "span",
}: Props) {
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <Tag className={className} data-in={show ? "" : undefined}>
      {/* Each word is its own inline-block so it can carry its own delay —
          which also means a screen reader would meet the line as N separate
          boxes. So the sentence is present ONCE, intact and off-screen, and
          the animated pieces are hidden from assistive tech. The copy is in
          the document either way: styled invisible, never withheld. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span
            key={`${w}-${i}`}
            className="reveal-word"
            style={{ transitionDelay: `${delay + i * stagger}ms` }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </span>
    </Tag>
  );
}
