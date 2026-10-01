import { BarChart3, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "./api";
import { Button, Card, ErrorBanner, SectionTitle, StatusBadge } from "./UI";

const metricLabels = {
  triage_accuracy: "Triage accuracy",
  priority_accuracy: "Priority accuracy",
  citation_coverage: "Citation coverage",
  unsafe_action_block_rate: "Unsafe-action blocking",
  allowed_action_recall: "Allowed-action recall",
  escalation_accuracy: "Escalation accuracy",
  answer_requirement_coverage: "Answer coverage",
};

export default function EvaluationPanel() {
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!run?.eval_run_id || run.status === "completed" || run.status === "failed") {
      return undefined;
    }

    const timer = window.setInterval(async () => {
      try {
        const result = await api.getEvaluation(run.eval_run_id);
        setRun(result.evaluation);
      } catch (requestError) {
        setError(requestError.message);
      }
    }, 1500);

    return () => window.clearInterval(timer);
  }, [run]);

  async function handleRunEvaluation() {
    setError("");
    setLoading(true);
    setPolling(true);

    try {
      const started = await api.startEvaluation();
      const result = await api.getEvaluation(started.eval_run_id);
      setRun(result.evaluation);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      window.setTimeout(() => setPolling(false), 1000);
    }
  }

  const metrics = run?.metrics || {};

  return (
    <Card className="p-5">
      <SectionTitle
        icon={BarChart3}
        title="Evaluation center"
        description="Run the supplied eval cases and inspect the persisted summary."
        action={
          <Button
            variant="secondary"
            loading={loading}
            onClick={handleRunEvaluation}
          >
            <RefreshCw size={15} />
            Run evals
          </Button>
        }
      />

      <ErrorBanner message={error} />

      {run ? (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              status={run.status}
              type={run.status === "completed" ? "success" : "warning"}
            />
            <span className="text-sm text-slate-500">
              {run.passed_cases ?? 0} / {run.total_cases ?? 0} cases passed
            </span>
            {polling && (
              <span className="text-xs font-medium text-slate-400">
                Updating...
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(metricLabels).map(([key, label]) => (
              <div
                key={key}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {typeof metrics[key] === "number"
                    ? `${Math.round(metrics[key] * 100)}%`
                    : "—"}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            <ShieldCheck size={17} />
            <span>
              The evaluation endpoint runs against the backend's persisted eval cases.
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-semibold text-slate-800">No evaluation run loaded</p>
          <p className="mt-1 text-sm text-slate-500">
            Start an evaluation to populate the metrics panel.
          </p>
        </div>
      )}
    </Card>
  );
}
