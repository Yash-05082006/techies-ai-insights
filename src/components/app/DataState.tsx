import { AlertTriangle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingBanner({ label = "Loading telemetry…" }: { label?: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#0F172A]/8 bg-white px-3 py-2 text-[12px] text-[#64748B]">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2563EB]" />
      {label}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div>
        <div className="font-semibold">Unable to load live telemetry</div>
        <div className="mt-0.5">{message}</div>
      </div>
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-[#0F172A]/8 bg-white/80 p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-2 h-3 w-28" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-[#0F172A]/8 bg-white/80 p-5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-56" />
      <Skeleton className="mt-6 h-[180px] w-full" />
    </div>
  );
}
