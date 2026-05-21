import { useStore } from "@/lib/cashflow/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

export function SetupPage() {
  const {
    pricing,
    setPricing,
    termDates,
    setTermDates,
    customExpenses,
    addExpense,
    updateExpense,
    removeExpense,
  } = useStore();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Term Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Term 1 start</Label>
            <Input
              type="date"
              value={termDates.term1}
              onChange={(e) => setTermDates({ term1: e.target.value })}
            />
          </div>
          <div>
            <Label>Term 2 start</Label>
            <Input
              type="date"
              value={termDates.term2}
              onChange={(e) => setTermDates({ term2: e.target.value })}
            />
          </div>
          <div>
            <Label>Term 3 start</Label>
            <Input
              type="date"
              value={termDates.term3}
              onChange={(e) => setTermDates({ term3: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <NumberField
            label="Monthly plan ($/student/mo)"
            value={pricing.monthlyPerStudent}
            onChange={(v) => setPricing({ monthlyPerStudent: v })}
          />
          <NumberField
            label="Term plan ($/student/term)"
            value={pricing.termPerStudent}
            onChange={(v) => setPricing({ termPerStudent: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fixed Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <NumberField
            label="Director 1 salary"
            value={pricing.director1Salary}
            onChange={(v) => setPricing({ director1Salary: v })}
          />
          <NumberField
            label="Director 2 salary"
            value={pricing.director2Salary}
            onChange={(v) => setPricing({ director2Salary: v })}
          />
          <NumberField
            label="Developer salary"
            value={pricing.developerSalary}
            onChange={(v) => setPricing({ developerSalary: v })}
          />
          <NumberField
            label="Computer donation per school / year"
            value={pricing.annualDonationPerSchool}
            onChange={(v) => setPricing({ annualDonationPerSchool: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Custom Expenses
            <Button
              size="sm"
              variant="outline"
              onClick={() => addExpense({ label: "New expense", amount: 0 })}
            >
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {customExpenses.length === 0 && (
            <p className="text-sm text-muted-foreground">No custom expenses yet.</p>
          )}
          {customExpenses.map((e) => (
            <div key={e.id} className="flex items-center gap-2">
              <Input
                value={e.label}
                onChange={(ev) => updateExpense(e.id, { label: ev.target.value })}
                placeholder="Label"
              />
              <Input
                className="w-32"
                type="number"
                value={e.amount}
                onChange={(ev) =>
                  updateExpense(e.id, { amount: Number(ev.target.value) || 0 })
                }
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeExpense(e.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}
