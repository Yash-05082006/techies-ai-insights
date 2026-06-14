import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app/AppShell";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  Clock,
  DollarSign,
  TriangleAlert,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Techies" },
      {
        name: "description",
        content:
          "High-level observability overview: requests, cost, latency, and error rate across every LLM provider.",
      },
    ],
  }),
  component: DashboardPage,
});

const summary = [
  {
    label: "Total Requests",
    value: "1.42M",
    delta: "+8.4%",
    up: true,
    icon: Activity,
    accent: "#2563EB",
  },
  {
    label: "Total Cost",
    value: "$12,847",
    delta: "+4.1%",
    up: true,
    icon: DollarSign,
    accent: "#10B981",
  },
  {
    label: "Avg Latency",
    value: "812 ms",
    delta: "-6.2%",
    up: false,
    icon: Clock,
    accent: "#0EA5E9",
  },
  {
    label: "Error Rate",
    value: "0.42%",
    delta: "+0.08%",
    up: true,
    icon: TriangleAlert,
    accent: "#EF4444",
  },
];

const models = [
  { name: "GPT-4o", share: 42, cost: "$5,398", reqs: "612k" },
  { name: "Claude Sonnet 4.5", share: 28, cost: "$3,594", reqs: "398k" },
  { name: "Gemini 2.5 Pro", share: 18, cost: "$2,310", reqs: "256k" },
  { name: "DeepSeek V3", share: 12, cost: "$1,545", reqs: "154k" },
];

const alerts = [
  {
    severity: "high",
    title: "Cost spike detected on GPT-4o",
    detail:
      "Spend rose 38% above 7-day baseline between 14:00–15:30 UTC. Likely cause: long context prompts in `customer-support` feature.",
    time: "12 min ago",
  },
  {
    severity: "medium",
    title: "Latency increase on Claude Sonnet",
    detail:
      "p95 latency moved from 1.2s to 2.1s across the last hour. Affects 8% of requests.",
    time: "1 hr ago",
  },
  {
    severity: "low",
    title: "Failed requests increased",
    detail:
      "Error rate on Gemini 2.5 climbed from 0.2% to 0.9% — mostly `rate_limit_exceeded`.",
    time: "3 hr ago",
  },
];

// deterministic-looking chart data
const trend = [
  320, 340, 360, 410, 380, 460, 510, 480, 530, 590, 620, 580, 640, 700, 720,
  680, 750, 810, 790, 860, 920, 880, 940, 1020, 980, 1050, 1120, 1080, 1160,
  1240,
];

function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Overview of AI usage, spend, and reliability across all providers."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label}>
            <div className="flex items-start justify-between">
              <div
                className="grid h-9 w-9 place-items-center rounded-lg"
                style={{ background: `${s.accent}15`, color: s.accent }}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  s.up
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-sky-50 text-sky-700"
                }`}
              >
                {s.up ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {s.delta}
              </div>
            </div>
            <div className="mt-4 text-[12px] font-medium uppercase tracking-wider text-[#94A3B8]">
              {s.label}
            </div>
            <div className="mt-1 text-[28px] font-semibold tracking-tight text-[#0F172A]">
              {s.value}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] font-medium uppercase tracking-wider text-[#94A3B8]">
                AI Cost Trend
              </div>
              <div className="mt-0.5 text-[16px] font-semibold text-[#0F172A]">
                Last 30 days · daily spend
              </div>
            </div>
            <div className="flex gap-1.5 text-[11px]">
              {["7D", "30D", "90D"].map((p, i) => (
                <button
                  key={p}
                  className={`rounded-md px-2.5 py-1 ${
                    i === 1
                      ? "bg-[#0F172A] text-white"
                      : "bg-[#0F172A]/[0.04] text-[#475569] hover:bg-[#0F172A]/[0.08]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <TrendChart data={trend} />
        </Card>

        <Card>
          <div className="text-[12px] font-medium uppercase tracking-wider text-[#94A3B8]">
            Top Models
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {models.map((m) => (
              <div key={m.name}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#0F172A]">{m.name}</span>
                  <span className="text-[#64748B]">{m.cost}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#0F172A]/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#0EA5E9]"
                    style={{ width: `${m.share}%` }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-[#94A3B8]">
                  {m.reqs} requests · {m.share}% share
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-medium uppercase tracking-wider text-[#94A3B8]">
              Recent Alerts
            </div>
            <button className="text-[12px] font-medium text-[#2563EB] hover:underline">
              View all
            </button>
          </div>
          <div className="mt-3 divide-y divide-[#0F172A]/8">
            {alerts.map((a) => {
              const color =
                a.severity === "high"
                  ? "#EF4444"
                  : a.severity === "medium"
                  ? "#F59E0B"
                  : "#0EA5E9";
              return (
                <div key={a.title} className="flex gap-3 py-3">
                  <div
                    className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                    style={{ background: `${color}15`, color }}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[13px] font-semibold text-[#0F172A]">
                        {a.title}
                      </div>
                      <div className="shrink-0 text-[11px] text-[#94A3B8]">
                        {a.time}
                      </div>
                    </div>
                    <div className="mt-0.5 text-[12px] leading-relaxed text-[#64748B]">
                      {a.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function TrendChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 800;
  const h = 220;
  const pad = 16;
  const step = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y =
      pad + (h - pad * 2) * (1 - (v - min) / Math.max(1, max - min));
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${points[points.length - 1][0]},${h - pad} L${pad},${h - pad} Z`;
  return (
    <div className="mt-4 -mx-1 overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[220px] w-full">
        <defs>
          <linearGradient id="dash-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
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
        <path d={area} fill="url(#dash-area)" />
        <path d={line} fill="none" stroke="#2563EB" strokeWidth="2" />
      </svg>
    </div>
  );
}
