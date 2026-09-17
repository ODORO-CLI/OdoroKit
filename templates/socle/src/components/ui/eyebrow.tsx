// 📖 Docs: obsidian/frontend/components/common.md

/**
 * Section label — a small dot followed by a word or two. Figma reuses this
 * "Ellipse 108 + text" pair above every section (1484:1630, 1484:1633,
 * 1476:1545, 1469:1440, 1476:1563).
 *
 * The dot inherits the label colour, so a caller only sets `text-*` on the
 * root to switch between the dark and on-photograph variants. Pass `tag` when
 * the label is the section's real heading rather than a caption.
 */
export interface EyebrowProps {
  label: string;
  tag?: "p" | "h2" | "h3";
  id?: string;
  className?: string;
}

export const Eyebrow = ({ label, tag: Tag = "p", id, className }: EyebrowProps) => (
  <Tag id={id} className={`o-flex o-items-center o-gap-2.5 sn-leading-body ${className ?? ""}`}>
    <span aria-hidden="true" className="o-size-1.5 o-shrink-0 o-rounded-full o-bg-current" />
    {label}
  </Tag>
);
