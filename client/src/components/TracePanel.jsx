import { Activity, Code2 } from "lucide-react";
import { Card, SectionTitle } from "./UI";

export default function TracePanel({ trace }) {
  return (
    <Card className="p-5">
      <SectionTitle
        icon={Activity}
        title="Run trace"
        description="Minimal audit information for debugging an AI decision."
      />

      {trace ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Run ID</p>
              <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-700">
                {trace.run_id}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Run type</p>
              <p className="mt-1 text-sm font-bold text-slate-700">
                {trace.run_type}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Final status</p>
              <p className="mt-1 text-sm font-bold text-slate-700">
                {trace.final_status}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Documents</p>
              <p className="mt-1 text-sm font-bold text-slate-700">
                {trace.retrieved_doc_ids?.length || 0}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              <Code2 size={14} />
              Retrieved document IDs
            </div>
            <div className="flex flex-wrap gap-2">
              {(trace.retrieved_doc_ids || []).map((docId) => (
                <span
                  key={docId}
                  className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs text-slate-600"
                >
                  {docId}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          A trace will appear after a run that creates one.
        </div>
      )}
    </Card>
  );
}
