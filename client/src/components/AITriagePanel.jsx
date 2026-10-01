import { BrainCircuit, ShieldAlert } from "lucide-react";
import { Card, PriorityBadge, SectionTitle, StatusBadge } from "./UI";

export default function AITriagePanel({ triage }) {
  const result = triage?.triage || triage;

  return (
    <Card className="p-5">
      <SectionTitle
        icon={BrainCircuit}
        title="AI triage"
        description="Classification and deterministic safety rules returned by the backend."
      />

      {result ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-400">Category</p>
              <p className="mt-2 font-bold capitalize text-slate-900">
                {result.category?.replaceAll("_", " ")}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-400">Priority</p>
              <div className="mt-2">
                <PriorityBadge priority={result.priority} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-400">Escalation</p>
              <div className="mt-2">
                <StatusBadge
                  status={result.escalation ? "human review" : "not required"}
                  type={result.escalation ? "warning" : "success"}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
            <ShieldAlert size={18} className="mt-0.5 text-slate-500" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Reason
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {result.reason || "No explanation returned."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Run AI triage to populate this panel.
        </div>
      )}
    </Card>
  );
}
