import * as XLSX from "xlsx";
import type { AppState } from "./types";
import { isEligible, MONTHS_FULL, termMonths } from "./calc";

type WS = Record<string, unknown> & { "!ref"?: string; "!cols"?: { wch: number }[] };

const addr = (c: number, r: number) => XLSX.utils.encode_cell({ c, r });
const col = (c: number) => XLSX.utils.encode_col(c);
const CUR = '"$"#,##0;[Red]("$"#,##0)';

function setVal(ws: WS, c: number, r: number, v: string | number) {
  ws[addr(c, r)] = typeof v === "number"
    ? { t: "n", v, z: CUR }
    : { t: "s", v };
}
function setLabel(ws: WS, c: number, r: number, v: string, bold = false) {
  ws[addr(c, r)] = bold ? { t: "s", v, s: { font: { bold: true } } } : { t: "s", v };
}
function setNum(ws: WS, c: number, r: number, v: number, fmt = CUR) {
  ws[addr(c, r)] = { t: "n", v, z: fmt };
}
function setFormula(ws: WS, c: number, r: number, f: string, fmt = CUR) {
  ws[addr(c, r)] = { t: "n", f, z: fmt };
}
function finalize(ws: WS, maxC: number, maxR: number) {
  ws["!ref"] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: maxC, r: maxR } });
}

/**
 * Multi-sheet workbook with live formulas:
 *  - "Assumptions": all editable inputs
 *  - "Year_YYYY":   per-year cashflow referencing Assumptions + prior year
 *  - "Summary":     year-by-year totals referencing each year sheet
 */
