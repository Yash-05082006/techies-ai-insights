import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bell,
  LayoutDashboard,
  ScrollText,
  Settings,
  Sparkles,
  User,
  Wallet,
  Workflow,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/logs", label: "Logs", icon: ScrollText },
  { to: "/cost-optimizer", label: "Cost Optimizer", icon: Wallet },
  { to: "/integrations", label: "Integrations", icon: Workflow },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* lightweight background, no aura on product pages */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_60%,#F1F5F9_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-50" />

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 lg:px-8">
        {/* Sidebar */}
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col rounded-2xl border border-[#0F172A]/8 bg-white/70 p-4 backdrop-blur-xl lg:flex">
          <Link to="/" className="mb-6 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#0F172A] text-white">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[14px] font-semibold tracking-tight text-[#0F172A]">
                Techies
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
                Observability
              </div>
            </div>
          </Link>

          <nav className="flex flex-col gap-0.5">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#0F172A]/[0.05] hover:text-[#0F172A]"
                activeProps={{
                  className:
                    "bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/10 hover:text-[#2563EB]",
                }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-[#0F172A]/8 bg-gradient-to-br from-[#2563EB]/5 to-[#0EA5E9]/5 p-3">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-[#0F172A]">
              <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
              Optimization Agent
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#64748B]">
              3 new savings opportunities found this week.
            </p>
            <Link
              to="/cost-optimizer"
              className="mt-2 inline-block text-[11px] font-semibold text-[#2563EB] hover:underline"
            >
              Review →
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <div className="sticky top-0 z-20 -mx-4 mb-6 flex items-center justify-between border-b border-[#0F172A]/8 bg-white/70 px-4 py-4 backdrop-blur-xl lg:-mx-8 lg:px-8">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 text-[13px] text-[#64748B]">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <button className="grid h-9 w-9 place-items-center rounded-lg text-[#475569] transition-colors hover:bg-[#0F172A]/[0.05] hover:text-[#0F172A]">
                <Bell className="h-4 w-4" />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-lg text-[#475569] transition-colors hover:bg-[#0F172A]/[0.05] hover:text-[#0F172A]">
                <Settings className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 rounded-full border border-[#0F172A]/8 bg-white py-1 pl-1 pr-3">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] text-white">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="text-[12px] font-medium text-[#0F172A]">
                  Aria
                </span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#0F172A]/8 bg-white/80 p-5 backdrop-blur-sm soft-shadow ${className}`}
    >
      {children}
    </div>
  );
}
