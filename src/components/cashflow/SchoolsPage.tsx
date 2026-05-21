import { useState } from "react";
import { useStore } from "@/lib/cashflow/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHead, TableHeader, TableRow, TableBody, TableCell,
} from "@/components/ui/table";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { isEligible, penetration, MIN_STUDENTS } from "@/lib/cashflow/calc";

export function SchoolsPage() {
  const { schools, addSchool, updateSchool, removeSchool } = useStore();
  const [draft, setDraft] = useState({
    name: "",
    totalStudents: 500,
    monthlySubscribers: 0,
    termSubscribers: 0,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add School</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Label>Name</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="School name"
              />
            </div>
            <div>
              <Label>Total students</Label>
              <Input
                type="number"
                value={draft.totalStudents}
                onChange={(e) =>
                  setDraft({ ...draft, totalStudents: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label>Monthly subs</Label>
              <Input
                type="number"
                value={draft.monthlySubscribers}
                onChange={(e) =>
                  setDraft({ ...draft, monthlySubscribers: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label>Term subs</Label>
              <Input
                type="number"
                value={draft.termSubscribers}
                onChange={(e) =>
                  setDraft({ ...draft, termSubscribers: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <div className="mt-3">
            <Button
              disabled={!draft.name.trim()}
              onClick={() => {
                addSchool(draft);
                setDraft({
                  name: "",
                  totalStudents: 500,
                  monthlySubscribers: 0,
                  termSubscribers: 0,
                });
              }}
            >
              <Plus className="mr-1 h-4 w-4" /> Add school
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schools</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Total students</TableHead>
                <TableHead>Monthly subs</TableHead>
                <TableHead>Term subs</TableHead>
                <TableHead>Penetration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Input
                      value={s.name}
                      onChange={(e) => updateSchool(s.id, { name: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={s.totalStudents}
                      onChange={(e) =>
                        updateSchool(s.id, { totalStudents: Number(e.target.value) || 0 })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={s.monthlySubscribers}
                      onChange={(e) =>
                        updateSchool(s.id, {
                          monthlySubscribers: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={s.termSubscribers}
                      onChange={(e) =>
                        updateSchool(s.id, {
                          termSubscribers: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {penetration(s).toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {isEligible(s) ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Eligible
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Below {MIN_STUDENTS}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeSchool(s.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
