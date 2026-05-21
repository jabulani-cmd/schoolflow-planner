import type { AppState, School } from "./types";

export const MIN_STUDENTS = 500;
export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
export const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const isEligible = (s: School) => s.totalStudents >= MIN_STUDENTS;

export const penetration = (s: School) =>
  s.totalStudents > 0
    ? ((s.monthlySubscribers + s.termSubscribers) / s.totalStudents) * 100
    : 0;

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);

/** Returns the months (0-11) where each term starts (year-agnostic). */
export function termMonths(state: AppState): number[] {
  const { term1, term2, term3 } = state.termDates;
  return [term1, term2, term3].map((d) => new Date(d + "T00:00:00").getMonth());
}

export function isTermMonth(state: AppState, month: number): boolean {
  return termMonths(state).includes(month);
}

export type MonthBreakdown = {
  month: number;
  isTermMonth: boolean;
  perSchool: {
    school: School;
    monthlyRevenue: number;
    termRevenue: number;
    donation: number;
  }[];
  monthlyRevenue: number;
  termRevenue: number;
  totalRevenue: number;
  salaries: number;
  donations: number;
  customExpenses: number;
  totalExpenses: number;
  net: number;
};

export function computeMonth(state: AppState, month: number): MonthBreakdown {
  const eligible = state.schools.filter(isEligible);
  const tm = isTermMonth(state, month);
  const donationPerSchool = state.pricing.annualDonationPerSchool / 12;

  const perSchool = eligible.map((school) => {
    const monthlyRevenue = school.monthlySubscribers * state.pricing.monthlyPerStudent;
    const termRevenue = tm ? school.termSubscribers * state.pricing.termPerStudent : 0;
    return { school, monthlyRevenue, termRevenue, donation: donationPerSchool };
  });

  const monthlyRevenue = perSchool.reduce((a, s) => a + s.monthlyRevenue, 0);
  const termRevenue = perSchool.reduce((a, s) => a + s.termRevenue, 0);
  const totalRevenue = monthlyRevenue + termRevenue;
  const salaries =
    state.pricing.director1Salary +
    state.pricing.director2Salary +
    state.pricing.developerSalary;
  const donations = donationPerSchool * eligible.length;
  const customExpenses = state.customExpenses.reduce((a, e) => a + e.amount, 0);
  const totalExpenses = salaries + donations + customExpenses;
  const net = totalRevenue - totalExpenses;

  return {
    month,
    isTermMonth: tm,
    perSchool,
    monthlyRevenue,
    termRevenue,
    totalRevenue,
    salaries,
    donations,
    customExpenses,
    totalExpenses,
    net,
  };
}

export function computeYear(state: AppState): MonthBreakdown[] {
  return Array.from({ length: 12 }, (_, m) => computeMonth(state, m));
}
