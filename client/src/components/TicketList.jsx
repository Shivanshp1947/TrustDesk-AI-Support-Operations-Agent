import { MessageCircle, Mail, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PriorityBadge, StatusBadge } from "./UI";

const channelIcon = {
  email: Mail,
  chat: MessageCircle,
};

export default function TicketList({ tickets = [], initialSearch = "", }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState(initialSearch);
  const [priority, setPriority] = useState("all");

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const searchable = [
        ticket.ticket_id,
        ticket.subject,
        ticket.body,
        ticket.customer_id,
        ticket.order_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);
      const matchesPriority =
        priority === "all" || ticket.triage?.priority === priority;

      return matchesSearch && matchesPriority;
    });
  }, [tickets, search, priority]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-950">Ticket queue</h2>
            <p className="mt-1 text-sm text-slate-500">
              Open a ticket to inspect context and run AI operations.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex min-w-64 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets..."
                className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="all">All priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {filteredTickets.map((ticket) => {
          const ChannelIcon = channelIcon[ticket.channel] || MessageCircle;

          return (
            <button
              key={ticket.ticket_id}
              onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
              className="group grid w-full gap-4 p-5 text-left transition hover:bg-slate-50 lg:grid-cols-[minmax(0,1fr)_180px_130px_24px] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-400">
                    {ticket.ticket_id}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <ChannelIcon size={13} />
                    {ticket.channel}
                  </span>
                </div>
                <h3 className="mt-2 truncate font-bold text-slate-900">
                  {ticket.subject}
                </h3>
                <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                  {ticket.body}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <UserRound size={15} />
                <span>{ticket.customer_id}</span>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge
                  status={ticket.status || "open"}
                  type={ticket.status === "open" ? "info" : "neutral"}
                />
                {ticket.triage?.priority && (
                  <PriorityBadge priority={ticket.triage.priority} />
                )}
              </div>

              <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600">
                →
              </span>
            </button>
          );
        })}
      </div>

      {filteredTickets.length === 0 && (
        <div className="p-10 text-center text-sm text-slate-500">
          No tickets match your filters.
        </div>
      )}
    </div>
  );
}
