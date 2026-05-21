import { useStore } from "@/lib/cashflow/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { computeYear, fmt, isEligible, MONTHS, termMonths } from "@/lib/cashflow/calc";
import { exportXlsx } from "@/lib/cashflow/export";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";

export function YearlyPage() {
  const state = useStore();
  const months = computeYear(state);
  const tms = termMonths(state);
  const eligible = state.schools.filter(isEligible);
  const chartData = months.map((m, i) => ({ month: MONTHS[i], net: Math.round(m.net) }));
  const annual = (sel: (m: ReturnType<typeof computeYear>[number]) => number) =>
    months.reduce((a, m) => a + sel(m), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Year {state.selectedYear}</h2>
        <Button onClick={() => exportXlsx(state)}>
          <Download className="mr-2 h-4 w-4" /> Export to Excel
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Cashflow ({state.selectedYear})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-2 py-2 font-medium">Line item</th>
                {MONTHS.map((mn, i) => (
                  <th
                    key={mn}
                    className={cn(
                      "px-2 py-2 text-right font-medium",
                      tms.includes(i) && "bg-blue-50 text-blue-700",
                    )}
                  >
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
              <Row label={`Computer donations (${eligible.length})`} values={months.map((m) => m.donations)} tone="negative" />
              <Row label="Custom expenses" values={months.map((m) => m.customExpenses)} tone="negative" />
              <Row label="Total expenses" values={months.map((m) => m.totalExpenses)} tone="negative" bold />
              <tr><td colSpan={14} className="py-1"></td></tr>
              <Row label="Net cashflow" values={months.map((m) => m.net)} netHighlight bold />
              <tr><td colSpan={14} className="py-1"></td></tr>
              <Row label="Opening balance" values={months.map((m) => m.openingBalance)} netHighlight />
              <Row label="Closing balance (carry-over)" values={months.map((m) => m.closingBalance)} netHighlight bold />
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td className="px-2 py-2 font-semibold">Year-end balance</td>
                <td colSpan={12}></td>
                <td className={cn(
                  "px-2 py-2 text-right font-semibold tabular-nums",
                  months[11].closingBalance >= 0 ? "text-emerald-600" : "text-red-600",
                )}>
                  {fmt(months[11].closingBalance)}
                </td>
              </tr>
            </tfoot>
              <tr className="border-t">
                <td className="px-2 py-2 font-semibold">Annual net</td>
                <td colSpan={12}></td>
                <td className={cn(
                  "px-2 py-2 text-right font-semibold tabular-nums",
                  annual((m) => m.net) >= 0 ? "text-emerald-600" : "text-red-600",
                )}>
                  {fmt(annual((m) => m.net))}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Monthly net cashflow</CardTitle></CardHeader>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
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
