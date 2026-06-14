import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app/AppShell";
import {
  ArrowRight,
  Cpu,
  Database,
  GitMerge,
  Layers,
  Sparkles,
  TrendingDown,
} from "lucide-react";

export const Route = createFileRoute("/cost-optimizer")({
  head: () => ({
    meta: [
      { title: "Cost Optimizer — Techies" },
      {
        name: "description",
        content:
          "AI-generated cost optimization opportunities with reason, savings estimate, and confidence.",
      },
    ],
  }),
  component: CostOptimizerPage,
});

type Confidence = "High" | "Medium" | "Low";

const recommendations: {
  icon: typeof Cpu;
  title: string;
  why: string;
  how: string;
  monthly: number;
  confidence: Confidence;
  affects: string;
}[] = [
  {
    icon: Cpu,
    title: "Route low-complexity prompts to GPT-4o Mini",
    why: "62% of `customer-support` requests have input <800 tokens and a single-turn answer. Quality benchmarks show ≤1.2% drop on these prompts when downgraded.",
    how: "GPT-4o Mini costs $0.15 / 1M input vs $5.00 for GPT-4o (≈97% cheaper). Eligible volume = 412k req/mo at avg 720 input + 180 output tokens.",
    monthly: 1842,
    confidence: "High",
    affects: "customer-support · search-rag",
  },
  {
    icon: Layers,
    title: "Trim system-prompt context by 40%",
    why: "Your `doc-summarizer` system prompt repeats schema definitions on every call. Token logs show 1,840 tokens of static context per request.",
    how: "Move static instructions to a cached system message. Reduces avg input tokens from 3,140 → 1,890 across 96k req/mo.",
    monthly: 624,
    confidence: "High",
    affects: "doc-summarizer",
  },
  {
    icon: Database,
    title: "Enable semantic caching for embedding lookups",
    why: "28% of embedding requests in the last 14 days were near-duplicates (cosine similarity >0.96). They produced identical downstream completions.",
    how: "A 0.95 similarity cache with 24h TTL would absorb ~110k requests/mo with zero quality impact on RAG retrieval scores.",
    monthly: 412,
    confidence: "Medium",
    affects: "search-rag",
  },
  {
    icon: GitMerge,
    title: "Deduplicate parallel agent tool calls",
    why: "Your `code-assistant` agent issues the same `read_file` tool call 2.4× per task on average due to independent sub-agent steps.",
    how: "Add a per-task tool-call memo. Estimated 18% reduction in completion tokens on long agent runs (54k req/mo).",
    monthly: 286,
    confidence: "Medium",
    affects: "code-assistant",
  },
  {
    icon: Cpu,
    title: "Switch internal-tools traffic to DeepSeek V3",
    why: "Internal tools traffic is non-customer-facing and tolerates higher latency. Eval scores within 3.4% of GPT-4o on your benchmark set.",
    how: "DeepSeek V3 is ~12× cheaper per output token. Eligible volume = 38k req/mo at avg 1,200 output tokens.",
    monthly: 198,
    confidence: "Low",
    affects: "internal-tools",
  },
];

const totalSavings = recommendations.reduce((s, r) => s + r.monthly, 0);
const currentSpend = 12_847;
const projected = currentSpend - totalSavings;

const conf: Record<Confidence, string> = {
  High: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
};

function CostOptimizerPage() {
  return (
    <AppShell
      title="Cost Optimizer"
      subtitle="Autonomous recommendations to cut LLM spend without sacrificing quality."
      actions={
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#0F172A]/90">
          <Sparkles className="h-3.5 w-3.5" /> Run analysis
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <div className="text-[12px] font-medium uppercase tracking-wider text-[#94A3B8]">
            Current monthly spend
          </div>
          <div className="mt-2 text-[32px] font-semibold tracking-tight text-[#0F172A]">
            ${currentSpend.toLocaleString()}
          </div>
          <div className="mt-1 text-[12px] text-[#64748B]">
            Trailing 30 days · across 4 providers
          </div>
        </Card>
        <Card>
          <div className="text-[12px] font-medium uppercase tracking-wider text-[#94A3B8]">
            Identified savings
          </div>
          <div className="mt-2 inline-flex items-baseline gap-2">
            <span className="text-[32px] font-semibold tracking-tight text-emerald-600">
              ${totalSavings.toLocaleString()}
            </span>
            <span className="text-[13px] font-medium text-emerald-700">
              /mo
            </span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-[12px] text-emerald-700">
            <TrendingDown className="h-3.5 w-3.5" />
            {((totalSavings / currentSpend) * 100).toFixed(1)}% reduction
            available
          </div>
        </Card>
        <Card>
          <div className="text-[12px] font-medium uppercase tracking-wider text-[#94A3B8]">
            Projected spend
          </div>
          <div className="mt-2 text-[32px] font-semibold tracking-tight text-[#0F172A]">
            ${projected.toLocaleString()}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0F172A]/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              style={{
                width: `${(projected / currentSpend) * 100}%`,
              }}
            />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold tracking-tight text-[#0F172A]">
            Optimization opportunities
          </h2>
          <span className="text-[12px] text-[#64748B]">
            {recommendations.length} recommendations · sorted by impact
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {recommendations.map((r) => (
            <Card key={r.title}>
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="flex items-start gap-3 lg:w-1/2">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                    <r.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-[#0F172A]">
                        {r.title}
                      </h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${conf[r.confidence]}`}
                      >
                        {r.confidence} confidence
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#94A3B8]">
                      Affects: {r.affects}
                    </div>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                  <div className="space-y-2 text-[13px] leading-relaxed">
                    <div>
                      <span className="font-semibold text-[#0F172A]">
                        Why:
                      </span>{" "}
                      <span className="text-[#475569]">{r.why}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">
                        How it saves:
                      </span>{" "}
                      <span className="text-[#475569]">{r.how}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-2 lg:min-w-[140px]">
                    <div className="text-right">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-[#94A3B8]">
                        Est. savings
                      </div>
                      <div className="text-[22px] font-semibold tracking-tight text-emerald-600">
                        ${r.monthly.toLocaleString()}
                        <span className="text-[12px] font-medium text-emerald-700">
                          /mo
                        </span>
                      </div>
                    </div>
                    <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0F172A]/90">
                      Apply <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
