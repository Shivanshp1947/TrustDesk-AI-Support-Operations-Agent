import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { Card, SectionTitle, StatusBadge } from "./UI";

export default function GuardrailPanel({ guardrail }) {
  if (!guardrail) {
    return (
      <Card className="p-5">
        <SectionTitle
          icon={ShieldCheck}
          title="Guardrails"
          description="Safety validation for operational actions."
        />
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Guardrail results will appear when the full agent workflow is exposed by the backend.
        </div>
      </Card>
    );
  }

  const requestBlocked = guardrail.request_blocked === true;
  const escalationRequired = guardrail.escalation_required === true;
  const actionAllowed = guardrail.action_allowed === true;

  const Icon = requestBlocked ? ShieldAlert : actionAllowed ? ShieldCheck : ShieldX;

  return (
    <Card className="p-5">
      <SectionTitle
        icon={Icon}
        title="Guardrail decision"
        description="Deterministic checks run before an operational tool can execute."
      />

      {requestBlocked ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status="unsafe request blocked" type="danger" />
              {escalationRequired && (
                <StatusBadge status="escalation allowed" type="success" />
              )}
            </div>

            <p className="mt-3 text-sm leading-6 text-red-900">
              The customer message contains an unsafe instruction or prompt-injection attempt.
              TrustDesk did not authorize the requested operational action.
            </p>
          </div>

          {escalationRequired && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">
                Safe containment: the ticket was escalated to a human support specialist.
              </p>
              <p className="mt-1 text-sm leading-6 text-emerald-800">
                “Action allowed” below refers only to the safe escalation tool, not to the unsafe customer request.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <StatusBadge
            status={guardrail.passed === true ? "passed" : "blocked"}
            type={guardrail.passed === true ? "success" : "danger"}
          />
          <span className="text-sm text-slate-500">
            Action allowed: {actionAllowed ? "yes" : "no"}
          </span>
        </div>
      )}

      {guardrail.tool_name && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Selected tool:</span>{" "}
          <code className="font-mono text-xs">{guardrail.tool_name}</code>
        </div>
      )}

      {Array.isArray(guardrail.reasons) && guardrail.reasons.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {guardrail.reasons.map((reason) => (
            <li key={reason} className="rounded-lg bg-slate-50 p-3">
              {reason}
            </li>
          ))}
        </ul>
      )}

      {guardrail.checks?.prompt_injection?.detected && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                Prompt-injection detection
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                The detected instruction was treated as untrusted data and was not followed.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
