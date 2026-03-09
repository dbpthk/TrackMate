import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] focus-visible:ring-primary",
  secondary:
    "bg-surface-muted text-foreground shadow-sm hover:bg-surface-muted/80 active:scale-[0.98] focus-visible:ring-primary",
  outline:
    "border border-border bg-surface text-foreground shadow-sm hover:bg-surface-muted hover:border-muted-foreground/50 active:scale-[0.98] focus-visible:ring-primary",
  ghost:
    "text-foreground hover:bg-surface-muted active:scale-[0.98] focus-visible:ring-primary",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98] focus-visible:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-md",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-11 px-6 text-base rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className = "",
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
