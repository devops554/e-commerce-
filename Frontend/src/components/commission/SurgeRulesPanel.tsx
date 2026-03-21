"use client"
import React, { useState } from "react"
import { commissionService, SurgeRule } from "@/services/commission.service"
import { toast } from "sonner"
import { CreateSurgeRuleModal } from "./CreateSurgeRuleModal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Plus, CloudRain, Zap, Clock,
  CalendarRange, BarChart2, ToggleLeft, ToggleRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Trigger metadata ─────────────────────────────────────────────────────────
const TRIGGER_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  MANUAL: { label: "Manual", icon: ToggleRight, color: "text-slate-500" },
  TIME_WINDOW: { label: "Time window", icon: Clock, color: "text-indigo-500" },
  DATE_RANGE: { label: "Date range", icon: CalendarRange, color: "text-violet-500" },
  WEATHER: { label: "Rain / weather", icon: CloudRain, color: "text-blue-500" },
  DEMAND: { label: "Demand surge", icon: BarChart2, color: "text-amber-500" },
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export function SurgeRulesPanel({
  surges,
  onRefresh,
}: {
  surges: SurgeRule[]
  onRefresh: () => void
}) {
  const [toggling, setToggling] = useState<string | null>(null)
  const [rainLoading, setRainLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const rainSurge = surges.find(
    (s) => s.triggerType === "WEATHER" || s.name.toLowerCase().includes("rain")
  )

  const activeCount = surges.filter((s) => s.isActive).length

  const toggleSurge = async (id: string, current: boolean) => {
    setToggling(id)
    try {
      await commissionService.toggleSurge(id, !current)
      toast.success(`Surge ${!current ? "activated" : "deactivated"}`)
      onRefresh()
    } catch {
      toast.error("Failed to toggle surge")
    } finally {
      setToggling(null)
    }
  }

  const handleRain = async (activate: boolean) => {
    setRainLoading(true)
    try {
      activate
        ? await commissionService.activateRain()
        : await commissionService.deactivateRain()
      toast.success(
        `Rain surge ${activate ? "activated" : "deactivated"} — partners notified`
      )
      onRefresh()
    } catch {
      toast.error("Failed to toggle rain surge")
    } finally {
      setRainLoading(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeCount > 0 ? (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 text-xs gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
              </span>
              {activeCount} active
            </Badge>
          ) : (
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-400 text-xs">
              All inactive
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          New surge rule
        </Button>
      </div>

      <CreateSurgeRuleModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={onRefresh}
      />

      {/* ── Rain quick-toggle card ── */}
      <Card className={cn(
        "border transition-all duration-200",
        rainSurge?.isActive
          ? "border-blue-300 bg-blue-50/80 shadow-sm"
          : "border-blue-100 bg-blue-50/40"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl transition-colors",
                rainSurge?.isActive ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-500"
              )}>
                <CloudRain className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-blue-900 text-sm">Rain surge</p>
                  {rainSurge?.isActive && (
                    <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0">
                      Live
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-blue-600 mt-0.5">
                  All active deliveries get{" "}
                  <span className="font-semibold">{rainSurge?.multiplier ?? 1.5}×</span>{" "}
                  pay instantly — partners notified
                </p>
              </div>
            </div>

            {/* Right: toggle buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant={rainSurge?.isActive ? "outline" : "default"}
                disabled={rainLoading || rainSurge?.isActive}
                onClick={() => handleRain(true)}
                className={cn(
                  "h-8 text-xs font-medium min-w-[90px]",
                  !rainSurge?.isActive && "bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                )}
              >
                {rainLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Working…
                  </span>
                ) : "Activate"}
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={rainLoading || !rainSurge?.isActive}
                onClick={() => handleRain(false)}
                className="h-8 text-xs font-medium min-w-[90px] border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Deactivate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Surge list ── */}
      {surges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Zap className="h-7 w-7 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">No surge rules yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Create one to control pay multipliers</p>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" /> Create first rule
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {surges.map((surge) => {
            const meta = TRIGGER_META[surge.triggerType] ?? TRIGGER_META.MANUAL
            const Icon = meta.icon
            const isOn = surge.isActive
            const busy = toggling === surge._id

            return (
              <div
                key={surge._id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-150",
                  isOn
                    ? "border-amber-200 bg-amber-50/60"
                    : "border-slate-100 bg-white hover:bg-slate-50"
                )}
              >
                {/* Left */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    isOn ? "bg-amber-100" : "bg-slate-100"
                  )}>
                    <Icon className={cn("h-3.5 w-3.5", isOn ? "text-amber-600" : "text-slate-500")} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-slate-900 truncate">{surge.name}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold px-1.5 shrink-0",
                          isOn
                            ? "border-amber-300 bg-amber-100 text-amber-700"
                            : "border-slate-200 bg-slate-50 text-slate-400"
                        )}
                      >
                        {surge.multiplier}×
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={cn("text-xs", meta.color, "font-medium")}>{meta.label}</span>
                      {surge.startHour != null && surge.endHour != null && (
                        <>
                          <span className="text-slate-300 text-xs">·</span>
                          <span className="text-xs text-slate-500">
                            {String(surge.startHour).padStart(2, "0")}:00 – {String(surge.endHour).padStart(2, "0")}:00
                          </span>
                        </>
                      )}
                      {surge.validFrom && (
                        <>
                          <span className="text-slate-300 text-xs">·</span>
                          <span className="text-xs text-slate-500">
                            {new Date(surge.validFrom).toLocaleDateString()} →{" "}
                            {surge.validTo ? new Date(surge.validTo).toLocaleDateString() : "∞"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: toggle switch */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleSurge(surge._id, isOn)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400",
                    isOn ? "bg-amber-500" : "bg-slate-200",
                    busy && "opacity-50 cursor-not-allowed"
                  )}
                  aria-label={isOn ? "Deactivate surge" : "Activate surge"}
                >
                  <span className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                    isOn ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}