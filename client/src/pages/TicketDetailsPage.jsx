import { Bot, Play, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import AppShell from "../components/AppShell";
import { api } from "../components/api";
import ActionReviewPanel from "../components/ActionReviewPanel";
import AITriagePanel from "../components/AITriagePanel";
import DraftPanel from "../components/DraftPanel";
import GuardrailPanel from "../components/GuardrailPanel";
import TicketContext from "../components/TicketContext";
import TicketHeader from "../components/TicketHeader";
import TicketMessage from "../components/TicketMessage";
import TracePanel from "../components/TracePanel";
import {
  Button,
  Card,
  ErrorBanner,
  LoadingState,
  ResultMessage,
  SectionTitle,
} from "../components/UI";

export default function TicketDetailsPage() {
  const { ticketId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [ticket, setTicket] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [order, setOrder] = useState(null);
  const [triage, setTriage] = useState(null);
  const [draft, setDraft] = useState(null);
  const [trace, setTrace] = useState(null);
  const [guardrail, setGuardrail] = useState(null);
  const [agentRun, setAgentRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agentLoading, setAgentLoading] = useState(false);
  const [triageLoading, setTriageLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const actionId = useMemo(
    () => searchParams.get("action") || agentRun?.toolCall?.action_id || "",
    [searchParams, agentRun]
  );

  useEffect(() => {
    async function loadTicket() {
      setLoading(true);
      setError("");

      try {
        const result = await api.getTicket(ticketId);
        setTicket(result.ticket);
        setCustomer(result.customer || null);
        setOrder(result.order || null);
        setTriage(result.ticket?.triage || null);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [ticketId]);

  async function runAgentWorkflow() {
    setAgentLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api.runAgent(ticketId);
      const run = result.agentRun;

      setAgentRun(run);
      setCustomer(run.customer || null);
      setOrder(run.order || null);
      setTriage(run.triage || null);
      setDraft(run.draft || null);
      setGuardrail(run.guardrailResult || null);
      setTrace(run.trace || null);

      const actionIdFromRun = run.toolCall?.action_id;
      if (actionIdFromRun) {
        setSearchParams({ action: actionIdFromRun }, { replace: true });
      }

      setMessage(
        `Agent workflow completed with status: ${run.finalStatus || "unknown"}.`
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAgentLoading(false);
    }
  }

  async function runTriage() {
    setTriageLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api.runTriage(ticketId);
      setTriage(result.triage);
      setMessage("AI triage completed and was saved to the ticket.");
      await refreshTicket();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setTriageLoading(false);
    }
  }

  async function generateDraft() {
    setDraftLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api.generateDraft(ticketId);
      setDraft(result.draft);
      setMessage("Grounded draft generated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDraftLoading(false);
    }
  }

  async function refreshTicket() {
    const result = await api.getTicket(ticketId);
    setTicket(result.ticket);
    setCustomer(result.customer || null);
    setOrder(result.order || null);
    setTriage(result.ticket?.triage || null);
  }


  if (loading) {
    return (
      <AppShell>
        <LoadingState label="Loading ticket context..." />
      </AppShell>
    );
  }

  if (!ticket) {
    return (
      <AppShell>
        <ErrorBanner message={error || "Ticket not found."} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <TicketHeader ticket={ticket} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button loading={agentLoading} onClick={runAgentWorkflow}>
            <Bot size={16} />
            Run full AI workflow
          </Button>
          <Button loading={triageLoading} onClick={runTriage} variant="secondary">
            <Bot size={16} />
            Run triage only
          </Button>
          <Button
            variant="secondary"
            loading={draftLoading}
            onClick={generateDraft}
          >
            <Play size={16} />
            Generate draft
          </Button>
          <Button
            variant="secondary"
            onClick={refreshTicket}
          >
            <RefreshCw size={16} />
            Refresh context
          </Button>
        </div>

        {message && <ResultMessage success>{message}</ResultMessage>}
        <ErrorBanner message={error} />

        <TicketContext customer={customer} order={order} />
        <TicketMessage ticket={ticket} />

        <div className="grid gap-6 xl:grid-cols-2">
          <AITriagePanel triage={triage} />
          <DraftPanel draft={draft} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <GuardrailPanel guardrail={guardrail} />
          <ActionReviewPanel initialActionId={actionId} />
        </div>

        {/* <Card className="p-5">
          <SectionTitle
            icon={RefreshCw}
            title="Workflow note"
            description="Use the existing REST APIs individually, or expose the existing LangGraph through the optional agent-run route."
          />
          <p className="text-sm leading-6 text-slate-600">
            This frontend deliberately keeps the page thin: page components coordinate
            the workflow while reusable UI lives in <code>src/components</code>.
            An optional backend integration patch is included in this starter for
            exposing the existing LangGraph as a single agent-run endpoint.
          </p>
        </Card> */}

        <TracePanel trace={trace} />
      </div>
    </AppShell>
  );
}
