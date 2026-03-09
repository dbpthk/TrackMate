import type { HTMLAttributes } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";

type ChartCardProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  children: React.ReactNode;
  /** Optional chart/visualization area - can be SVG, canvas, or custom content */
  chart?: React.ReactNode;
};

export function ChartCard({ title, children, chart, className = "", ...props }: ChartCardProps) {
  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
        {chart && (
          <div
            className="mt-4 min-h-[200px] rounded border border-border bg-surface-muted/50 p-4 sm:min-h-[240px]"
            role="img"
            aria-label="Chart visualization"
          >
            {chart}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
