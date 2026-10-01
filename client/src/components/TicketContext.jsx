import { CheckCircle2, Package, UserRound } from "lucide-react";
import { Card, SectionTitle, StatusBadge } from "./UI";

export default function TicketContext({ customer, order }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <SectionTitle icon={UserRound} title="Customer context" />
        {customer ? (
          <div className="space-y-3">
            <div>
              <p className="text-lg font-bold text-slate-950">{customer.name}</p>
              <p className="text-sm text-slate-500">{customer.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={customer.tier} type="purple" />
              <StatusBadge
                status={customer.verified ? "verified" : "unverified"}
                type={customer.verified ? "success" : "warning"}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No customer context available.</p>
        )}
      </Card>

      <Card className="p-5">
        <SectionTitle icon={Package} title="Order context" />
        {order ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-sm font-bold text-slate-950">
                  {order.order_id}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {order.items?.[0]?.name || "Order item"}
                </p>
              </div>
              <StatusBadge status={order.status} type="info" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-400">Total</p>
                <p className="mt-1 font-bold text-slate-800">
                  {order.currency} {Number(order.total || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-400">Payment</p>
                <p className="mt-1 inline-flex items-center gap-1 font-bold text-slate-800">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  {order.payment_status}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No linked order context.</p>
        )}
      </Card>
    </div>
  );
}
