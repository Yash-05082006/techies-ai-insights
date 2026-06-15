import { motion } from "framer-motion";
import { Activity, Coins, LineChart, Gauge, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "See Every Request",
    desc: "Watch exactly what your AI apps are doing in real-time, step by step.",
    accent: "#2563EB",
  },
  {
    icon: Coins,
    title: "Track Token Costs",
    desc: "Know exactly which users and features are costing you the most money.",
    accent: "#0EA5E9",
  },
  {
    icon: LineChart,
    title: "Understand Your Bills",
    desc: "Break down your expenses by model and project so you never get a surprise bill.",
    accent: "#10B981",
  },
  {
    icon: Gauge,
    title: "Monitor App Speed",
    desc: "Make sure your AI isn't slowing down your application and compare different models.",
    accent: "#F59E0B",
  },
  {
    icon: ShieldCheck,
    title: "Keep AI Reliable",
    desc: "Catch errors, rate limits, and broken responses before your users do.",
    accent: "#6366F1",
  },
  {
    icon: Sparkles,
    title: "Find Ways to Reduce AI Costs",
    desc: "Get automated suggestions on how to cut your AI bill without losing quality.",
    accent: "#EF4444",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Platform"
          title="Everything you need to monitor, understand and reduce AI costs."
          desc="See exactly what your AI is doing, how much it costs, and where you can save money."
        />

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-3xl border border-[#0F172A]/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Glow on hover */}
              <div
                className="absolute -inset-px -z-10 rounded-3xl opacity-0 blur-2xl transition-opacity group-hover:opacity-30"
                style={{
                  background: `radial-gradient(circle at top left, ${f.accent}, transparent 60%)`,
                }}
              />
              <div
                className="relative grid h-12 w-12 place-items-center rounded-2xl text-white transition-transform duration-300 group-hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${f.accent}, ${f.accent}99)` }}
              >
                <f.icon className="h-5 w-5" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/30" />
              </div>
              <h3 className="mt-5 text-[20px] font-semibold tracking-tight text-[#0F172A]">
                {f.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#64748B]">{f.desc}</p>

              <div className="mt-6 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F172A] opacity-0 transition-opacity group-hover:opacity-100">
                <span style={{ color: f.accent }}>Explore</span>
                <span style={{ color: f.accent }}>→</span>
              </div>

              {/* Decorative corner */}
              <div
                className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full opacity-[0.04] transition-opacity group-hover:opacity-[0.08]"
                style={{ background: f.accent }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  desc,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#2563EB]/15 bg-[#2563EB]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2563EB]"
      >
        <span className="h-1 w-1 rounded-full bg-[#2563EB]" />
        {eyebrow}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="mt-5 text-[40px] font-semibold tracking-[-0.025em] text-[#0F172A] sm:text-[52px]"
      >
        {title}
      </motion.h2>
      {desc && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-4 text-[17px] leading-relaxed text-[#64748B]"
        >
          {desc}
        </motion.p>
      )}
    </div>
  );
}