export function exportXlsx(state: AppState) {
  const wb = XLSX.utils.book_new();
  const startYear = state.selectedYear;
  const count = Math.max(1, state.yearsToProject || 1);
  const tms = termMonths(state); // 0-indexed
  const schools = state.schools;
  const customExp = state.customExpenses;

  // ---------- Assumptions sheet ----------
  const a: WS = {};
  // Pricing (B4, B5)
  setLabel(a, 0, 0, "ASSUMPTIONS — edit any blue value to recalculate", true);
  setLabel(a, 0, 2, "Pricing", true);
  setLabel(a, 0, 3, "Monthly price ($/student/month)");
  setNum(a, 1, 3, state.pricing.monthlyPerStudent);
  setLabel(a, 0, 4, "Term price ($/student/term)");
  setNum(a, 1, 4, state.pricing.termPerStudent);

  // Salaries (B8, B9, B10)
  setLabel(a, 0, 6, "Fixed monthly salaries", true);
  setLabel(a, 0, 7, "Director 1");
  setNum(a, 1, 7, state.pricing.director1Salary);
  setLabel(a, 0, 8, "Director 2");
  setNum(a, 1, 8, state.pricing.director2Salary);
  setLabel(a, 0, 9, "Developer");
  setNum(a, 1, 9, state.pricing.developerSalary);

  // Donations (B13 annual, B14 monthly formula)
  setLabel(a, 0, 11, "Computer donation per school", true);
  setLabel(a, 0, 12, "Annual ($/school)");
  setNum(a, 1, 12, state.pricing.annualDonationPerSchool);
  setLabel(a, 0, 13, "Monthly ($/school)");
  setFormula(a, 1, 13, "B13/12");

  // Term months (B17, B18, B19) - 1-indexed
  setLabel(a, 0, 15, "Term-start months (1-12)", true);
  setLabel(a, 0, 16, "Term 1");
  setNum(a, 1, 16, tms[0] + 1, "0");
  setLabel(a, 0, 17, "Term 2");
  setNum(a, 1, 17, tms[1] + 1, "0");
  setLabel(a, 0, 18, "Term 3");
  setNum(a, 1, 18, tms[2] + 1, "0");

  // Schools starting row index 21 (Excel row 22 header, row 23 first school)
  const schoolsHeaderR = 21;
  setLabel(a, 0, schoolsHeaderR, "Schools", true);
  const schoolColsR = schoolsHeaderR + 1;
  ["Name", "Total students", "Monthly subs", "Term subs", "Eligible (>=500)"].forEach((h, i) =>
    setLabel(a, i, schoolColsR, h, true),
  );
  const firstSchoolR = schoolColsR + 1; // 0-indexed row
  schools.forEach((s, i) => {
    const r = firstSchoolR + i;
    setLabel(a, 0, r, s.name);
    setNum(a, 1, r, s.totalStudents, "0");
    setNum(a, 2, r, s.monthlySubscribers, "0");
    setNum(a, 3, r, s.termSubscribers, "0");
    setFormula(a, 4, r, `IF(B${r + 1}>=500,1,0)`, "0");
  });
  const lastSchoolR = firstSchoolR + schools.length - 1;
  const eligibleCountR = lastSchoolR + 2;
  setLabel(a, 0, eligibleCountR, "Eligible school count", true);
  setFormula(
    a,
    1,
    eligibleCountR,
    schools.length > 0 ? `SUM(E${firstSchoolR + 1}:E${lastSchoolR + 1})` : "0",
    "0",
  );

  // Custom expenses
  const customHeaderR = eligibleCountR + 2;
  setLabel(a, 0, customHeaderR, "Custom monthly expenses", true);
  setLabel(a, 0, customHeaderR + 1, "Label", true);
  setLabel(a, 1, customHeaderR + 1, "Monthly amount", true);
  const firstCustomR = customHeaderR + 2;
  customExp.forEach((e, i) => {
    setLabel(a, 0, firstCustomR + i, e.label || `Custom ${i + 1}`);
    setNum(a, 1, firstCustomR + i, e.amount);
  });
  const lastCustomR = firstCustomR + Math.max(customExp.length, 1) - 1;
  const customTotalR = lastCustomR + 1;
  setLabel(a, 0, customTotalR, "Total custom (monthly)", true);
  setFormula(
    a,
    1,
    customTotalR,
    customExp.length > 0 ? `SUM(B${firstCustomR + 1}:B${lastCustomR + 1})` : "0",
  );

  a["!cols"] = [{ wch: 40 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 18 }];
  finalize(a, 4, customTotalR);
  XLSX.utils.book_append_sheet(wb, a, "Assumptions");

  // Cell references (Assumptions, A1 style with $ for absolute)
  const A = (cell: string) => `Assumptions!${cell}`;
  const REF = {
    monthlyPrice: A("$B$4"),
    termPrice: A("$B$5"),
    d1: A("$B$8"),
    d2: A("$B$9"),
    dev: A("$B$10"),
    donationMonthly: A("$B$14"),
    term1: A("$B$17"),
    term2: A("$B$18"),
    term3: A("$B$19"),
    eligibleCount: A(`$B$${eligibleCountR + 1}`),
    customTotal: A(`$B$${customTotalR + 1}`),
    schoolRow: (i: number) => firstSchoolR + i + 1, // 1-indexed Excel row
  };

  // ---------- Year sheets ----------
  const yearSheetNames: string[] = [];
  let captured: { totalRevR: number; totalExpR: number; netR: number; openR: number; closeR: number } | null = null;
  for (let yi = 0; yi < count; yi++) {
    const year = startYear + yi;
    const sheetName = `Year_${year}`;
    yearSheetNames.push(sheetName);
    const ws: WS = {};
    let r = 0;

    // Header
    setLabel(ws, 0, r, `Cashflow — ${year}`, true);
    r += 1;

    // Row r: header columns
    setLabel(ws, 0, r, "Line item", true);
    for (let m = 0; m < 12; m++) setLabel(ws, 1 + m, r, MONTHS_FULL[m], true);
    setLabel(ws, 13, r, "Annual", true);
    const headerR = r;
    r += 1;

    // Term flag row (Excel row index = r, 1-indexed = r+1)
    setLabel(ws, 0, r, "Term-start flag");
    for (let m = 0; m < 12; m++) {
      const mo = m + 1;
      setFormula(
        ws,
        1 + m,
        r,
        `IF(OR(${mo}=${REF.term1},${mo}=${REF.term2},${mo}=${REF.term3}),1,0)`,
        "0",
      );
    }
    const termFlagExcelR = r + 1;
    r += 2; // blank line

    // Per-school revenue rows
    const monthlyRevRows: number[] = []; // Excel 1-indexed rows for SUM
    const termRevRows: number[] = [];
    schools.forEach((s, i) => {
      const sRow = REF.schoolRow(i);
      // Monthly subscription revenue per school
      setLabel(ws, 0, r, `${s.name} — monthly`);
      for (let m = 0; m < 12; m++) {
        setFormula(
          ws,
          1 + m,
          r,
          `${A(`$E$${sRow}`)}*${A(`$C$${sRow}`)}*${REF.monthlyPrice}`,
        );
      }
      setFormula(ws, 13, r, `SUM(B${r + 1}:M${r + 1})`);
      monthlyRevRows.push(r + 1);
      r += 1;

      // Term revenue per school (only when term flag = 1)
      setLabel(ws, 0, r, `${s.name} — term`);
      for (let m = 0; m < 12; m++) {
        const colL = col(1 + m);
        setFormula(
          ws,
          1 + m,
          r,
          `${A(`$E$${sRow}`)}*${A(`$D$${sRow}`)}*${REF.termPrice}*${colL}$${termFlagExcelR}`,
        );
      }
      setFormula(ws, 13, r, `SUM(B${r + 1}:M${r + 1})`);
      termRevRows.push(r + 1);
      r += 1;
    });

    // Totals: monthly rev, term rev, total rev
    const sumRows = (rows: number[], c: number) =>
      rows.length === 0 ? "0" : rows.map((rr) => `${col(c)}${rr}`).join("+");

    setLabel(ws, 0, r, "Total monthly subscription revenue", true);
    for (let m = 0; m < 12; m++) setFormula(ws, 1 + m, r, sumRows(monthlyRevRows, 1 + m));
    setFormula(ws, 13, r, `SUM(B${r + 1}:M${r + 1})`);
    const totalMonthlyRevR = r + 1;
    r += 1;

    setLabel(ws, 0, r, "Total term subscription revenue", true);
    for (let m = 0; m < 12; m++) setFormula(ws, 1 + m, r, sumRows(termRevRows, 1 + m));
    setFormula(ws, 13, r, `SUM(B${r + 1}:M${r + 1})`);
    const totalTermRevR = r + 1;
    r += 1;

    setLabel(ws, 0, r, "Total revenue", true);
    for (let m = 0; m < 12; m++) {
      const c = col(1 + m);
      setFormula(ws, 1 + m, r, `${c}${totalMonthlyRevR}+${c}${totalTermRevR}`);
    }
    setFormula(ws, 13, r, `SUM(B${r + 1}:M${r + 1})`);
    const totalRevR = r + 1;
    r += 2;

    // Expenses
    const expenseRefs: number[] = [];
    const addExpenseRow = (label: string, perMonthFormula: (colLetter: string) => string) => {
      setLabel(ws, 0, r, label);
      for (let m = 0; m < 12; m++) {
        setFormula(ws, 1 + m, r, perMonthFormula(col(1 + m)));
      }
      setFormula(ws, 13, r, `SUM(B${r + 1}:M${r + 1})`);
      expenseRefs.push(r + 1);
      r += 1;
    };
    addExpenseRow("Director 1 salary", () => REF.d1);
    addExpenseRow("Director 2 salary", () => REF.d2);
    addExpenseRow("Developer salary", () => REF.dev);
    addExpenseRow("Computer donations", () => `${REF.eligibleCount}*${REF.donationMonthly}`);
    addExpenseRow("Custom expenses", () => REF.customTotal);

    setLabel(ws, 0, r, "Total expenses", true);
    for (let m = 0; m < 12; m++) {
      const c = col(1 + m);
      setFormula(ws, 1 + m, r, expenseRefs.map((rr) => `${c}${rr}`).join("+"));
    }
    setFormula(ws, 13, r, `SUM(B${r + 1}:M${r + 1})`);
    const totalExpR = r + 1;
    r += 2;

    // Net cashflow
    setLabel(ws, 0, r, "Net cashflow", true);
    for (let m = 0; m < 12; m++) {
      const c = col(1 + m);
      setFormula(ws, 1 + m, r, `${c}${totalRevR}-${c}${totalExpR}`);
    }
    setFormula(ws, 13, r, `SUM(B${r + 1}:M${r + 1})`);
    const netR = r + 1;
    r += 1;

    // Opening / closing balance (carry-over)
    setLabel(ws, 0, r, "Opening balance");
    // first column (Jan)
    if (yi === 0) {
      setNum(ws, 1, r, 0);
    } else {
      // reference previous year sheet closing for Annual (col N, closingR of prev year)
      // We'll set after; need to know prev year's closing row. Closing row = openingR + 1
      // For simplicity reference previous Year sheet's "Annual" closing cell which equals M of closing row.
      // We'll set a placeholder formula referring to the prev sheet name with assumption that closingR position is same.
      const prevSheet = `Year_${year - 1}`;
      setFormula(ws, 1, r, `'${prevSheet}'!N${r + 2}`);
    }
    // months Feb..Dec: opening = previous month's closing
    for (let m = 1; m < 12; m++) {
      const prevClose = `${col(m)}${r + 2}`;
      setFormula(ws, 1 + m, r, prevClose);
    }
    // Annual: year opening = Jan opening
    setFormula(ws, 13, r, `B${r + 1}`);
    const openR = r + 1;
    r += 1;

    setLabel(ws, 0, r, "Closing balance (carry-over)", true);
    for (let m = 0; m < 12; m++) {
      const c = col(1 + m);
      setFormula(ws, 1 + m, r, `${c}${openR}+${c}${netR}`);
    }
    // Annual closing = Dec closing
    setFormula(ws, 13, r, `M${r + 1}`);
    const closeR = r + 1;
    r += 1;

    // Track final ref
    captured = { totalRevR, totalExpR, netR, openR, closeR };
    void headerR;
    ws["!cols"] = [{ wch: 36 }, ...Array(13).fill({ wch: 13 })];
    finalize(ws, 13, r - 1);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  // ---------- Summary sheet ----------
  const s: WS = {};
  setLabel(s, 0, 0, `Multi-Year Summary — ${startYear} to ${startYear + count - 1}`, true);
  ["Year", "Opening balance", "Total revenue", "Total expenses", "Net cashflow", "Closing balance"].forEach(
    (h, i) => setLabel(s, i, 2, h, true),
  );
  const pos = captured!;
  for (let yi = 0; yi < count; yi++) {
    const r = 3 + yi;
    const year = startYear + yi;
    const sn = `Year_${year}`;
    setNum(s, 0, r, year, "0");
    setFormula(s, 1, r, `'${sn}'!N${pos.openR}`);
    setFormula(s, 2, r, `'${sn}'!N${pos.totalRevR}`);
    setFormula(s, 3, r, `'${sn}'!N${pos.totalExpR}`);
    setFormula(s, 4, r, `'${sn}'!N${pos.netR}`);
    setFormula(s, 5, r, `'${sn}'!N${pos.closeR}`);
  }
  // Grand totals
  const totalsR = 3 + count;
  setLabel(s, 0, totalsR, "Grand total", true);
  setFormula(s, 2, totalsR, `SUM(C4:C${3 + count})`);
  setFormula(s, 3, totalsR, `SUM(D4:D${3 + count})`);
  setFormula(s, 4, totalsR, `SUM(E4:E${3 + count})`);
  setFormula(s, 5, totalsR, `F${3 + count}`); // final closing balance
  s["!cols"] = [{ wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  finalize(s, 5, totalsR);

  // Insert Summary as the second sheet by replacing order
  XLSX.utils.book_append_sheet(wb, s, "Summary");
  // Reorder: Assumptions, Summary, Year_*
  wb.SheetNames = ["Assumptions", "Summary", ...yearSheetNames];

  XLSX.writeFile(wb, `cashflow-${startYear}-${startYear + count - 1}.xlsx`);
}
