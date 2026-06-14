import { motion } from "framer-motion";
import { TrendingUp, EyeOff, Activity, AlertTriangle } from "lucide-react";

const challenges = [
  {
    title: "Uncontrolled AI Costs",
    description: "API bills grow unexpectedly with no clear way to attribute spend to specific users or features.",
    icon: <TrendingUp className="h-5 w-5 text-[#EF4444]" />,
  },
  {
    title: "No Visibility Into LLM Usage",
    description: "Operating blindly without understanding which prompts or models are driving the majority of traffic.",
    icon: <EyeOff className="h-5 w-5 text-[#F59E0B]" />,
  },
  {
    title: "Difficult Debugging & Tracing",
    description: "Hours wasted trying to reproduce hallucinated responses and debug complex multi-step LLM chains.",
    icon: <Activity className="h-5 w-5 text-[#2563EB]" />,
  },
  {
    title: "Model Performance Degradation",
    description: "Quality silently drops as models are updated or context windows are filled with irrelevant data.",
    icon: <AlertTriangle className="h-5 w-5 text-[#10B981]" />,
  },
];

export function Challenges() {
  return (
    <section className="relative py-12 md:py-16 lg:py-24 bg-transparent">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-semibold tracking-tight text-[#0F172A] sm:text-[40px]">
            Key Challenges Teams Face
          </h2>
          <p className="mt-4 text-[17px] text-[#475569]">
            Without proper observability, scaling AI in production is risky.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {challenges.map((challenge, i) => (
            <motion.div
              key={challenge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group rounded-2xl border border-[#0F172A]/8 bg-white/70 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F5F9] transition-transform duration-300 group-hover:scale-110">
                {challenge.icon}
              </div>
              <h3 className="mb-2 text-[16px] font-semibold text-[#0F172A]">
                {challenge.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-[#475569]">
                {challenge.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
