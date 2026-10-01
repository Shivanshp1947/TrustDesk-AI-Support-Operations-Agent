import { Bell, Search, UserRound } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isTicket = location.pathname.startsWith("/tickets/");
  const isWorkflow = location.pathname === "/workflow";
  const isEvaluation = location.pathname === "/evaluation";

  const [query, setQuery] = useState("");

  let section = "Support operations";
  let title = "Good afternoon, Support Team";

  if (isTicket) {
    section = "Ticket workspace";
    title = "AI-assisted ticket review";
  } else if (isWorkflow) {
    section = "Support operations";
    title = "Ticket workflow";
  } else if (isEvaluation) {
    section = "Support operations";
    title = "Evaluation center";
  }

  function handleSearch(event) {
    if (event.key !== "Enter") return;

    const value = query.trim();

    if (!value) {
      navigate("/workflow");
      return;
    }

    navigate(`/workflow?search=${encodeURIComponent(value)}`);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 lg:pl-64">
          <p className="truncate text-sm font-semibold text-slate-500">
            {section}
          </p>

          <h1 className="truncate text-lg font-black tracking-tight text-slate-950">
            {title}
          </h1>
        </div>

        <div className="hidden max-w-md flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 md:flex">
          <Search size={17} className="text-slate-400" />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearch}
            className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            placeholder="Search tickets, customers, orders..."
            aria-label="Search tickets, customers, orders"
          />

          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-400">
            Enter
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell size={18} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-black text-blue-700">
              SA
            </div>

            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-800">
                Support Agent
              </p>

              <p className="text-[10px] text-slate-400">
                Demo reviewer
              </p>
            </div>

            <UserRound size={15} className="hidden text-slate-400 sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}