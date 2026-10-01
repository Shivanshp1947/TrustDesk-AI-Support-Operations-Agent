import { AlertTriangle, CheckCircle2, Clock3, Ticket } from "lucide-react";
import { StatCard } from "./UI";

export default function StatsGrid({ tickets = [] }) {
  const open = tickets.filter((ticket) => ticket.status === "open").length;
  const urgent = tickets.filter(
    (ticket) => ticket.triage?.priority === "urgent"
  ).length;
  const escalated = tickets.filter(
    (ticket) => ticket.triage?.escalation === true
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Ticket}
        label="Total tickets"
        value={tickets.length}
        detail="Loaded from persistent support data"
      />
      <StatCard
        icon={Clock3}
        label="Open queue"
        value={open}
        detail="Tickets currently available for review"
      />
      <StatCard
        icon={AlertTriangle}
        label="Urgent"
        value={urgent}
        detail="Safety-critical tickets are escalated"
      />
      <StatCard
        icon={CheckCircle2}
        label="Escalated"
        value={escalated}
        detail="Human review is required"
      />
    </div>
  );
}
