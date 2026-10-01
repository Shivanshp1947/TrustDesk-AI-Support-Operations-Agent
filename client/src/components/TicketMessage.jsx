import { MessageSquareText } from "lucide-react";
import { Card, SectionTitle } from "./UI";

export default function TicketMessage({ ticket }) {
  return (
    <Card className="p-5">
      <SectionTitle
        icon={MessageSquareText}
        title="Customer message"
        description="Raw customer input is displayed as data, not as an instruction to the agent."
      />
      <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
        {ticket.body}
      </div>
    </Card>
  );
}
