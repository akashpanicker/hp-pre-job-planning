import React from "react";

/* ── Reusable sticky footer bar ──────────────────────────── */

interface StickyFooterProps {
  children: React.ReactNode;
  /** Controls how buttons are distributed: "between" or "end" */
  justify?: "between" | "end";
}

export function StickyFooter({ children, justify = "end" }: StickyFooterProps) {
  return (
    <div
      className="shrink-0"
      style={{
        position: "sticky",
        bottom: 0,
        padding: "16px 24px",
        backgroundColor: "var(--color-surface-1)",
        borderTop: "var(--border-default)",
        zIndex: 10,
      }}
    >
      <div
        className="flex items-center gap-3"
        style={{
          justifyContent: justify === "between" ? "space-between" : "flex-end",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Standardised footer button ──────────────────────────── */

interface FooterButtonProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: "secondary" | "primary";
  disabled?: boolean;
}

const SECONDARY: React.CSSProperties = {
  backgroundColor: "var(--color-surface-5)",
  border: "none",
  borderRadius: 6,
  padding: "8px 17px",
  color: "var(--color-text-secondary)",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "Inter, sans-serif",
};

const PRIMARY: React.CSSProperties = {
  backgroundColor: "var(--color-brand)",
  border: "none",
  borderRadius: 6,
  padding: "8px 16px",
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "Inter, sans-serif",
};

export function FooterButton({
  label,
  icon,
  onClick,
  variant = "secondary",
  disabled = false,
}: FooterButtonProps) {
  const isPrimary = variant === "primary";
  
  // Disabled styles
  const disabledStyle: React.CSSProperties = {
    backgroundColor: "var(--color-surface-4)",
    border: "none",
    borderRadius: 6,
    padding: "8px 16px",
    color: "var(--color-text-muted)",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "Inter, sans-serif",
    cursor: "not-allowed",
    opacity: 0.5,
  };
  
  const baseStyle = disabled ? disabledStyle : (isPrimary ? PRIMARY : SECONDARY);
  const hoverBg = isPrimary ? "var(--color-brand-hover)" : "var(--color-surface-4)";
  const restBg = isPrimary ? "var(--color-brand)" : "var(--color-surface-5)";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={disabled ? "flex items-center gap-2" : "cursor-pointer flex items-center gap-2"}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = restBg;
      }}
      disabled={disabled}
    >
      {icon}
      {label}
    </button>
  );
}