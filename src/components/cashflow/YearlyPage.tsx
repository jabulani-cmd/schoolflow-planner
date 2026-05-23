import { useStore } from "@/lib/cashflow/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { computeMultiYear, fmt, isEligible, MONTHS, termMonths, type YearBreakdown } from "@/lib/cashflow/calc";
import { exportXlsx } from "@/lib/cashflow/export";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";

export function YearlyPage() {
  const state = useStore();
  const { startYear, setStartYear, startMonth, setStartMonth, yearsToProject, setYearsToProject } = state;
  const tms = termMonths(state);
  const eligible = state.schools.filter(isEligible);
  const years = computeMultiYear(state, startYear, yearsToProject);

  const chartData = years.flatMap((y) =>
    y.months.map((m) => ({
      label: `${MONTHS[m.month]} ${String(y.year).slice(2)}`,
      net: Math.round(m.net),
      closing: Math.round(m.closingBalance),
    })),
  );

  const grandRevenue = years.reduce((a, y) => a + y.totalRevenue, 0);
  const grandExpenses = years.reduce((a, y) => a + y.totalExpenses, 0);
  const grandNet = grandRevenue - grandExpenses;
  const finalBalance = years[years.length - 1].closingBalance;

  const yearOptions = [2026, 2027, 2028, 2029, 2030, 2031, 2032];
  const spanOptions = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label className="text-xs">Start month</Label>
            <Select value={String(startMonth)} onValueChange={(v) => setStartMonth(Number(v))}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((mn, i) => (<SelectItem key={mn} value={String(i)}>{mn}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Start year</Label>
            <Select value={String(startYear)} onValueChange={(v) => setStartYear(Number(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Years to project</Label>
            <Select value={String(yearsToProject)} onValueChange={(v) => setYearsToProject(Number(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {spanOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} year{n === 1 ? "" : "s"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {MONTHS[startMonth]} {startYear} – {years[years.length - 1] ? `${MONTHS[years[years.length - 1].months[years[years.length - 1].months.length - 1].month]} ${years[years.length - 1].year}` : ""}
          </div>
        </div>
        <Button onClick={() => exportXlsx(state)}>
          <Download className="mr-2 h-4 w-4" /> Export to Excel (with formulas)
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Multi-year summary</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-2 py-2 font-medium">Year</th>
                <th className="px-2 py-2 text-right font-medium">Opening</th>
                <th className="px-2 py-2 text-right font-medium">Revenue</th>
                <th className="px-2 py-2 text-right font-medium">Expenses</th>
                <th className="px-2 py-2 text-right font-medium">Net</th>
                <th className="px-2 py-2 text-right font-medium">Closing</th>
              </tr>
            </thead>
            <tbody>
              {years.map((y) => (
                <tr key={y.year} className="border-b">
                  <td className="px-2 py-2 font-medium">{y.year}</td>
                  <td className={cn("px-2 py-2 text-right tabular-nums", y.openingBalance >= 0 ? "text-emerald-600" : "text-red-600")}>{fmt(y.openingBalance)}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-emerald-600">{fmt(y.totalRevenue)}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-red-600">{fmt(y.totalExpenses)}</td>
                  <td className={cn("px-2 py-2 text-right tabular-nums font-medium", y.net >= 0 ? "text-emerald-600" : "text-red-600")}>{fmt(y.net)}</td>
                  <td className={cn("px-2 py-2 text-right tabular-nums font-semibold", y.closingBalance >= 0 ? "text-emerald-600" : "text-red-600")}>{fmt(y.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td className="px-2 py-2 font-semibold">Total</td>
                <td></td>
                <td className="px-2 py-2 text-right font-semibold tabular-nums text-emerald-600">{fmt(grandRevenue)}</td>
                <td className="px-2 py-2 text-right font-semibold tabular-nums text-red-600">{fmt(grandExpenses)}</td>
                <td className={cn("px-2 py-2 text-right font-semibold tabular-nums", grandNet >= 0 ? "text-emerald-600" : "text-red-600")}>{fmt(grandNet)}</td>
                <td className={cn("px-2 py-2 text-right font-semibold tabular-nums", finalBalance >= 0 ? "text-emerald-600" : "text-red-600")}>{fmt(finalBalance)}</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {years.map((y) => (
        <YearTable key={y.year} y={y} tms={tms} eligibleCount={eligible.length} state={state} />
      ))}

      <Card>
        <CardHeader><CardTitle>Monthly net cashflow ({MONTHS[startMonth]} {startYear} – {years[years.length - 1] ? `${MONTHS[years[years.length - 1].months[years[years.length - 1].months.length - 1].month]} ${years[years.length - 1].year}` : ""})</CardTitle></CardHeader>
        <CardContent style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(chartData.length / 24))} />
              <YAxis tickFormatter={(v) => fmt(v as number)} width={80} />
              <Tooltip formatter={(v) => fmt(v as number)} />
              <ReferenceLine y={0} stroke="#888" />
              <Bar dataKey="net">
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.net >= 0 ? "#10b981" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function YearTable({
  y, tms, eligibleCount, state,
}: {
  y: YearBreakdown;
  tms: number[];
  eligibleCount: number;
  state: import("@/lib/cashflow/types").AppState;
}) {
  const months = y.months;
  return (
    <Card>
      <CardHeader><CardTitle>Cashflow — {y.year}</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-2 py-2 font-medium">Line item</th>
              {MONTHS.map((mn, i) => (
                <th key={mn} className={cn("px-2 py-2 text-right font-medium", tms.includes(i) && "bg-blue-50 text-blue-700")}>
                  {mn}
                  {tms.includes(i) && <div className="text-[10px]">Term</div>}
                </th>
              ))}
              <th className="px-2 py-2 text-right font-semibold">Annual</th>
            </tr>
          </thead>
          <tbody>
            <Row label="Monthly sub revenue" values={months.map((m) => m.monthlyRevenue)} tone="positive" />
            <Row label="Term sub revenue" values={months.map((m) => m.termRevenue)} tone="positive" />
            <Row label="Total revenue" values={months.map((m) => m.totalRevenue)} tone="positive" bold />
            <tr><td colSpan={14} className="py-1"></td></tr>
            <Row label="Director 1 salary" values={months.map(() => state.pricing.director1Salary)} tone="negative" />
            <Row label="Director 2 salary" values={months.map(() => state.pricing.director2Salary)} tone="negative" />
            <Row label="Developer salary" values={months.map(() => state.pricing.developerSalary)} tone="negative" />
            <Row label={`Computer donations (${eligibleCount})`} values={months.map((m) => m.donations)} tone="negative" />
            <Row label="Custom expenses" values={months.map((m) => m.customExpenses)} tone="negative" />
            <Row label="Total expenses" values={months.map((m) => m.totalExpenses)} tone="negative" bold />
            <tr><td colSpan={14} className="py-1"></td></tr>
            <Row label="Net cashflow" values={months.map((m) => m.net)} netHighlight bold />
            <Row label="Opening balance" values={months.map((m) => m.openingBalance)} netHighlight />
            <Row label="Closing balance (carry-over)" values={months.map((m) => m.closingBalance)} netHighlight bold />
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function Row({
  label, values, tone, bold, netHighlight,
}: {
  label: string;
  values: number[];
  tone?: "positive" | "negative";
  bold?: boolean;
  netHighlight?: boolean;
}) {
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <tr className={cn(bold && "border-t font-semibold")}>
      <td className="px-2 py-1.5">{label}</td>
      {values.map((v, i) => {
        const cls = netHighlight
          ? v >= 0 ? "text-emerald-600" : "text-red-600"
          : tone === "positive" ? "text-emerald-600"
          : tone === "negative" ? "text-red-600" : "";
        return (
          <td key={i} className={cn("px-2 py-1.5 text-right tabular-nums", cls)}>
            {fmt(v)}
          </td>
        );
      })}
      <td className={cn(
        "px-2 py-1.5 text-right font-semibold tabular-nums",
        netHighlight
          ? total >= 0 ? "text-emerald-600" : "text-red-600"
          : tone === "positive" ? "text-emerald-600"
          : tone === "negative" ? "text-red-600" : "",
      )}>
        {fmt(total)}
      </td>
    </tr>
  );
}
