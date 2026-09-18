// 📖 Docs: obsidian/frontend/components/ui.md

export interface GridLinesProps {
  className?: string;
}

const COLUMNS = [0, 1, 2, 3] as const;

/**
 * The five hairlines that rule the scene and the footer. Drawn as the borders
 * of a four-column grid rather than five free-floating lines, so anything laid
 * out on the same `grid-cols-4` inset lands on a line by construction — the
 * footer's CTA and links sit "20px right of line one / line four" this way.
 */
export const GridLines = ({ className = "" }: GridLinesProps) => (
  <div
    aria-hidden
    className={`o-pointer-events-none o-absolute cb-inset-x-8 o-inset-y-0 o-grid o-grid-cols-4 ${className}`}
  >
    {COLUMNS.map((column) => (
      <span
        key={column}
        className="o-border-l cb-border-foreground-30 cb-last-border-r"
      />
    ))}
  </div>
);
