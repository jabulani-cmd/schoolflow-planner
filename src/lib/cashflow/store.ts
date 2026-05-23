import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState, School, CustomExpense, Pricing, TermDates } from "./types";

const defaultState: AppState = {
  schools: [
    {
      id: "school-a",
      name: "School A",
      totalStudents: 500,
      monthlySubscribers: 200,
      termSubscribers: 300,
    },
    {
      id: "school-b",
      name: "School B",
      totalStudents: 600,
      monthlySubscribers: 250,
      termSubscribers: 350,
    },
  ],
  customExpenses: [],
  pricing: {
    monthlyPerStudent: 10,
    termPerStudent: 25,
    director1Salary: 5000,
    director2Salary: 5000,
    developerSalary: 2000,
    annualDonationPerSchool: 5000,
  },
  termDates: {
    term1: "2026-01-12",
    term2: "2026-05-04",
    term3: "2026-09-07",
  },
  selectedYear: 2026,
  selectedMonth: 8,
  yearsToProject: 3,
  startYear: 2026,
  startMonth: 8, // September (Term 3 2026)
};

type Actions = {
  addSchool: (s: Omit<School, "id">) => void;
  updateSchool: (id: string, patch: Partial<School>) => void;
  removeSchool: (id: string) => void;
  addExpense: (e: Omit<CustomExpense, "id">) => void;
  updateExpense: (id: string, patch: Partial<CustomExpense>) => void;
  removeExpense: (id: string) => void;
  setPricing: (patch: Partial<Pricing>) => void;
  setTermDates: (patch: Partial<TermDates>) => void;
  setSelectedYear: (y: number) => void;
  setSelectedMonth: (m: number) => void;
  setYearsToProject: (n: number) => void;
  setStartYear: (y: number) => void;
  setStartMonth: (m: number) => void;
  reset: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<AppState & Actions>()(
  persist(
    (set) => ({
      ...defaultState,
      addSchool: (s) =>
        set((st) => ({ schools: [...st.schools, { ...s, id: uid() }] })),
      updateSchool: (id, patch) =>
        set((st) => ({
          schools: st.schools.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      removeSchool: (id) =>
        set((st) => ({ schools: st.schools.filter((x) => x.id !== id) })),
      addExpense: (e) =>
        set((st) => ({ customExpenses: [...st.customExpenses, { ...e, id: uid() }] })),
      updateExpense: (id, patch) =>
        set((st) => ({
          customExpenses: st.customExpenses.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      removeExpense: (id) =>
        set((st) => ({
          customExpenses: st.customExpenses.filter((x) => x.id !== id),
        })),
      setPricing: (patch) =>
        set((st) => ({ pricing: { ...st.pricing, ...patch } })),
      setTermDates: (patch) =>
        set((st) => ({ termDates: { ...st.termDates, ...patch } })),
      setSelectedYear: (y) => set({ selectedYear: y }),
      setSelectedMonth: (m) => set({ selectedMonth: m }),
      setYearsToProject: (n) => set({ yearsToProject: Math.max(1, Math.min(10, n)) }),
      setStartYear: (y) => set({ startYear: y }),
      setStartMonth: (m) => set({ startMonth: Math.max(0, Math.min(11, m)) }),
      reset: () => set(defaultState),
    }),
    { name: "cashflow-state-v1" },
  ),
);
