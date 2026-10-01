import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "./api";
import { Button, Card, ErrorBanner, SectionTitle, ActionStatus } from "./UI";

export default function ActionReviewPanel({ initialActionId = "" }) {
  const [actionId, setActionId] = useState(initialActionId);
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialActionId) {
      setActionId(initialActionId);
      loadAction(initialActionId);
    }
    // Intentionally runs when the ticket-provided action id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialActionId]);

  async function loadAction(id = actionId) {
    if (!id.trim()) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api.getAction(id.trim());
      setAction(result.toolCall);
    } catch (requestError) {
      setAction(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function decide(type) {
    if (!action?.action_id) return;

    setDecisionLoading(true);
    setError("");
    setMessage("");

    try {
      const result =
        type === "approve"
          ? await api.approveAction(action.action_id)
          : await api.rejectAction(action.action_id);

      setAction(result.toolCall);
      setMessage(result.message || `Action ${type}d successfully.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDecisionLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <SectionTitle
        icon={LockKeyhole}
        title="Approval review"
        description="Sensitive actions require an explicit human decision before execution."
      />

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <div className="flex items-start gap-3">
        <ShieldCheck
          size={18}
          className="mt-0.5 shrink-0"
        />

        <p>
          The full AI workflow now populates this
          action automatically. You can also paste
          an existing action ID to inspect a
          persisted ToolCall.
        </p>
      </div>
    </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={actionId}
          onChange={(event) => setActionId(event.target.value)}
          placeholder="Paste action ID, e.g. 2ec2365c-..."
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        />
        <Button variant="secondary" loading={loading} onClick={() => loadAction()}>
          Load action
        </Button>
      </div>

      <div className="mt-4">
        <ErrorBanner message={error} />
        {message && (
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {message}
          </div>
        )}
      </div>

      {action && (
        <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-bold text-slate-400">
                {action.action_id}
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {action.tool_name}
              </p>
            </div>
            <ActionStatus status={action.status} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-slate-400">Risk level</p>
              <p className="mt-1 font-bold capitalize text-slate-800">
                {action.risk_level}
              </p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-slate-400">Idempotency key</p>
              <p className="mt-1 break-all font-mono text-xs text-slate-700">
                {action.idempotency_key}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              Payload
            </p>
            <pre className="overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {JSON.stringify(action.payload, null, 2)}
            </pre>
          </div>

          {action.status === "approval_required" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="success"
                loading={decisionLoading}
                onClick={() => decide("approve")}
                className="flex-1"
              >
                Approve & execute
              </Button>
              <Button
                variant="danger"
                loading={decisionLoading}
                onClick={() => decide("reject")}
                className="flex-1"
              >
                Reject action
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
