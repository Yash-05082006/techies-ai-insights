import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app/AppShell";
import { CheckCircle2, Circle, Plus } from "lucide-react";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Techies" },
      {
        name: "description",
        content:
          "Connect every major LLM provider — OpenAI, Anthropic, Gemini, Azure, Llama, DeepSeek, Groq, Mistral, Cohere, OpenRouter.",
      },
    ],
  }),
  component: IntegrationsPage,
});

const providers: {
  name: string;
  category: string;
  connected: boolean;
  lastSync?: string;
  models: number;
  letter: string;
  color: string;
}[] = [
  { name: "OpenAI", category: "Frontier Models", connected: true, lastSync: "2 min ago", models: 12, letter: "O", color: "#10A37F" },
  { name: "Anthropic", category: "Frontier Models", connected: true, lastSync: "5 min ago", models: 6, letter: "A", color: "#D97757" },
  { name: "Google Gemini", category: "Frontier Models", connected: true, lastSync: "12 min ago", models: 8, letter: "G", color: "#4285F4" },
  { name: "Azure OpenAI", category: "Cloud", connected: true, lastSync: "1 hr ago", models: 9, letter: "Az", color: "#0078D4" },
  { name: "Meta Llama", category: "Open Models", connected: false, models: 4, letter: "M", color: "#1877F2" },
  { name: "DeepSeek", category: "Open Models", connected: true, lastSync: "32 min ago", models: 3, letter: "D", color: "#4D6BFE" },
  { name: "Groq", category: "Inference", connected: false, models: 5, letter: "Gq", color: "#F55036" },
  { name: "Mistral", category: "Open Models", connected: false, models: 7, letter: "Mi", color: "#FF7000" },
  { name: "Cohere", category: "Enterprise", connected: false, models: 4, letter: "C", color: "#39594D" },
  { name: "OpenRouter", category: "Router", connected: true, lastSync: "8 min ago", models: 120, letter: "Or", color: "#6E56CF" },
];

function IntegrationsPage() {
  const connected = providers.filter((p) => p.connected).length;
  return (
    <AppShell
      title="Integrations"
      subtitle="Bring observability to every LLM provider in your stack."
      actions={
        <div className="hidden text-[12px] text-[#64748B] md:block">
          <span className="font-semibold text-[#0F172A]">{connected}</span> of{" "}
          {providers.length} connected
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => (
          <Card key={p.name}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl text-[13px] font-semibold text-white"
                  style={{ background: p.color }}
                >
                  {p.letter}
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-[#0F172A]">
                    {p.name}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-[#94A3B8]">
                    {p.category}
                  </div>
                </div>
              </div>
              {p.connected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  <Circle className="h-3 w-3" /> Not connected
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
                  Models
                </div>
                <div className="mt-0.5 font-semibold text-[#0F172A]">
                  {p.models}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
                  Last sync
                </div>
                <div className="mt-0.5 font-semibold text-[#0F172A]">
                  {p.lastSync ?? "—"}
                </div>
              </div>
            </div>

            <button
              className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors ${
                p.connected
                  ? "border border-[#0F172A]/10 bg-white text-[#0F172A] hover:bg-[#F8FAFC]"
                  : "bg-[#0F172A] text-white hover:bg-[#0F172A]/90"
              }`}
            >
              {p.connected ? (
                "Manage"
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Connect
                </>
              )}
            </button>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
