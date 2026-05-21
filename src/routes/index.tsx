import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SetupPage } from "@/components/cashflow/SetupPage";
import { SchoolsPage } from "@/components/cashflow/SchoolsPage";
import { MonthlyPage } from "@/components/cashflow/MonthlyPage";
import { YearlyPage } from "@/components/cashflow/YearlyPage";
import { Settings, School, CalendarDays, LineChart } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const [tab, setTab] = useState("monthly");
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">Cashflow Builder</h1>
            <p className="text-xs text-muted-foreground">
              School management SaaS — monthly & yearly planning
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
