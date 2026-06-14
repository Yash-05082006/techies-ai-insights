import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app/AppShell";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Techies" },
      {
        name: "description",
        content:
          "Understand AI usage with breakdowns by model, feature, token type, and user.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const reqsOverTime = [
  18, 22, 26, 31, 28, 34, 39, 42, 38, 45, 51, 47, 53, 58, 61, 57, 64, 70, 67,
  74, 79, 76, 82, 88, 84, 90, 96, 92, 99, 108,
];

const byModel = [
  { name: "GPT-4o", value: 5398, color: "#2563EB" },
  { name: "Claude Sonnet", value: 3594, color: "#0EA5E9" },
  { name: "Gemini 2.5", value: 2310, color: "#10B981" },
  { name: "DeepSeek V3", value: 1545, color: "#F59E0B" },
];

const byFeature = [
  { name: "Customer Support Agent", value: 4280 },
  { name: "Document Summarization", value: 2940 },
  { name: "Code Assistant", value: 2110 },
  { name: "Search & RAG", value: 1820 },
  { name: "Email Drafting", value: 980 },
  { name: "Internal Tools", value: 717 },
];

const tokens = [
  { label: "Input tokens", value: "248.4M", pct: 64, color: "#2563EB" },
  { label: "Output tokens", value: "112.7M", pct: 29, color: "#10B981" },
  { label: "Cached tokens", value: "26.1M", pct: 7, color: "#F59E0B" },
];

const users = [
  { name: "Engineering", reqs: 542_000, cost: 4820 },
  { name: "Support", reqs: 318_000, cost: 2940 },
  { name: "Sales", reqs: 184_000, cost: 1720 },
  { name: "Marketing", reqs: 96_000, cost: 920 },
  { name: "Operations", reqs: 64_000, cost: 580 },
];

function AnalyticsPage() {
  return (
    <AppShell
      title="Analytics"
      subtitle="Multi-dimensional breakdowns of usage, cost, and performance."
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Header label="Requests over time" hint="Last 30 days · per minute (k)" />
          <LineChart data={reqsOverTime} />
        </Card>
        <Card>
          <Header label="Cost by model" hint="Last 30 days" />
          <div className="mt-4 flex flex-col gap-3">
            {byModel.map((m) => {
              const total = byModel.reduce((s, x) => s + x.value, 0);
              const pct = (m.value / total) * 100;
              return (
                <div key={m.name}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-[#0F172A]">{m.name}</span>
                    <span className="text-[#64748B]">${m.value.toLocaleString()}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#0F172A]/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: m.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Header label="Cost by feature" hint="Last 30 days" />
          <div className="mt-4 flex flex-col gap-3">
            {byFeature.map((f) => {
              const max = Math.max(...byFeature.map((x) => x.value));
              const pct = (f.value / max) * 100;
              return (
                <div key={f.name}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-[#0F172A]">{f.name}</span>
                    <span className="text-[#64748B]">${f.value.toLocaleString()}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#0F172A]/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#0EA5E9]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <Header label="Token usage" hint="Last 30 days · 387.2M total" />
          <div className="mt-4 flex h-3 overflow-hidden rounded-full">
            {tokens.map((t) => (
              <div
                key={t.label}
                style={{ width: `${t.pct}%`, background: t.color }}
              />
            ))}
          </div>
          <div className="mt-4 space-y-2.5">
            {tokens.map((t) => (
              <div
                key={t.label}
                className="flex items-center justify-between text-[12px]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: t.color }}
                  />
                  <span className="text-[#475569]">{t.label}</span>
                </div>
                <span className="font-medium text-[#0F172A]">{t.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Header label="User activity" hint="By team · last 30 days" />
          <div className="mt-3 overflow-hidden rounded-xl border border-[#0F172A]/8">
            <table className="w-full text-[13px]">
              <thead className="bg-[#F8FAFC] text-left text-[11px] uppercase tracking-wider text-[#64748B]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Team</th>
                  <th className="px-4 py-2.5 font-medium">Requests</th>
                  <th className="px-4 py-2.5 font-medium">Cost</th>
                  <th className="px-4 py-2.5 font-medium">Avg / req</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F172A]/8 bg-white">
                {users.map((u) => (
                  <tr key={u.name}>
                    <td className="px-4 py-2.5 font-medium text-[#0F172A]">
                      {u.name}
                    </td>
                    <td className="px-4 py-2.5 text-[#475569]">
                      {u.reqs.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-[#475569]">
                      ${u.cost.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-[#475569]">
                      ${(u.cost / (u.reqs / 1000)).toFixed(3)}/1k
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <Header label="Performance trend" hint="p50 / p95 latency · last 7d" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="p50 latency" value="612 ms" delta="-4.1%" good />
            <Metric label="p95 latency" value="1.84 s" delta="+2.6%" />
            <Metric label="Success rate" value="99.58%" delta="+0.04%" good />
            <Metric label="Cache hit" value="22.4%" delta="+3.1%" good />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Header({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="text-[12px] font-medium uppercase tracking-wider text-[#94A3B8]">
          {label}
        </div>
      </div>
      {hint && <div className="text-[11px] text-[#94A3B8]">{hint}</div>}
    </div>
  );
}

function Metric({
  label,
  value,
  delta,
  good,
}: {
  label: string;
  value: string;
  delta: string;
  good?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#0F172A]/8 bg-white p-3">
      <div className="text-[11px] uppercase tracking-wider text-[#94A3B8]">
        {label}
      </div>
      <div className="mt-1 text-[18px] font-semibold tracking-tight text-[#0F172A]">
        {value}
      </div>
      <div
        className={`mt-0.5 text-[11px] font-medium ${
          good ? "text-emerald-600" : "text-[#475569]"
        }`}
      >
        {delta}
      </div>
    </div>
  );
}

function LineChart({ data }: { data: number[] }) {
  const w = 800;
  const h = 240;
  const pad = 16;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y =
      pad + (h - pad * 2) * (1 - (v - min) / Math.max(1, max - min));
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[240px] w-full">
        <defs>
          <linearGradient id="a-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1={pad}
            x2={w - pad}
            y1={pad + (h - pad * 2) * p}
            y2={pad + (h - pad * 2) * p}
            stroke="#0F172A"
            strokeOpacity="0.06"
          />
        ))}
        <path
          d={`${line} L${pts[pts.length - 1][0]},${h - pad} L${pad},${h - pad} Z`}
          fill="url(#a-area)"
        />
        <path d={line} fill="none" stroke="#0EA5E9" strokeWidth="2" />
      </svg>
    </div>
  );
}
