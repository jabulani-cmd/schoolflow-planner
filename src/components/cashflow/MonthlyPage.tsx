import { useStore } from "@/lib/cashflow/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { MetricCard } from "./MetricCard";
import { computeYear, fmt, fmt2, isEligible, MONTHS_FULL } from "@/lib/cashflow/calc";
import { cn } from "@/lib/utils";

export function MonthlyPage() {
  const state = useStore();
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, schools } = state;
  const year = computeYear(state);
  const m = year[selectedMonth];
  const eligible = schools.filter(isEligible);

  const years = [2026, 2027, 2028, 2029, 2030];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={String(selectedMonth)}
          onValueChange={(v) => setSelectedMonth(Number(v))}
        >
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MONTHS_FULL.map((mn, i) => (
              <SelectItem key={mn} value={String(i)}>{mn}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(selectedYear)}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {m.isTermMonth && (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Term-start month
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Opening balance" value={fmt(m.openingBalance)} tone={m.openingBalance >= 0 ? "positive" : "negative"} />
        <MetricCard label="Total revenue" value={fmt(m.totalRevenue)} tone="positive" />
        <MetricCard
          label="Net this month"
          value={fmt(m.net)}
          tone={m.net >= 0 ? "positive" : "negative"}
        />
        <MetricCard
          label="Closing balance"
          value={fmt(m.closingBalance)}
          tone={m.closingBalance >= 0 ? "positive" : "negative"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue — {MONTHS_FULL[selectedMonth]} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {eligible.length === 0 && (
            <p className="text-sm text-muted-foreground">No eligible schools.</p>
          )}
          {m.perSchool.map((p) => (
            <div key={p.school.id} className="space-y-1 border-b py-2 last:border-0">
              <div className="font-medium">{p.school.name}</div>
              <Row label="Monthly subscription" value={p.monthlyRevenue} tone="positive" />
              {m.isTermMonth && (
                <Row label="Term subscription (lump sum)" value={p.termRevenue} tone="positive" />
              )}
            </div>
          ))}
          <Row label="Total revenue" value={m.totalRevenue} bold tone="positive" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Row label="Director 1 salary" value={-state.pricing.director1Salary} tone="negative" />
          <Row label="Director 2 salary" value={-state.pricing.director2Salary} tone="negative" />
          <Row label="Developer salary" value={-state.pricing.developerSalary} tone="negative" />
          <Row
            label={`Computer donations (${eligible.length} school${eligible.length === 1 ? "" : "s"})`}
            value={-m.donations}
            tone="negative"
          />
          {state.customExpenses.map((e) => (
            <Row key={e.id} label={e.label || "Custom"} value={-e.amount} tone="negative" />
          ))}
          <Row label="Total expenses" value={-m.totalExpenses} bold tone="negative" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div className="text-base font-semibold">Net cashflow</div>
          <div
            className={cn(
              "text-2xl font-bold tabular-nums",
              m.net >= 0 ? "text-emerald-600" : "text-red-600",
            )}
          >
            {fmt(m.net)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label, value, bold, tone,
}: {
  label: string;
  value: number;
  bold?: boolean;
  tone?: "positive" | "negative";
}) {
  return (
    <div className={cn("flex items-center justify-between text-sm", bold && "border-t pt-2 font-semibold")}>
      <span>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          tone === "positive" && "text-emerald-600",
          tone === "negative" && "text-red-600",
        )}
      >
        {fmt2(value)}
      </span>
    </div>
  );
}
