import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app/AppShell";
import { InfoTooltip } from "@/components/ui/tooltip";
import { Sparkles, TrendingDown, ArrowRight, ShieldAlert, FileText, Activity } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/cost-optimizer")({
  head: () => ({
    meta: [
      { title: "Optimization Agent — TRACEai" },
      {
        name: "description",
        content:
          "AI-generated, telemetry-grounded recommendations to reduce LLM spend without sacrificing quality.",
      },
    ],
  }),
  component: OptimizerPage,
});

type RiskLevel = "Low" | "Medium" | "High";

type Recommendation = {
  id: string;
  issue: string;
  evidence: string;
  recommendation: string;
  savings: number;
  risk: RiskLevel;
  reasoning: string;
  affects: string;
  lever: string;
  sampleSize: string;
  qualityImpact: string;
  evidenceSource: string;
  calculationDetails: string;
  implementationEffort: string;
  confidenceScore: string;
  confidenceFactors: string[];
  whyItMatters: string;
  currentSpend: number;
};

const RECS: Recommendation[] = [
  {
    id: "rec_01",
    issue: "GPT-4o is being used for low-complexity requests on /customer-support endpoint.",
    evidence:
      "92% of requests to /customer-support contain fewer than 300 input tokens and produce ≤120 output tokens. Across the last 30 days that is 412,840 of 449,000 requests routed to gpt-4o.",
    recommendation:
      "Route these short, single-turn requests to claude-haiku-4-5 (or gpt-4o-mini) when the input length classifier returns <300 tokens.",
    savings: 1842,
    risk: "Low",
    reasoning:
      "gpt-4o costs $5.00 / 1M input tokens vs $0.80 for haiku ($0.15 for gpt-4o-mini). Eligible volume ≈ 412.8k req/mo × 480 avg total tokens = 198M tokens shifted. Quality regression on your eval set: 1.2% on intent-classification benchmarks, well within acceptable threshold for support tier-1.",
    affects: "/customer-support · gpt-4o",
    lever: "Model right-sizing",
    sampleSize: "449,000 requests",
    qualityImpact: "Minimal (1.2% regression on internal intent evals)",
    evidenceSource: "Telemetry from /customer-support (Last 30 days)",
    calculationDetails: "(412.8k * 480 tokens) * ($5.00 - $0.15) / 1M = $1,842",
    implementationEffort: "< 1 day",
    confidenceScore: "93%",
    confidenceFactors: [
      "449,000 requests analyzed",
      "30 days telemetry",
      "internal evaluation results"
    ],
    whyItMatters: "Using an over-powered model for simple classification tasks wastes budget with no measurable gain in accuracy.",
    currentSpend: 2140,
  },
  {
    id: "rec_02",
    issue: "/doc-summarizer endpoint repeats the same 1,840-token system prompt on every call.",
    evidence:
      "Telemetry shows 96,200 requests/mo to /doc-summarizer with input_tokens distribution centered at 3,140 tokens. Static prefix (schema + style rules) accounts for 1,840 tokens (58.6%) per request.",
    recommendation:
      "Move the static system prompt into Anthropic prompt caching (or OpenAI cached input). Re-issue dynamic instructions only on cache miss.",
    savings: 624,
    risk: "Low",
    reasoning:
      "Cached input tokens are billed at 10% of standard rate on Anthropic, 50% on OpenAI. At 96.2k req/mo × 1,840 cached tokens × $3.00/1M, baseline cost = $531/mo. With 90% cache hit (after 24h TTL warmup), savings ≈ 90% × 90% = 81% of the prefix cost across both providers, plus reduced TTFT.",
    affects: "/doc-summarizer · claude-sonnet-4-5",
    lever: "Prompt caching",
    sampleSize: "96,200 requests",
    qualityImpact: "None (Zero regression, 100% identical outputs)",
    evidenceSource: "Token distribution analysis on /doc-summarizer",
    calculationDetails: "96.2k * 1,840 * $3.00/1M * 81% cache efficiency = $624",
    implementationEffort: "1-2 days",
    confidenceScore: "98%",
    confidenceFactors: [
      "96,200 requests analyzed",
      "Static prefix exact match verified",
      "Provider caching APIs supported"
    ],
    whyItMatters: "Prompt caching can drastically reduce latency and cost for repetitive system prompts, creating a better UX at a fraction of the price.",
    currentSpend: 780,
  },
  {
    id: "rec_03",
    issue: "Repeated near-duplicate embedding lookups on /search-rag are not deduplicated.",
    evidence:
      "Captured embedding requests show 28% pair-wise cosine similarity >0.96 in a 14-day window. 110,400 of 394,200 embedding calls produced effectively identical downstream retrieval sets.",
    recommendation:
      "Enable a 0.95-similarity semantic cache (24h TTL) in front of the embedding endpoint and short-circuit RAG completion when the retrieved-set hash matches a cached completion.",
    savings: 412,
    risk: "Medium",
    reasoning:
      "Semantic cache eliminates both the embedding call ($0.02 / 1M tokens × ~840 avg = negligible) and the downstream completion call ($0.0089 avg). 110.4k saved completions × $0.0089 ≈ $982/mo gross; discounting for cache-validation overhead and 30% conservative hit-rate haircut: $412/mo net.",
    affects: "/search-rag · gpt-4o",
    lever: "Semantic caching",
    sampleSize: "394,200 embedding calls",
    qualityImpact: "Low (Slight staleness in highly dynamic retrieved sets)",
    evidenceSource: "Cosine similarity matrix over 14-day trailing data",
    calculationDetails: "110.4k hits * $0.0089 completion cost - cache overhead = $412",
    implementationEffort: "1 week",
    confidenceScore: "85%",
    confidenceFactors: [
      "394,200 embedding calls analyzed",
      "14 days similarity scoring",
      "Redis semantic cache overhead estimated"
    ],
    whyItMatters: "Re-generating completions for identical retrieved context wastes both embedding APIs and completion APIs unnecessarily.",
    currentSpend: 1350,
  },
];

