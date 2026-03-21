"use client"
import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { commissionService, SurgeRule } from "@/services/commission.service"
import { toast } from "sonner"
import {
  Zap, ToggleRight, Clock,
  CalendarRange, CloudRain, BarChart2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateSurgeRuleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// ─── Trigger type config ──────────────────────────────────────────────────────
const TRIGGER_TYPES = [
  {
    value: "MANUAL",
    label: "Manual",
    desc: "Admin toggles on/off manually anytime",
    icon: ToggleRight,
    color: "text-slate-500",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
  {
    value: "TIME_WINDOW",
    label: "Time window",
    desc: "Auto-activates daily between set hours",
    icon: Clock,
    color: "text-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    value: "DATE_RANGE",
    label: "Date range",
    desc: "Active during a specific date period",
    icon: CalendarRange,
    color: "text-violet-500",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    value: "WEATHER",
    label: "Rain / weather",
    desc: "Activated by rain flag or admin toggle",
    icon: CloudRain,
    color: "text-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "DEMAND",
    label: "Demand surge",
    desc: "Auto when partner availability drops below threshold",
    icon: BarChart2,
    color: "text-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
] as const

type TriggerValue = typeof TRIGGER_TYPES[number]["value"]

const DEFAULT_FORM: Partial<SurgeRule> = {
  name: "",
  triggerType: "MANUAL",
  multiplier: 1.5,
  applicableWarehouses: [],
  isActive: false,
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function CreateSurgeRuleModal({ isOpen, onClose, onSuccess }: CreateSurgeRuleModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<SurgeRule>>(DEFAULT_FORM)

  const patch = (u: Partial<SurgeRule>) => setForm((p) => ({ ...p, ...u }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name?.trim()) { toast.error("Rule name is required"); return }
    setLoading(true)
    try {
      await commissionService.createSurgeRule(form)
      toast.success("Surge rule created")
      onSuccess()
      handleClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to create surge rule")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => { setForm(DEFAULT_FORM); onClose() }

  const selectedTrigger = TRIGGER_TYPES.find((t) => t.value === form.triggerType)
  const TriggerIcon = selectedTrigger?.icon ?? Zap

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden rounded-xl">

        {/* ── Fixed header ── */}
        <DialogHeader className="shrink-0 px-6 pt-5 pb-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <Zap className="h-4 w-4 text-amber-600" />
            </div>
            <DialogTitle className="text-[15px] font-semibold text-slate-900">
              New surge rule
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Define when the surge activates and how much extra pay partners receive.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-5">

              {/* Rule name */}
              <div>
                <FieldLabel>Rule name</FieldLabel>
                <Input
                  placeholder="e.g. Night bonus, Diwali surge"
                  value={form.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  required
                  className="mt-1.5"
                />
              </div>

              {/* Trigger type */}
              <div>
                <FieldLabel>Trigger type</FieldLabel>
                <Select
                  value={form.triggerType}
                  onValueChange={(v) => patch({ triggerType: v as TriggerValue })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((t) => {
                      const Icon = t.icon
                      return (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-3.5 w-3.5 shrink-0", t.color)} />
                            <span className="font-medium">{t.label}</span>
                            <span className="text-xs text-slate-400 hidden sm:inline">— {t.desc}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {/* Hint card */}
                {selectedTrigger && (
                  <div className={cn(
                    "mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs",
                    selectedTrigger.badge
                  )}>
                    <TriggerIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>{selectedTrigger.desc}</span>
                  </div>
                )}
              </div>

              {/* Multiplier */}
              <div>
                <FieldLabel>Pay multiplier</FieldLabel>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-1.5">
                  1.5× means partner earns 50% extra during this surge.
                </p>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.05"
                    min={1}
                    max={5}
                    value={form.multiplier}
                    onChange={(e) => patch({ multiplier: Number(e.target.value) })}
                    required
                    className="pr-7"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">×</span>
                </div>

                {/* Multiplier preview pill */}
                {form.multiplier && form.multiplier > 1 && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold">
                      {form.multiplier}× pay
                    </Badge>
                    <span className="text-xs text-slate-400">
                      = {Math.round((form.multiplier - 1) * 100)}% extra on every delivery
                    </span>
                  </div>
                )}
              </div>

              {/* ── Conditional: TIME_WINDOW ── */}
              {form.triggerType === "TIME_WINDOW" && (
                <ConditionalSection
                  icon={<Clock className="h-3.5 w-3.5 text-indigo-500" />}
                  title="Active hours"
                  desc="Surge activates automatically every day in this window."
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Start hour (0–23)</FieldLabel>
                      <div className="relative mt-1.5">
                        <Input
                          type="number" min={0} max={23}
                          placeholder="e.g. 21"
                          value={form.startHour ?? ""}
                          onChange={(e) => patch({ startHour: Number(e.target.value) })}
                          className="pr-10"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none">
                          {form.startHour != null ? formatHour(form.startHour) : "—"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <FieldLabel>End hour (0–23)</FieldLabel>
                      <div className="relative mt-1.5">
                        <Input
                          type="number" min={0} max={23}
                          placeholder="e.g. 6"
                          value={form.endHour ?? ""}
                          onChange={(e) => patch({ endHour: Number(e.target.value) })}
                          className="pr-10"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none">
                          {form.endHour != null ? formatHour(form.endHour) : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {form.startHour != null && form.endHour != null && (
                    <p className="text-[11px] text-indigo-500 mt-1.5">
                      Active: {formatHour(form.startHour)} → {formatHour(form.endHour)}
                      {form.startHour > form.endHour && " (overnight)"}
                    </p>
                  )}
                </ConditionalSection>
              )}

              {/* ── Conditional: DATE_RANGE ── */}
              {form.triggerType === "DATE_RANGE" && (
                <ConditionalSection
                  icon={<CalendarRange className="h-3.5 w-3.5 text-violet-500" />}
                  title="Date range"
                  desc="Surge auto-activates during this period."
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Start date</FieldLabel>
                      <Input
                        type="date"
                        className="mt-1.5"
                        value={form.validFrom ? new Date(form.validFrom).toISOString().slice(0, 10) : ""}
                        onChange={(e) => patch({ validFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                      />
                    </div>
                    <div>
                      <FieldLabel>End date</FieldLabel>
                      <Input
                        type="date"
                        className="mt-1.5"
                        value={form.validTo ? new Date(form.validTo).toISOString().slice(0, 10) : ""}
                        onChange={(e) => patch({ validTo: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                      />
                    </div>
                  </div>
                </ConditionalSection>
              )}

              {/* ── Conditional: DEMAND ── */}
              {form.triggerType === "DEMAND" && (
                <ConditionalSection
                  icon={<BarChart2 className="h-3.5 w-3.5 text-amber-500" />}
                  title="Demand threshold"
                  desc="Surge activates when available partners drop below this %."
                >
                  <div>
                    <FieldLabel>Threshold (%)</FieldLabel>
                    <div className="relative mt-1.5">
                      <Input
                        type="number" min={1} max={100}
                        placeholder="e.g. 80"
                        value={form.demandThresholdPercent ?? ""}
                        onChange={(e) => patch({ demandThresholdPercent: Number(e.target.value) })}
                        className="pr-7"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none">%</span>
                    </div>
                    {form.demandThresholdPercent && (
                      <p className="text-[11px] text-amber-600 mt-1.5">
                        Surge fires when &lt;{form.demandThresholdPercent}% partners are available
                      </p>
                    )}
                  </div>
                </ConditionalSection>
              )}

            </div>
          </div>

          {/* ── Fixed footer ── */}
          <div className="shrink-0 px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-end gap-2">
            <Button
              type="button" variant="outline" size="sm"
              onClick={handleClose} disabled={loading}
              className="min-w-[80px]"
            >
              Cancel
            </Button>
            <Button
              type="submit" size="sm" disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[130px]"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating…
                </span>
              ) : "Create surge rule"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatHour(h: number) {
  const ampm = h >= 12 ? "PM" : "AM"
  const hr = h % 12 === 0 ? 12 : h % 12
  return `${hr}:00 ${ampm}`
}

function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Label className={cn("text-xs font-medium text-slate-600", className)}>
      {children}
    </Label>
  )
}

function ConditionalSection({
  icon, title, desc, children,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-4 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <p className="text-xs font-semibold text-slate-700">{title}</p>
          <p className="text-[11px] text-slate-400">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  )
}