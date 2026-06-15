import { useState } from "react";
import { Zap, Layers, Calculator, ShieldCheck } from "lucide-react";
import { SectionHeader } from "./Features";

const MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    inputPrice: 5.0,
    outputPrice: 15.0,
    alt: "gpt-4o-mini",
    reason: "Similar quality for routine requests.",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    inputPrice: 6.0,
    outputPrice: 18.0,
    alt: "gpt-4o-mini",
    reason: "Advanced reasoning is often unnecessary for simple tasks.",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    inputPrice: 0.15,
    outputPrice: 0.6,
    alt: "deepseek-v3",
    reason: "DeepSeek-V3 offers equivalent intelligence at lower base cost.",
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    inputPrice: 3.0,
    outputPrice: 15.0,
    alt: "gemini-flash",
    reason: "Fast, everyday tasks can be routed to Gemini Flash.",
  },
  {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    inputPrice: 15.0,
    outputPrice: 75.0,
    alt: "claude-sonnet-4",
    reason: "Sonnet handles 90% of Opus use cases at a fraction of the cost.",
  },
  {
    id: "gemini-pro",
    name: "Gemini 2.5 Pro",
    inputPrice: 3.5,
    outputPrice: 10.5,
    alt: "gemini-flash",
    reason: "Flash is significantly cheaper for high-throughput.",
  },
  {
    id: "gemini-flash",
    name: "Gemini 2.5 Flash",
    inputPrice: 0.15,
    outputPrice: 0.6,
    alt: "deepseek-v3",
    reason: "Open-weights models can push your floor price even lower.",
  },
  {
    id: "llama-maverick",
    name: "Llama 4 Maverick",
    inputPrice: 0.5,
    outputPrice: 0.5,
    alt: "qwen-3",
    reason: "Qwen 3 is a highly efficient open-weights alternative.",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek-V3",
    inputPrice: 0.14,
    outputPrice: 0.28,
    alt: "deepseek-r1",
    reason: "Caching is highly effective for high-volume open model deployments.",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek-R1",
    inputPrice: 0.55,
    outputPrice: 2.19,
    alt: "deepseek-v3",
    reason: "Only use R1 for complex reasoning. Route everything else to V3.",
  },
  {
    id: "grok-4",
    name: "Grok 4",
    inputPrice: 2.0,
    outputPrice: 10.0,
    alt: "llama-maverick",
    reason: "Llama 4 offers similar performance at lower cost.",
  },
  {
    id: "qwen-3",
    name: "Qwen 3",
    inputPrice: 0.3,
    outputPrice: 1.2,
    alt: "deepseek-v3",
    reason: "DeepSeek V3 provides aggressive pricing for similar capability.",
  },
];

