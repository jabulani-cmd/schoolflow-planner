export type School = {
  id: string;
  name: string;
  totalStudents: number;
  monthlySubscribers: number;
  termSubscribers: number;
};

export type CustomExpense = {
  id: string;
  label: string;
  amount: number;
};

export type Pricing = {
  monthlyPerStudent: number;
  termPerStudent: number;
  director1Salary: number;
  director2Salary: number;
  developerSalary: number;
  annualDonationPerSchool: number;
};

export type TermDates = {
  term1: string; // YYYY-MM-DD
  term2: string;
  term3: string;
};

export type AppState = {
  schools: School[];
  customExpenses: CustomExpense[];
  pricing: Pricing;
  termDates: TermDates;
  selectedYear: number;
  selectedMonth: number; // 0-11
  yearsToProject: number; // 1-5
};
