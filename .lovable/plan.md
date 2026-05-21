# School Management Cashflow Builder — Build Plan

A single-page React app (Vite + Tailwind + shadcn/ui) with sidebar navigation, localStorage persistence, and XLSX export. No backend needed.

## Stack
- React + TypeScript (existing Vite template via `web_app` artifact)
- Tailwind CSS + shadcn/ui (cards, tabs, inputs, buttons, table, sidebar)
- `xlsx` (SheetJS) for Excel export
- `recharts` for the yearly net cashflow chart
- `date-fns` for month/term math
- Zustand (or React context + reducer) for state, persisted to `localStorage`

## Information architecture
Sidebar navigation with 4 sections:
1. **Setup** — term start dates (3 date pickers), pricing constants (editable: $10/mo, $25/term), fixed salaries (Director 1, Director 2, Developer), per-school annual computer donation ($5,000), custom expense line items (add/remove rows: label + monthly amount).
2. **Schools** — table + "Add school" form. Fields: name, total students, monthly subscribers, term subscribers. Inline validation: warn if students < 500 and mark school as **excluded** from revenue. Show penetration % = (monthly + term) / total students.
3. **Monthly view** — year + month selector (year ≥ 2026). Summary metric cards (Total revenue, Monthly sub revenue, Term sub revenue, Net cashflow). Detailed cashflow statement: revenue per school (monthly + term lump sum when month contains a term start), expenses (salaries, per-school donation $416.67, custom items), net cashflow colored green/red. Badge when month is a term-start month.
4. **Yearly view** — 12-month table (months as columns, lines as rows): revenue per school (monthly + term), totals, each expense line, net cashflow row. Annual totals column. Term-start month columns highlighted. Recharts bar chart of monthly net cashflow. Export to Excel button.

## Calculation rules
- Eligible school = totalStudents ≥ 500.
- Monthly revenue (per eligible school, every month) = monthlySubscribers × $10.
- Term revenue (per eligible school, only in months containing a term start date for that year) = termSubscribers × $25, collected once on that month.
- Donation expense = $5,000 / 12 = $416.67 per eligible school per month.
- Net cashflow = total revenue − (salaries + donations + custom expenses).
- Term-start months derived from the 3 configured dates; reused each year by month/day (year-agnostic) so the selected year always has 3 term months.

## Excel export (SheetJS)
- **Sheet 1 Overview**: term schedule, pricing, salaries, custom expenses, school list with eligibility flag and penetration %.
- **Sheet 2 Monthly cashflow**: rows = revenue lines, expense lines, net; columns = Jan–Dec + Annual total; term months marked in header.
- **Sheet 3 By-school breakdown**: per school per month — monthly sub revenue, term sub revenue, donation expense.
- Formatted with bold headers, currency number format, frozen first column.

## Persistence
Single `cashflow-state` key in localStorage holding: schools[], termStartDates[3], pricing, salaries, customExpenses[], selectedYear, selectedMonth. Hydrated on mount; debounced writes on change. Seeded with defaults (2 example schools, term dates 2026-01-12 / 2026-05-04 / 2026-09-07) on first load.

## Design
Clean SaaS aesthetic: white cards, subtle borders, neutral gray background, Inter font. Semantic tokens — green for revenue/positive, red for expenses/negative, blue for info badges (term-start). Responsive: sidebar collapses on tablet; tables horizontally scroll on small screens.

## File structure
```text
src/
  pages/
    Setup.tsx
    Schools.tsx
    MonthlyView.tsx
    YearlyView.tsx
  components/
    AppSidebar.tsx
    MetricCard.tsx
    CashflowChart.tsx
    SchoolForm.tsx
    ExpenseEditor.tsx
  lib/
    store.ts            (zustand + localStorage)
    calculations.ts     (revenue/expense/net helpers)
    export-xlsx.ts      (SheetJS workbook builder)
    constants.ts        (defaults, seed data)
  App.tsx               (router + sidebar layout)
  index.css             (semantic color tokens)
```

## Steps
1. Scaffold `web_app` artifact.
2. Install `xlsx`, `recharts`, `date-fns`, `zustand`.
3. Implement store + calculation helpers + seed defaults.
4. Build sidebar layout and 4 pages.
5. Implement XLSX export.
6. Polish: responsive, color tokens, validation messaging.