export function AICostCalculator() {
  const [requests, setRequests] = useState(1000000);
  const [inputTokens, setInputTokens] = useState(2000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [selectedModelId, setSelectedModelId] = useState("gpt-4o");

  const model = MODELS.find((m) => m.id === selectedModelId)!;
  const altModel = MODELS.find((m) => m.id === model.alt);

  // Calculations
  const currentCost =
    ((requests * inputTokens) / 1000000) * model.inputPrice +
    ((requests * outputTokens) / 1000000) * model.outputPrice;

  // Dynamic percentages based on realistic workload curves
  const routingPct = model.inputPrice > 2.0 ? 0.32 : 0.14; // Expensive models have more routing upside
  const cachingPct = requests > 500000 ? 0.21 : 0.08; // High volume = more cache hits
  const contextPct = inputTokens > 1500 ? 0.12 : 0.05; // Large context = more pruning upside

  const routingSavings = currentCost * routingPct;
  const cachingSavings = currentCost * cachingPct;
  const contextSavings = currentCost * contextPct;

  const totalMonthlySavings = routingSavings + cachingSavings + contextSavings;
  const optimizedCost = currentCost - totalMonthlySavings;

  const formatMoney = (val: number) => {
    if (val >= 100) return "$" + Math.round(val).toLocaleString();
    return "$" + val.toFixed(2);
  };

  return (
    <section id="calculator" className="relative py-12 md:py-16 lg:py-24 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Interactive ROI"
          title="Calculate Your Potential Savings"
          desc="Adjust the parameters to see exactly how TRACEai's optimization engine can reduce your LLM bill."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-12">
          {/* Controls (Left) */}
          <div className="lg:col-span-5 space-y-8 rounded-3xl border border-[#0F172A]/8 bg-white p-8 soft-shadow">
            <div className="flex items-center gap-3 border-b border-[#0F172A]/8 pb-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                <Calculator className="h-5 w-5" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#0F172A]">Workload Profile</h3>
            </div>

            <div className="space-y-6">
              {/* Model Select */}
              <div>
                <label className="text-[13px] font-semibold text-[#0F172A] mb-2 block">
                  Model Selection
                </label>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full rounded-xl border border-[#0F172A]/10 bg-white px-4 py-3 text-[14px] font-medium text-[#0F172A] outline-none transition-all focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monthly Requests */}
              <div>
                <div className="flex justify-between text-[13px] mb-2">
                  <label className="font-semibold text-[#0F172A]">Monthly Requests</label>
                  <span className="font-mono text-[#2563EB]">{requests.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={requests}
                  onChange={(e) => setRequests(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </div>

              {/* Input Tokens */}
              <div>
                <div className="flex justify-between text-[13px] mb-2">
                  <label className="font-semibold text-[#0F172A]">Avg. Input Tokens / Req</label>
                  <span className="font-mono text-[#2563EB]">{inputTokens.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="32000"
                  step="100"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </div>

              {/* Output Tokens */}
              <div>
                <div className="flex justify-between text-[13px] mb-2">
                  <label className="font-semibold text-[#0F172A]">Avg. Output Tokens / Req</label>
                  <span className="font-mono text-[#2563EB]">{outputTokens.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="8000"
                  step="50"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </div>
            </div>

            {/* Dynamic Recommendation Panel */}
            <div className="mt-8 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/5 p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#10B981] mb-3">
                Model Insight
              </div>
              <div className="text-[13px] text-[#0F172A]">
                <span className="font-semibold">Current:</span> {model.name}
              </div>
              {altModel && (
                <>
                  <div className="mt-1 text-[13px] text-[#0F172A]">
                    <span className="font-semibold">Recommended Alternative:</span> {altModel.name}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#475569]">
                    <span className="font-semibold">Why:</span> {model.reason}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Results (Right) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Top Stat Hero */}
            <div className="relative overflow-hidden rounded-3xl border border-[#0F172A]/8 bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-8 text-white lift-shadow flex-shrink-0">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#2563EB]/40 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#10B981]/20 blur-3xl" />

              <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <div className="text-[14px] text-white/60 mb-1">Current Monthly Cost</div>
                  <div className="text-[32px] font-semibold text-white/80 line-through decoration-white/30 decoration-2">
                    {formatMoney(currentCost)}
                  </div>
                </div>
                <div className="md:text-right">
                  <div className="text-[14px] font-medium text-[#10B981] mb-1">
                    Optimized Monthly Cost
                  </div>
                  <div className="text-[48px] font-semibold leading-none tracking-tight text-white">
                    {formatMoney(optimizedCost)}
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[12px] uppercase tracking-wider text-white/50 mb-1">
                    Total Monthly Savings
                  </div>
                  <div className="text-[24px] font-bold text-[#10B981]">
                    {formatMoney(totalMonthlySavings)}
                  </div>
                </div>
                <div className="hidden md:block h-10 w-px bg-white/10" />
                <div>
                  <div className="text-[12px] uppercase tracking-wider text-white/50 mb-1">
                    Total Annual Savings
                  </div>
                  <div className="text-[24px] font-bold text-[#10B981]">
                    {formatMoney(totalMonthlySavings * 12)}
                  </div>
                </div>
              </div>
            </div>

            {/* Opportunities Found Panel */}
            <div className="flex-1 rounded-3xl border border-[#0F172A]/8 bg-white p-8 soft-shadow">
              <h3 className="text-[18px] font-semibold text-[#0F172A] mb-6">
                Optimization Opportunities Found
              </h3>

              <div className="space-y-4">
                {/* Routing */}
                <div className="group relative flex items-start gap-4 rounded-2xl border border-[#0F172A]/8 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB] transition-transform duration-300 group-hover:scale-110">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-[14px] font-semibold text-[#0F172A]">Model Routing</h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${routingPct > 0.2 ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}
                      >
                        Confidence: {routingPct > 0.2 ? "High" : "Medium"}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-[#64748B]">
                      Route simple requests to cheaper models when possible.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[15px] font-semibold text-[#10B981]">
                      {formatMoney(routingSavings)}
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">/ month</div>
                  </div>
                </div>

                {/* Caching */}
                <div className="group relative flex items-start gap-4 rounded-2xl border border-[#0F172A]/8 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0EA5E9]/10 text-[#0EA5E9] transition-transform duration-300 group-hover:scale-110">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-[14px] font-semibold text-[#0F172A]">Semantic Caching</h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cachingPct > 0.15 ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}
                      >
                        Confidence: {cachingPct > 0.15 ? "High" : "Medium"}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-[#64748B]">
                      Avoid repeated calls for similar prompts.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[15px] font-semibold text-[#10B981]">
                      {formatMoney(cachingSavings)}
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">/ month</div>
                  </div>
                </div>

                {/* Context */}
                <div className="group relative flex items-start gap-4 rounded-2xl border border-[#0F172A]/8 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] transition-transform duration-300 group-hover:scale-110">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-[14px] font-semibold text-[#0F172A]">
                        Context Optimization
                      </h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${contextPct > 0.1 ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}
                      >
                        Confidence: {contextPct > 0.1 ? "High" : "Medium"}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-[#64748B]">
                      Reduce unnecessary retrieved context.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[15px] font-semibold text-[#10B981]">
                      {formatMoney(contextSavings)}
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">/ month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
