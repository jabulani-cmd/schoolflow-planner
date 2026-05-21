import * as XLSX from "xlsx";
import type { AppState } from "./types";
import { computeYear, isEligible, penetration, MONTHS_FULL, termMonths } from "./calc";

export function exportXlsx(state: AppState) {
  const wb = XLSX.utils.book_new();
  const year = state.selectedYear;
  const tms = termMonths(state);
  const eligible = state.schools.filter(isEligible);
  const monthly = computeYear(state);

  // Sheet 1: Overview
  const overview: (string | number)[][] = [
    ["School Management Cashflow — Overview", "", "", ""],
    ["Year", year],
    [],
    ["Term Schedule"],
    ["Term 1 start", state.termDates.term1],
    ["Term 2 start", state.termDates.term2],
    ["Term 3 start", state.termDates.term3],
    [],
    ["Pricing"],
    ["Monthly plan ($/student/month)", state.pricing.monthlyPerStudent],
    ["Term plan ($/student/term)", state.pricing.termPerStudent],
    [],
    ["Fixed Expenses (monthly)"],
    ["Director 1 salary", state.pricing.director1Salary],
    ["Director 2 salary", state.pricing.director2Salary],
    ["Developer salary", state.pricing.developerSalary],
    ["Computer donation per school (annual)", state.pricing.annualDonationPerSchool],
    ["Computer donation per school (monthly)", state.pricing.annualDonationPerSchool / 12],
    [],
    ["Custom Expenses"],
    ["Label", "Monthly amount"],
    ...state.customExpenses.map((e) => [e.label, e.amount] as (string | number)[]),
    [],
    ["Schools"],
    ["Name", "Total students", "Monthly subs", "Term subs", "Penetration %", "Eligible (>=500)"],
    ...state.schools.map(
      (s) =>
        [
          s.name,
          s.totalStudents,
          s.monthlySubscribers,
          s.termSubscribers,
          Number(penetration(s).toFixed(1)),
          isEligible(s) ? "Yes" : "No",
        ] as (string | number)[],
    ),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(overview);
  ws1["!cols"] = [{ wch: 38 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Overview");

  // Sheet 2: Monthly cashflow
  const header = ["Line item", ...MONTHS_FULL.map((m, i) => (tms.includes(i) ? `${m} (Term)` : m)), "Annual"];
  const monthlyRevRow = ["Monthly subscription revenue", ...monthly.map((m) => m.monthlyRevenue)];
  monthlyRevRow.push(monthly.reduce((a, m) => a + m.monthlyRevenue, 0));
  const termRevRow = ["Term subscription revenue", ...monthly.map((m) => m.termRevenue)];
  termRevRow.push(monthly.reduce((a, m) => a + m.termRevenue, 0));
  const totalRevRow = ["Total revenue", ...monthly.map((m) => m.totalRevenue)];
  totalRevRow.push(monthly.reduce((a, m) => a + m.totalRevenue, 0));
  const d1 = ["Director 1 salary", ...monthly.map(() => state.pricing.director1Salary)];
  d1.push(state.pricing.director1Salary * 12);
  const d2 = ["Director 2 salary", ...monthly.map(() => state.pricing.director2Salary)];
  d2.push(state.pricing.director2Salary * 12);
  const dev = ["Developer salary", ...monthly.map(() => state.pricing.developerSalary)];
  dev.push(state.pricing.developerSalary * 12);
  const don = ["Computer donations", ...monthly.map((m) => m.donations)];
  don.push(monthly.reduce((a, m) => a + m.donations, 0));
  const cust = ["Custom expenses", ...monthly.map((m) => m.customExpenses)];
  cust.push(monthly.reduce((a, m) => a + m.customExpenses, 0));
  const totalExp = ["Total expenses", ...monthly.map((m) => m.totalExpenses)];
  totalExp.push(monthly.reduce((a, m) => a + m.totalExpenses, 0));
  const netRow = ["Net cashflow", ...monthly.map((m) => m.net)];
  netRow.push(monthly.reduce((a, m) => a + m.net, 0));
  const openRow = ["Opening balance", ...monthly.map((m) => m.openingBalance)];
  openRow.push(monthly[0].openingBalance);
  const closeRow = ["Closing balance (carry-over)", ...monthly.map((m) => m.closingBalance)];
  closeRow.push(monthly[11].closingBalance);

  const cashflowData = [
    header,
    monthlyRevRow,
    termRevRow,
    totalRevRow,
    [],
    d1,
    d2,
    dev,
    don,
    cust,
    totalExp,
    [],
    netRow,
    [],
    openRow,
    closeRow,
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(cashflowData);
  ws2["!cols"] = [{ wch: 32 }, ...Array(13).fill({ wch: 14 })];
  XLSX.utils.book_append_sheet(wb, ws2, "Monthly Cashflow");

  // Sheet 3: By school
  const bySchoolRows: (string | number)[][] = [
    ["School", "Line", ...MONTHS_FULL, "Annual"],
  ];
  for (const school of state.schools) {
    if (!isEligible(school)) {
      bySchoolRows.push([school.name, "Excluded (<500 students)", ...Array(13).fill(0)]);
      continue;
    }
    const monthlyVals = monthly.map(
      () => school.monthlySubscribers * state.pricing.monthlyPerStudent,
    );
    const termVals = monthly.map((m) =>
      m.isTermMonth ? school.termSubscribers * state.pricing.termPerStudent : 0,
    );
    const donationVals = monthly.map(() => state.pricing.annualDonationPerSchool / 12);
    bySchoolRows.push([
      school.name,
      "Monthly sub revenue",
      ...monthlyVals,
      monthlyVals.reduce((a, b) => a + b, 0),
    ]);
    bySchoolRows.push([
      school.name,
      "Term sub revenue",
      ...termVals,
      termVals.reduce((a, b) => a + b, 0),
    ]);
    bySchoolRows.push([
      school.name,
      "Computer donation",
      ...donationVals,
      donationVals.reduce((a, b) => a + b, 0),
    ]);
  }
  const ws3 = XLSX.utils.aoa_to_sheet(bySchoolRows);
  ws3["!cols"] = [{ wch: 20 }, { wch: 24 }, ...Array(13).fill({ wch: 12 })];
  XLSX.utils.book_append_sheet(wb, ws3, "By School");

  XLSX.writeFile(wb, `cashflow-${year}.xlsx`);
}
