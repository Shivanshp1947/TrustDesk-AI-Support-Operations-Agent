import {
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const workspaceItems = [
  {
    label: "Overview",
    to: "/",
    icon: LayoutDashboard,
    end: true,
  },
];

const systemItems = [
  {
    label: "Ticket workflow",
    to: "/workflow",
    icon: Ticket,
  },
  {
    label: "Evaluation center",
    to: "/evaluation",
    icon: BarChart3,
  },
];

function SidebarLink({ label, to, icon: Icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
          isActive
            ? "bg-slate-950 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
          TD
        </div>

        <div>
          <p className="text-base font-black tracking-tight text-slate-950">
            TrustDesk
          </p>

          <p className="text-xs font-medium text-slate-400">
            Support Operations
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">
          {workspaceItems.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </div>

        <div className="mt-8">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            System
          </p>

          <div className="space-y-1">
            {systemItems.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </div>
        </div>
      </nav>

      <div className="m-4 rounded-2xl bg-slate-950 p-4 text-white">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck size={18} />
          <span className="text-sm font-bold">AI Guardrails</span>
        </div>

        <p className="text-xs leading-5 text-slate-300">
          Customer messages and retrieved policies are treated as untrusted
          input.
        </p>
      </div>
    </aside>
  );
}