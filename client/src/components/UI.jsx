import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-slate-950 text-white hover:bg-slate-800 focus-visible:ring-slate-400",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-300",
    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionTitle({ icon: Icon, title, description, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-700">
            <Icon size={18} />
          </div>
        )}
        <div>
          <h2 className="text-base font-bold text-slate-950">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status, type = "neutral" }) {
  const palette = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700",
    purple: "bg-violet-50 text-violet-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${palette[type]}`}
    >
      {String(status || "unknown").replaceAll("_", " ")}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const type =
    priority === "urgent"
      ? "danger"
      : priority === "high"
        ? "warning"
        : priority === "medium"
          ? "info"
          : "neutral";

  return <StatusBadge status={priority} type={type} />;
}

export function EmptyState({ icon: Icon = FileText, title, description }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
      <Icon size={28} className="mb-3 text-slate-400" />
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold">Something went wrong</p>
        <p className="mt-1">{message}</p>
      </div>
    </div>
  );
}

export function LoadingState({ label = "Loading TrustDesk..." }) {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
        <LoaderCircle size={18} className="animate-spin" />
        {label}
      </div>
    </div>
  );
}

export function BackButton({ to = "/", label = "Back to dashboard" }) {
  return (
    <a
      href={to}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
    >
      <ArrowLeft size={16} />
      {label}
    </a>
  );
}

export function ResultMessage({ success, children }) {
  const Icon = success ? CheckCircle2 : XCircle;
  const classes = success
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-red-200 bg-red-50 text-red-800";

  return (
    <div className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${classes}`}>
      <Icon size={17} />
      <span>{children}</span>
    </div>
  );
}

export function CitationChip({ docId }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
      <ExternalLink size={12} />
      {docId}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>
          {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
        </div>
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

export function ActionStatus({ status }) {
  const config = {
    approval_required: {
      type: "warning",
      icon: Clock3,
    },
    executed: {
      type: "success",
      icon: CheckCircle2,
    },
    rejected: {
      type: "danger",
      icon: XCircle,
    },
    blocked: {
      type: "danger",
      icon: ShieldCheck,
    },
  };

  const current = config[status] || {
    type: "info",
    icon: Sparkles,
  };
  const Icon = current.icon;

  return (
    <div className="flex items-center gap-2">
      <Icon size={16} />
      <StatusBadge status={status} type={current.type} />
    </div>
  );
}

export function ChevronLink({ children, ...props }) {
  return (
    <button
      className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-950"
      {...props}
    >
      {children}
      <ChevronRight size={16} />
    </button>
  );
}
