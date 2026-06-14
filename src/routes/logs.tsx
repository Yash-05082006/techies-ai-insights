import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app/AppShell";
import { useState } from "react";
import { Search, X, Filter } from "lucide-react";

export const Route = createFileRoute("/logs")({
  head: () => ({
    meta: [
      { title: "Request Logs — Techies" },
      {
        name: "description",
        content:
          "Trace every AI request: prompt, response, tokens, cost, latency, and status.",
      },
    ],
  }),
  component: LogsPage,
});

type Status = "success" | "error" | "rate_limited";

const rows: {
  id: string;
  ts: string;
  user: string;
  model: string;
  tokens: { in: number; out: number };
  cost: number;
  latency: number;
  status: Status;
  prompt: string;
  response: string;
  feature: string;
}[] = [
  {
    id: "req_8f1c2e",
    ts: "2026-06-14 17:48:12",
    user: "ariam@acme.com",
    model: "gpt-4o",
    tokens: { in: 1284, out: 412 },
    cost: 0.0184,
    latency: 842,
    status: "success",
    feature: "customer-support",
    prompt:
      "Customer asked about refund policy for an annual subscription cancelled after 4 months.",
    response:
      "Our refund policy allows prorated refunds within the first 30 days. After that, the remaining term is not refundable but credits can be applied to other plans.",
  },
  {
    id: "req_3a92be",
    ts: "2026-06-14 17:47:58",
    user: "joel@acme.com",
    model: "claude-sonnet-4.5",
    tokens: { in: 942, out: 1208 },
    cost: 0.0271,
    latency: 1612,
    status: "success",
    feature: "doc-summarizer",
    prompt: "Summarize the attached 14-page vendor agreement.",
    response: "Key terms: 3-year term, auto-renewal opt-out 60 days prior…",
  },
  {
    id: "req_b71044",
    ts: "2026-06-14 17:47:31",
    user: "ariam@acme.com",
    model: "gpt-4o-mini",
    tokens: { in: 318, out: 96 },
    cost: 0.00018,
    latency: 312,
    status: "success",
    feature: "search-rag",
    prompt: "Top 3 OKRs for Q3 in the engineering org.",
    response: "1) Reduce p95 inference latency by 30% …",
  },
  {
    id: "req_42dd91",
    ts: "2026-06-14 17:46:50",
    user: "leah@acme.com",
    model: "gpt-4o",
    tokens: { in: 6420, out: 0 },
    cost: 0.032,
    latency: 4128,
    status: "error",
    feature: "code-assistant",
    prompt: "Refactor the entire payments module for idempotency.",
    response: "context_length_exceeded: 128000 token limit reached.",
  },
  {
    id: "req_55c2af",
    ts: "2026-06-14 17:46:12",
    user: "joel@acme.com",
    model: "gemini-2.5-pro",
    tokens: { in: 412, out: 0 },
    cost: 0,
    latency: 110,
    status: "rate_limited",
    feature: "email-drafting",
    prompt: "Draft a follow-up email to the Riverbend account.",
    response: "rate_limit_exceeded: 1500 RPM tier limit.",
  },
  {
    id: "req_91ee03",
    ts: "2026-06-14 17:45:44",
    user: "ariam@acme.com",
    model: "claude-sonnet-4.5",
    tokens: { in: 1108, out: 624 },
    cost: 0.0192,
    latency: 1102,
    status: "success",
    feature: "customer-support",
    prompt: "Customer reports payment failed but card was charged twice.",
    response:
      "I can confirm one authorisation and one capture — the second appears to be a pending hold that will drop within 3 business days…",
  },
  {
    id: "req_0d4470",
    ts: "2026-06-14 17:45:10",
    user: "marc@acme.com",
    model: "deepseek-v3",
    tokens: { in: 2840, out: 1140 },
    cost: 0.0042,
    latency: 1840,
    status: "success",
    feature: "code-assistant",
    prompt: "Generate unit tests for the auth-token rotation helper.",
    response: "describe('rotateAuthToken', () => { it('rotates a valid token'…",
  },
];

const statusColor: Record<Status, string> = {
  success: "bg-emerald-50 text-emerald-700",
  error: "bg-red-50 text-red-700",
  rate_limited: "bg-amber-50 text-amber-700",
};

