import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SetupPage } from "@/components/cashflow/SetupPage";
import { SchoolsPage } from "@/components/cashflow/SchoolsPage";
import { MonthlyPage } from "@/components/cashflow/MonthlyPage";
import { YearlyPage } from "@/components/cashflow/YearlyPage";
import { Settings, School, CalendarDays, LineChart } from "lucide-react";
import mbsLogo from "@/assets/mbs-logo.png";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const [tab, setTab] = useState("monthly");
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <img
            src={mbsLogo}
            alt="MavingTech Business Solutions"
            className="h-14 w-auto object-contain"
          />
          <div className="hidden h-12 w-px bg-slate-200 sm:block" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              MavingTech Business Solutions
            </h1>
            <p className="text-xs text-muted-foreground">
              Cashflow Builder — School management SaaS planning
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="setup"><Settings className="mr-2 h-4 w-4" />Setup</TabsTrigger>
            <TabsTrigger value="schools"><School className="mr-2 h-4 w-4" />Schools</TabsTrigger>
            <TabsTrigger value="monthly"><CalendarDays className="mr-2 h-4 w-4" />Monthly</TabsTrigger>
            <TabsTrigger value="yearly"><LineChart className="mr-2 h-4 w-4" />Yearly</TabsTrigger>
          </TabsList>
          <TabsContent value="setup"><SetupPage /></TabsContent>
          <TabsContent value="schools"><SchoolsPage /></TabsContent>
          <TabsContent value="monthly"><MonthlyPage /></TabsContent>
          <TabsContent value="yearly"><YearlyPage /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
