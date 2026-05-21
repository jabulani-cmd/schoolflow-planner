import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "info";
}) {
  const toneClass = {
    neutral: "text-foreground",
    positive: "text-emerald-600",
    negative: "text-red-600",
    info: "text-blue-600",
  }[tone];
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className={cn("mt-2 text-2xl font-semibold tabular-nums", toneClass)}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