function LogsPage() {
  const [open, setOpen] = useState<typeof rows[number] | null>(null);
  const [q, setQ] = useState("");

  const filtered = rows.filter(
    (r) =>
      r.id.includes(q) ||
      r.user.includes(q) ||
      r.model.includes(q) ||
      r.feature.includes(q),
  );

  return (
    <AppShell
      title="Request Logs"
      subtitle="Every AI call traced end-to-end, ready to inspect."
    >
      <Card className="p-0">
        <div className="flex items-center gap-3 border-b border-[#0F172A]/8 p-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by request id, user, model, feature…"
              className="w-full rounded-lg border border-[#0F172A]/8 bg-white pl-9 pr-3 py-2 text-[13px] placeholder:text-[#94A3B8] focus:border-[#2563EB]/40 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#0F172A]/8 bg-white px-3 py-2 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC]">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[13px]">
            <thead className="bg-[#F8FAFC] text-left text-[11px] uppercase tracking-wider text-[#64748B]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Timestamp</th>
                <th className="px-4 py-2.5 font-medium">User</th>
                <th className="px-4 py-2.5 font-medium">Model</th>
                <th className="px-4 py-2.5 font-medium">Tokens</th>
                <th className="px-4 py-2.5 font-medium">Cost</th>
                <th className="px-4 py-2.5 font-medium">Latency</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F172A]/8">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setOpen(r)}
                  className="cursor-pointer transition-colors hover:bg-[#2563EB]/[0.03]"
                >
                  <td className="px-4 py-2.5 font-mono text-[12px] text-[#475569]">
                    {r.ts}
                  </td>
                  <td className="px-4 py-2.5 text-[#475569]">{r.user}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-md bg-[#0F172A]/[0.05] px-2 py-0.5 font-mono text-[11px] text-[#0F172A]">
                      {r.model}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#475569]">
                    {(r.tokens.in + r.tokens.out).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-[#475569]">
                    ${r.cost.toFixed(4)}
                  </td>
                  <td className="px-4 py-2.5 text-[#475569]">{r.latency} ms</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && <DetailDrawer row={open} onClose={() => setOpen(null)} />}
    </AppShell>
  );
}

function DetailDrawer({
  row,
  onClose,
}: {
  row: NonNullable<ReturnType<typeof useState<typeof rows[number] | null>>[0]>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-[#0F172A]/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#0F172A]/8 bg-white/90 p-4 backdrop-blur">
          <div>
            <div className="font-mono text-[12px] text-[#94A3B8]">
              {row.id}
            </div>
            <div className="text-[14px] font-semibold text-[#0F172A]">
              {row.model} · {row.feature}
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-[#475569] hover:bg-[#0F172A]/[0.05]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          <Stat label="Tokens in" value={row.tokens.in.toLocaleString()} />
          <Stat label="Tokens out" value={row.tokens.out.toLocaleString()} />
          <Stat label="Cost" value={`$${row.cost.toFixed(4)}`} />
          <Stat label="Latency" value={`${row.latency} ms`} />
        </div>

        <Section title="Prompt">
          <pre className="whitespace-pre-wrap rounded-xl border border-[#0F172A]/8 bg-[#F8FAFC] p-3 font-mono text-[12px] leading-relaxed text-[#0F172A]">
            {row.prompt}
          </pre>
        </Section>

        <Section title="Response">
          <pre className="whitespace-pre-wrap rounded-xl border border-[#0F172A]/8 bg-[#F8FAFC] p-3 font-mono text-[12px] leading-relaxed text-[#0F172A]">
            {row.response}
          </pre>
        </Section>

        <Section title="Metadata">
          <div className="rounded-xl border border-[#0F172A]/8 bg-[#F8FAFC] p-3 font-mono text-[12px] text-[#475569]">
            <div>user: {row.user}</div>
            <div>feature: {row.feature}</div>
            <div>status: {row.status}</div>
            <div>timestamp: {row.ts}</div>
            <div>env: production</div>
            <div>region: us-east-1</div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#0F172A]/8 bg-white p-3">
      <div className="text-[11px] uppercase tracking-wider text-[#94A3B8]">
        {label}
      </div>
      <div className="mt-1 text-[16px] font-semibold tracking-tight text-[#0F172A]">
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 pb-4">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">
        {title}
      </div>
      {children}
    </div>
  );
}
