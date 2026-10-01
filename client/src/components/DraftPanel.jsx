import { Check, Copy, FileText, Sparkles } from "lucide-react";
import { useState } from "react";

import { Card, CitationChip, SectionTitle } from "./UI";

export default function DraftPanel({ draft }) {
  const result = draft?.draft || draft;
  const citations = result?.citations || [];

  const [copied, setCopied] = useState(false);

  async function copyReply() {
    if (!result?.body) return;

    try {
      await navigator.clipboard.writeText(result.body);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className="p-5">
      <SectionTitle
        icon={FileText}
        title="Grounded draft reply"
        description="Draft content returned by the AI provider with knowledge-base citations."
      />

      {result ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-600">
                <Sparkles size={14} />
                AI draft
              </div>

              <button
                type="button"
                onClick={copyReply}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy reply"}
              </button>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {result.body || "No draft body returned."}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              Policy citations
            </p>

            <div className="flex flex-wrap gap-2">
              {citations.length > 0 ? (
                citations.map((citation) => (
                  <CitationChip
                    key={citation.doc_id}
                    docId={citation.doc_id}
                  />
                ))
              ) : (
                <span className="text-sm text-slate-500">
                  No citations returned.
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Generate a draft to see the grounded customer response.
        </div>
      )}
    </Card>
  );
}