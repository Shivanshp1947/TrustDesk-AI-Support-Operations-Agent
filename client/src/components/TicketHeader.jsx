import { ArrowLeft, CalendarDays, Mail, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PriorityBadge, StatusBadge } from "./UI";

export default function TicketHeader({ ticket }) {
  const navigate = useNavigate();
  const ChannelIcon = ticket.channel === "email" ? Mail : MessageCircle;

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950"
      >
        <ArrowLeft size={16} />
        Back to queue
      </button>

      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-400">
              {ticket.ticket_id}
            </span>
            <StatusBadge status={ticket.status || "open"} type="info" />
            {ticket.triage?.priority && (
              <PriorityBadge priority={ticket.triage.priority} />
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <ChannelIcon size={13} />
              {ticket.channel}
            </span>
          </div>
          <h1 className="max-w-4xl text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {ticket.subject}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>{ticket.customer_id}</span>
            <span>{ticket.order_id || "No linked order"}</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} />
              {new Date(ticket.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
