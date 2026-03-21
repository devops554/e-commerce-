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
import { commissionService, PartnerOffer } from "@/services/commission.service"
import { toast } from "sonner"
import {
  Plus, Trash2, Trophy, IndianRupee,
  Clock, CalendarDays, Calendar, Infinity, Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateOfferModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// ─── Period type config ───────────────────────────────────────────────────────
const PERIOD_TYPES = [
  { value: "DAILY", label: "Daily", desc: "Resets every day", icon: Clock, badge: "bg-amber-50  border-amber-200  text-amber-700" },
  { value: "WEEKLY", label: "Weekly", desc: "Resets every Monday", icon: CalendarDays, badge: "bg-violet-50 border-violet-200 text-violet-700" },
  { value: "MONTHLY", label: "Monthly", desc: "Resets on 1st of month", icon: Calendar, badge: "bg-blue-50   border-blue-200   text-blue-700" },
  { value: "CUSTOM", label: "Custom", desc: "Fixed date range", icon: Infinity, badge: "bg-slate-50  border-slate-200  text-slate-600" },
] as const

type PeriodValue = typeof PERIOD_TYPES[number]["value"]

// ─── Default form values ──────────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0]
const nextWeek = new Date(Date.now() + 7 * 86_400_000).toISOString().split("T")[0]

const DEFAULT_FORM: Partial<PartnerOffer> = {
  title: "",
  description: "",
  offerType: "DELIVERY_COUNT",
  periodType: "WEEKLY",
  tiers: [{ targetCount: 50, bonusAmount: 500, label: "Bronze" }],
  validFrom: today,
  validTo: nextWeek,
  isActive: true,
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function CreateOfferModal({ isOpen, onClose, onSuccess }: CreateOfferModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<PartnerOffer>>(DEFAULT_FORM)

  const patch = (u: Partial<PartnerOffer>) => setForm((p) => ({ ...p, ...u }))

  // ── Tier helpers ──
  const addTier = () => {
    const last = form.tiers?.at(-1)
    patch({
      tiers: [
        ...(form.tiers ?? []),
        {
          targetCount: (last?.targetCount ?? 50) + 25,
          bonusAmount: (last?.bonusAmount ?? 500) + 250,
          label: TIER_LABELS[form.tiers?.length ?? 0] ?? `Tier ${(form.tiers?.length ?? 0) + 1}`,
        },
      ],
    })
  }

  const removeTier = (i: number) =>
    patch({ tiers: form.tiers?.filter((_, idx) => idx !== i) })

  const setTier = (i: number, field: string, value: number | string) => {
    const t = [...(form.tiers ?? [])];
    (t[i] as any)[field] = value
    patch({ tiers: t })
  }

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title?.trim()) { toast.error("Offer title is required"); return }
    if (!form.tiers?.length) { toast.error("Add at least one reward tier"); return }
    setLoading(true)
    try {
      await commissionService.createOffer(form)
      toast.success("Offer created successfully")
      onSuccess()
      handleClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to create offer")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => { setForm(DEFAULT_FORM); onClose() }

  const selectedPeriod = PERIOD_TYPES.find((p) => p.value === form.periodType)
  const PeriodIcon = selectedPeriod?.icon ?? CalendarDays

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl w-full p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden rounded-xl">

        {/* ── Fixed header ── */}
        <DialogHeader className="shrink-0 px-6 pt-5 pb-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-100 rounded-lg">
              <Trophy className="h-4 w-4 text-violet-600" />
            </div>
            <DialogTitle className="text-[15px] font-semibold text-slate-900">
              New partner offer
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Create a delivery target offer with tier-based rewards. Partners see their live progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-5">

              {/* ── Title + description ── */}
              <div className="space-y-3">
                <div>
                  <FieldLabel>Offer title</FieldLabel>
                  <Input
                    placeholder="e.g. Diwali Hustler, Weekly Champion"
                    value={form.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <FieldLabel>Description <span className="text-slate-300 font-normal">(optional)</span></FieldLabel>
                  <Input
                    placeholder="Short tagline shown to partners"
                    value={form.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* ── Period type ── */}
              <div>
                <FieldLabel>Period type</FieldLabel>
                <Select
                  value={form.periodType}
                  onValueChange={(v) => patch({ periodType: v as PeriodValue })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_TYPES.map((p) => {
                      const Icon = p.icon
                      return (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium">{p.label}</span>
                            <span className="text-xs text-slate-400 hidden sm:inline">— {p.desc}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {/* Hint */}
                {selectedPeriod && (
                  <div className={cn("mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs", selectedPeriod.badge)}>
                    <PeriodIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>{selectedPeriod.desc}</span>
                  </div>
                )}
              </div>

              {/* ── Date range ── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Valid from</FieldLabel>
                  <Input
                    type="date"
                    value={typeof form.validFrom === "string"
                      ? form.validFrom
                      : form.validFrom
                        ? new Date(form.validFrom as any).toISOString().split("T")[0]
                        : ""}
                    onChange={(e) => patch({ validFrom: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <FieldLabel>Valid to</FieldLabel>
                  <Input
                    type="date"
                    value={typeof form.validTo === "string"
                      ? form.validTo
                      : form.validTo
                        ? new Date(form.validTo as any).toISOString().split("T")[0]
                        : ""}
                    onChange={(e) => patch({ validTo: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* ── Reward tiers ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reward tiers</p>
                  </div>
                  <Button
                    type="button" variant="outline" size="sm"
                    className="h-8 gap-1.5 text-xs border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300 font-medium"
                    onClick={addTier}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add tier
                  </Button>
                </div>

                {form.tiers?.length === 0 && (
                  <div className="flex items-center justify-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/60">
                    <p className="text-xs text-slate-400">No tiers yet — click Add tier above.</p>
                  </div>
                )}

                <div className="space-y-2">
                  {form.tiers?.map((tier, i) => (
                    <TierRow
                      key={i}
                      tier={tier}
                      index={i}
                      onChange={(field, val) => setTier(i, field, val)}
                      onRemove={() => removeTier(i)}
                    />
                  ))}
                </div>

                {(form.tiers?.length ?? 0) > 0 && (
                  <p className="text-[11px] text-slate-400">
                    Partners unlock higher tiers after hitting the target count within the period.
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* ── Fixed footer ── */}
          <div className="shrink-0 px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm"
              onClick={handleClose} disabled={loading} className="min-w-[80px]">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[130px]">
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating…
                </span>
              ) : "Create offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Tier row ─────────────────────────────────────────────────────────────────
function TierRow({
  tier, index, onChange, onRemove,
}: {
  tier: { targetCount: number; bonusAmount: number; label?: string }
  index: number
  onChange: (field: string, val: number | string) => void
  onRemove: () => void
}) {
  const label = tier.label ?? TIER_LABELS[index] ?? `Tier ${index + 1}`
  const tierColor = TIER_COLORS[index] ?? "bg-slate-50 border-slate-200"

  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2.5", tierColor)}>
      {/* Tier label badge */}
      <Badge
        variant="outline"
        className="text-[10px] px-1.5 shrink-0 font-semibold border-0 bg-white/70"
      >
        {label}
      </Badge>

      {/* Target count */}
      <Input
        type="number" min={1}
        value={tier.targetCount}
        onChange={(e) => onChange("targetCount", Number(e.target.value))}
        className="h-8 w-[72px] text-xs text-center px-1.5"
      />
      <span className="text-xs text-slate-500 shrink-0">deliveries</span>

      <span className="text-slate-200 text-sm mx-0.5">→</span>

      {/* Bonus amount */}
      <div className="relative flex-1">
        <IndianRupee className="absolute left-2 top-1.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <Input
          type="number" min={0}
          value={tier.bonusAmount}
          onChange={(e) => onChange("bonusAmount", Number(e.target.value))}
          className="h-8 pl-6 text-xs font-semibold"
        />
      </div>

      {/* Remove */}
      <Button
        type="button" variant="ghost" size="icon"
        className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 shrink-0"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TIER_LABELS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]
const TIER_COLORS = [
  "bg-amber-50/60  border-amber-200",
  "bg-slate-50     border-slate-200",
  "bg-yellow-50/70 border-yellow-200",
  "bg-sky-50/60    border-sky-200",
  "bg-violet-50/60 border-violet-200",
]

function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Label className={cn("text-xs font-medium text-slate-600", className)}>
      {children}
    </Label>
  )
}