import { Activity, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import AppShell from "../components/AppShell";
import EvaluationPanel from "../components/EvaluationPanel";
import { api } from "../components/api";
import { ErrorBanner, LoadingState } from "../components/UI";
import StatsGrid from "../components/StatsGrid";
import TicketList from "../components/TicketList";

export default function DashboardPage({ mode = "overview" }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        const result = await api.getTickets();
        setTickets(result.tickets || []);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [location.pathname, mode]);

  if (loading) {
    return (
      <AppShell>
        <LoadingState label="Loading TrustDesk..." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {mode === "overview" && (
          <>
            <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.15)] sm:p-8">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                  <Sparkles size={14} />
                  AI-first support workspace
                </div>

                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Review tickets with context, policy and guardrails in one
                  place.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  TrustDesk connects ticket context, AI triage, grounded
                  drafts, operational actions and evaluation results into a
                  support-agent workflow.
                </p>
              </div>
            </section>

            <ErrorBanner message={error} />

            <StatsGrid tickets={tickets} />
            <TicketList tickets={tickets} initialSearch={initialSearch}/>
          </>
        )}

        {mode === "workflow" && (
          <>
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                System
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                Ticket workflow
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Select a ticket and run the complete TrustDesk AI workflow from
                context loading through policy retrieval, triage, grounded drafting,
                guardrails, human approval and trace generation.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-950">
                  AI workflow
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Every full agent run follows the same controlled sequence.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    number: "1",
                    title: "Load context",
                    description: "Load ticket, customer and order information.",
                  },
                  {
                    number: "2",
                    title: "Retrieve policy",
                    description: "Find relevant knowledge-base evidence.",
                  },
                  {
                    number: "3",
                    title: "AI triage",
                    description: "Classify intent, priority and escalation.",
                  },
                  {
                    number: "4",
                    title: "Grounded draft",
                    description: "Generate a cited customer-facing response.",
                  },
                  {
                    number: "5",
                    title: "Guardrails",
                    description: "Validate policy, safety and tool conditions.",
                  },
                  {
                    number: "6",
                    title: "Human approval",
                    description: "Require approval for sensitive actions.",
                  },
                  {
                    number: "7",
                    title: "Execute",
                    description: "Run an approved idempotent action.",
                  },
                  {
                    number: "8",
                    title: "Trace",
                    description: "Persist the decision and final status.",
                  },
                ].map((step) => (
                  <div
                    key={step.number}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
                        {step.number}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {step.title}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <ErrorBanner message={error} />

            <StatsGrid tickets={tickets} />

            <TicketList
              tickets={tickets}
              initialSearch={initialSearch}
            />
          </>
        )}


        {mode === "evaluation" && (
          <>
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                System
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                Evaluation center
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Run the persisted TrustDesk evaluation cases and inspect the
                resulting quality and safety metrics.
              </p>
            </section>

            <EvaluationPanel />
          </>
        )}

        <div className="flex items-center justify-center gap-2 pb-4 text-xs text-slate-400">
          <Activity size={14} />
          TrustDesk frontend • React + React Router + Tailwind CSS
        </div>
      </div>
    </AppShell>
  );
}