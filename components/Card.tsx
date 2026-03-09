import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "article" | "section";
};

export function Card({
  as: Component = "div",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={[
        "rounded-lg border border-border bg-surface p-4 shadow-sm",
        "sm:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className = "", children, ...props }: CardHeaderProps) {
  return (
    <div
      className={["mb-4 border-b border-border pb-3 sm:mb-6 sm:pb-4", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3";
};

export function CardTitle({
  as: Tag = "h2",
  className = "",
  children,
  ...props
}: CardTitleProps) {
  return (
    <Tag
      className={["text-lg font-semibold text-foreground sm:text-xl", className].join(" ")}
      {...props}
    >
      {children}
    </Tag>
  );
}

type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function CardContent({ className = "", children, ...props }: CardContentProps) {
  return (
    <div className={["text-foreground", className].join(" ")} {...props}>
      {children}
    </div>
  );
}