const totalSavings = RECS.reduce((s, r) => s + r.savings, 0);
const currentSpend = 12_847;
const projected = currentSpend - totalSavings;

const riskStyles: Record<RiskLevel, { badge: string; iconColor: string }> = {
  Low: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", iconColor: "text-emerald-600" },
  Medium: { badge: "bg-amber-50 text-amber-700 ring-amber-200", iconColor: "text-amber-600" },
  High: { badge: "bg-red-50 text-red-700 ring-red-200", iconColor: "text-red-600" },
};

function OptimizerPage() {
  const [filter, setFilter] = useState<"all" | RiskLevel>("all");
  const rows = RECS.filter((r) => filter === "all" || r.risk === filter);

  return (
    <AppShell
      title="Optimization Agent"
      subtitle="AI-generated, telemetry-grounded recommendations to reduce LLM spend without sacrificing quality."
      actions={
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#0F172A]/90 transition-colors">
          <Sparkles className="h-3.5 w-3.5" /> Re-run analysis
        </button>
      }
    >
      {/* Top Stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">
            Current monthly spend
            <InfoTooltip content="Calculated directly from captured proxy traffic over the trailing 30 days." />
          </div>
          <div className="mt-2 text-[28px] font-semibold tracking-tight text-[#0F172A]">
            ${currentSpend.toLocaleString()}
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">
            Identified savings
            <InfoTooltip content="The total projected reduction in monthly cost if all displayed recommendations are implemented." />
          </div>
          <div className="mt-2 inline-flex items-baseline gap-2">
            <span className="text-[28px] font-semibold tracking-tight text-emerald-600">
              ${totalSavings.toLocaleString()}
            </span>
            <span className="text-[13px] font-medium text-emerald-700">/mo</span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-[12px] text-emerald-700">
            <TrendingDown className="h-3.5 w-3.5" />
            {((totalSavings / currentSpend) * 100).toFixed(1)}% reduction available
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">
            Projected spend
            <InfoTooltip content="Your new estimated monthly spend after applying these optimizations." />
          </div>
          <div className="mt-2 text-[28px] font-semibold tracking-tight text-[#0F172A]">
            ${projected.toLocaleString()}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0F172A]/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              style={{ width: `${(projected / currentSpend) * 100}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="mt-8 mb-4 flex items-center justify-between border-b border-[#0F172A]/8 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-semibold tracking-tight text-[#0F172A]">
            Actionable Recommendations
          </h2>
          <InfoTooltip content="Analyzed based on your live telemetry using our multi-agent architecture." />
        </div>
        <div className="inline-flex rounded-lg border border-[#0F172A]/8 bg-white p-0.5">
          {(["all", "Low", "Medium", "High"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-md px-3 py-1 text-[12px] font-medium ${
                filter === c ? "bg-[#0F172A] text-white" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {c === "all" ? "All Risks" : `${c} Risk`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {rows.map((r) => (
          <Card key={r.id} className="p-0 overflow-hidden">
            {/* Header Area */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-[#0F172A]/8 bg-[#F8FAFC]/50">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                    {r.lever}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${riskStyles[r.risk].badge}`}
                  >
                    <ShieldAlert className={`h-3 w-3 ${riskStyles[r.risk].iconColor}`} />
                    {r.risk} Risk
                  </span>
                  <span className="text-[12px] text-[#64748B] ml-2 font-medium">
                    Affects:{" "}
                    <span className="font-mono bg-white border border-[#0F172A]/10 px-1 rounded">
                      {r.affects}
                    </span>
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-[#0F172A] leading-snug max-w-3xl">
                  {r.issue}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Expected savings
                </div>
                <div className="text-[24px] font-semibold tracking-tight text-emerald-600">
                  ${r.savings.toLocaleString()}
                  <span className="text-[13px] font-medium text-emerald-700">/mo</span>
                </div>
              </div>
            </div>

            {/* Grid Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#0F172A]/8">
              {/* Left Column: Solution & Reasoning */}
              <div className="p-5 space-y-5">
                <Field label="Recommendation" body={r.recommendation} accent="#10B981" />
                <Field label="Technical Reasoning" body={r.reasoning} accent="#7C3AED" mono />
              </div>

              {/* Right Column: Data & Math */}
              <div className="bg-[#F8FAFC]/40 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
                  <Activity className="h-4 w-4 text-[#2563EB]" /> Data Analysis Profile
                </div>

                <DataPoint
                  label="Evidence Source"
                  val={r.evidenceSource}
                  tooltip="Where TRACEai sourced the data for this recommendation."
                />
                <DataPoint
                  label="Sample Size"
                  val={r.sampleSize}
                  tooltip="Number of requests analyzed to form this conclusion."
                />
                <DataPoint
                  label="Quality Impact"
                  val={r.qualityImpact}
                  tooltip="Projected impact on output quality or latency."
                />
                <DataPoint
                  label="Savings Math"
                  val={r.calculationDetails}
                  mono
                  tooltip="The precise formula used to calculate expected savings."
                />
              </div>
            </div>

            {/* Business Impact & Actionability */}
            <div className="border-t border-[#0F172A]/8 bg-white p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col gap-1 p-3 rounded-lg border border-[#0F172A]/8 bg-[#F8FAFC]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Current Spend</span>
                  <span className="text-[16px] font-semibold text-[#0F172A]">${r.currentSpend.toLocaleString()}/mo</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-lg border border-[#0F172A]/8 bg-[#F8FAFC]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Projected</span>
                  <span className="text-[16px] font-semibold text-[#0F172A]">${(r.currentSpend - r.savings).toLocaleString()}/mo</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Monthly Savings</span>
                  <span className="text-[16px] font-semibold text-emerald-700">${r.savings.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Annual Savings</span>
                  <span className="text-[16px] font-semibold text-emerald-700">${(r.savings * 12).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0F172A] mb-2">
                    Actionability
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between text-[12px]">
                      <span className="text-[#64748B] flex items-center gap-1">Implementation Time <InfoTooltip content="Estimated engineering effort required to implement this fix." /></span>
                      <span className="font-medium text-[#0F172A]">{r.implementationEffort}</span>
                    </li>
                    <li className="flex items-center justify-between text-[12px]">
                      <span className="text-[#64748B] flex items-center gap-1">Risk Level <InfoTooltip content="Potential for negative impact on application stability or output quality." /></span>
                      <span className="font-medium text-[#0F172A]">{r.risk}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0F172A] mb-2">
                    Confidence Explanation
                  </div>
                  <p className="text-[12px] text-[#0F172A] mb-1.5 font-medium">{r.confidenceScore} confidence based on:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[12px] text-[#64748B]">
                    {r.confidenceFactors.map((factor, i) => <li key={i}>{factor}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Area */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#0F172A]/8 px-5 py-4 bg-[#F8FAFC]">
              <div className="flex items-center gap-2 text-[12px]">
                <button className="inline-flex items-center gap-1.5 font-medium text-[#2563EB] hover:underline">
                  <FileText className="h-3.5 w-3.5" /> View Detailed Analysis
                </button>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none rounded-lg border border-[#0F172A]/10 bg-white px-4 py-2 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                  Dismiss
                </button>
                <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#2563EB]/90 transition-colors shadow-sm">
                  Apply Fix <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

function Field({
  label,
  body,
  accent,
  mono,
}: {
  label: string;
  body: string;
  accent: string;
  mono?: boolean;
}) {
  return (
    <div
      className="rounded-xl border border-[#0F172A]/8 bg-white p-4 shadow-sm"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
        {label}
      </div>
      <p
        className={`text-[13px] leading-relaxed text-[#0F172A] ${mono ? "font-mono text-[11.5px]" : ""}`}
      >
        {body}
      </p>
    </div>
  );
}

function DataPoint({
  label,
  val,
  mono,
  tooltip,
}: {
  label: string;
  val: string;
  mono?: boolean;
  tooltip?: string;
}) {
  return (
    <div className="flex items-start gap-3 justify-between py-2 border-b border-[#0F172A]/[0.04] last:border-0">
      <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-semibold text-[#64748B]">
        {label}
        {tooltip && <InfoTooltip content={tooltip} />}
      </div>
      <div
        className={`text-right text-[12px] font-medium text-[#0F172A] ${mono ? "font-mono text-[11px] bg-white border border-[#0F172A]/5 px-1.5 py-0.5 rounded" : ""}`}
      >
        {val}
      </div>
    </div>
  );
}
