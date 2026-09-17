// 📖 Docs: obsidian/frontend/components/common.md

/**
 * Underlined contact-form input — Figma "Frame 2147225517" (1484:1684).
 *
 * The design shows only the field name sitting on a rule, so the name doubles
 * as the placeholder; the real `<label>` stays in the accessibility tree.
 */
export interface TextFieldProps {
  name: string;
  label: string;
  type: "text" | "tel" | "email";
  autoComplete: string;
  required?: boolean;
}

export const TextField = ({
  name,
  label,
  type,
  autoComplete,
  required = true,
}: TextFieldProps) => (
  <div className="o-flex o-flex-1 o-items-center o-border-b sn-border-border-field o-pb-3">
    <label htmlFor={name} className="o-sr-only">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      autoComplete={autoComplete}
      required={required}
      placeholder={label}
      className="o-w-full o-bg-transparent sn-text-lead sn-leading-body sn-text-foreground o-outline-none sn-placeholder-text-foreground sn-focus-visible-placeholder-text-foreground-muted"
    />
  </div>
);
