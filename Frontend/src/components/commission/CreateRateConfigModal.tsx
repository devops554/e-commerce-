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
import { commissionService, RateConfig } from "@/services/commission.service"
import { toast } from "sonner"
import {
  Plus, Trash2, Ruler, Weight,
  Package, IndianRupee, Star,
  AlertTriangle, Gift,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateRateConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const DEFAULT_FORM: Partial<RateConfig> = {
  name: "",
  basePay: 30,
  baseKm: 3,
  distanceSlabs: [
    { fromKm: 3, toKm: 10, ratePerKm: 8 },
    { fromKm: 10, toKm: 20, ratePerKm: 6 },
    { fromKm: 20, toKm: null, ratePerKm: 5 },
  ],
  weightSlabs: [
    { fromKg: 0, toKg: 1, flatPay: 0 },
    { fromKg: 1, toKg: 5, flatPay: 10 },
    { fromKg: 5, toKg: 10, flatPay: 25 },
    { fromKg: 10, toKg: null, flatPay: 50 },
  ],
  sizeMultipliers: { small: 1.0, medium: 1.1, large: 1.3, xl: 1.6 },
  codBonus: 10,
  firstDeliveryDayBonus: 15,
  fiveStarRatingBonus: 20,
  cancelAfterAcceptPenalty: 20,
  lateDeliveryPenalty: 10,
  unjustifiedFailurePenalty: 15,
}

export function CreateRateConfigModal({ isOpen, onClose, onSuccess }: CreateRateConfigModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<RateConfig>>(DEFAULT_FORM)
  const patch = (u: Partial<RateConfig>) => setForm((p) => ({ ...p, ...u }))

  const addDistanceSlab = () => {
    const last = form.distanceSlabs?.at(-1)
    patch({ distanceSlabs: [...(form.distanceSlabs ?? []), { fromKm: last?.toKm ?? 0, toKm: null, ratePerKm: 5 }] })
  }
  const removeDistanceSlab = (i: number) =>
    patch({ distanceSlabs: form.distanceSlabs?.filter((_, idx) => idx !== i) })
  const setDistanceSlab = (i: number, f: string, v: number | null) => {
    const s = [...(form.distanceSlabs ?? [])]; (s[i] as any)[f] = v; patch({ distanceSlabs: s })
  }

  const addWeightSlab = () => {
    const last = form.weightSlabs?.at(-1)
    patch({ weightSlabs: [...(form.weightSlabs ?? []), { fromKg: last?.toKg ?? 0, toKg: null, flatPay: 10 }] })
  }
  const removeWeightSlab = (i: number) =>
    patch({ weightSlabs: form.weightSlabs?.filter((_, idx) => idx !== i) })
  const setWeightSlab = (i: number, f: string, v: number | null) => {
    const s = [...(form.weightSlabs ?? [])]; (s[i] as any)[f] = v; patch({ weightSlabs: s })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name?.trim()) { toast.error("Config name is required"); return }
    setLoading(true)
    try {
      await commissionService.createRateConfig(form)
      toast.success("Rate config created")
      onSuccess(); handleClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to create rate config")
    } finally { setLoading(false) }
  }

  const handleClose = () => { setForm(DEFAULT_FORM); onClose() }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/*
        LAYOUT FIX:
        - DialogContent: flex flex-col + max-h-[90vh] + overflow-hidden
        - Header:  shrink-0  → never shrinks
        - Body:    flex-1 overflow-y-auto  → fills space, scrolls
        - Footer:  shrink-0  → always pinned at bottom
      */}
      <DialogContent className="max-w-2xl w-full p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden rounded-xl">

        {/* ─── FIXED HEADER ─────────────────────────────────────── */}
        <DialogHeader className="shrink-0 px-6 pt-5 pb-4 border-b border-slate-100 bg-white">
          <DialogTitle className="text-[15px] font-semibold text-slate-900">
            New Rate Config
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-0.5">
            Define base pay, distance &amp; weight slabs, size multipliers and bonuses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

          {/* ─── SCROLLABLE BODY ───────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-7">

              {/* ── Basic info ── */}
              <Section title="Basic info">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <FieldLabel>Config name</FieldLabel>
                    <Input
                      placeholder="e.g. Patna Default"
                      value={form.name}
                      onChange={(e) => patch({ name: e.target.value })}
                      required className="mt-1.5"
                    />
                  </div>
                  <div>
                    <FieldLabel>Base pay (₹)</FieldLabel>
                    <div className="relative mt-1.5">
                      <IndianRupee className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <Input type="number" min={0} value={form.basePay}
                        onChange={(e) => patch({ basePay: Number(e.target.value) })} className="pl-7" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Base distance (km)</FieldLabel>
                    <div className="relative mt-1.5">
                      <Ruler className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <Input type="number" min={0} value={form.baseKm}
                        onChange={(e) => patch({ baseKm: Number(e.target.value) })} className="pl-7" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Partner gets ₹{form.basePay} flat for first {form.baseKm}km. Slabs apply after.
                </p>
              </Section>

              {/* ── Distance slabs ── */}
              <Section
                title="Distance slabs"
                icon={<Ruler className="h-3.5 w-3.5" />}
                action={
                  <AddSlabBtn onClick={addDistanceSlab} />
                }
              >
                <div className="space-y-2">
                  {form.distanceSlabs?.map((s, i) => (
                    <SlabRow key={i}
                      unitFrom="km" unitTo="km" unitRate="₹/km"
                      fromVal={s.fromKm} toVal={s.toKm} rateVal={s.ratePerKm}
                      onFrom={(v) => setDistanceSlab(i, "fromKm", v)}
                      onTo={(v) => setDistanceSlab(i, "toKm", v)}
                      onRate={(v) => setDistanceSlab(i, "ratePerKm", v)}
                      onRemove={() => removeDistanceSlab(i)}
                      isLast={i === (form.distanceSlabs?.length ?? 0) - 1}
                    />
                  ))}
                  {!form.distanceSlabs?.length && <EmptyHint text="No slabs yet — click Add slab above." />}
                </div>
              </Section>

              {/* ── Weight slabs ── */}
              <Section
                title="Weight slabs"
                icon={<Weight className="h-3.5 w-3.5" />}
                action={<AddSlabBtn onClick={addWeightSlab} />}
              >
                <div className="space-y-2">
                  {form.weightSlabs?.map((s, i) => (
                    <SlabRow key={i}
                      unitFrom="kg" unitTo="kg" unitRate="flat ₹"
                      fromVal={s.fromKg} toVal={s.toKg} rateVal={s.flatPay}
                      onFrom={(v) => setWeightSlab(i, "fromKg", v)}
                      onTo={(v) => setWeightSlab(i, "toKg", v)}
                      onRate={(v) => setWeightSlab(i, "flatPay", v)}
                      onRemove={() => removeWeightSlab(i)}
                      isLast={i === (form.weightSlabs?.length ?? 0) - 1}
                    />
                  ))}
                  {!form.weightSlabs?.length && <EmptyHint text="No slabs yet — click Add slab above." />}
                </div>
              </Section>

              {/* ── Size multipliers ── */}
              <Section title="Size multipliers" icon={<Package className="h-3.5 w-3.5" />}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(["small", "medium", "large", "xl"] as const).map((size) => (
                    <div key={size}>
                      <FieldLabel className="capitalize">{size}</FieldLabel>
                      <div className="relative mt-1.5">
                        <Input type="number" step="0.05" min={1} max={5}
                          value={(form.sizeMultipliers as any)?.[size]}
                          onChange={(e) => patch({ sizeMultipliers: { ...form.sizeMultipliers!, [size]: Number(e.target.value) } })}
                          className="pr-7" />
                        <span className="absolute right-2.5 top-2.5 text-xs font-medium text-slate-400 pointer-events-none">×</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Applied on (base + distance + weight). Large = 1.3× means 30% extra.
                </p>
              </Section>

              {/* ── Bonuses ── */}
              <Section title="Bonuses" icon={<Gift className="h-3.5 w-3.5" />}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <BonusInput label="COD collected" value={form.codBonus} onChange={(v) => patch({ codBonus: v })} positive />
                  <BonusInput label="First delivery / day" value={form.firstDeliveryDayBonus} onChange={(v) => patch({ firstDeliveryDayBonus: v })} positive />
                  <BonusInput label="5-star rating" value={form.fiveStarRatingBonus} onChange={(v) => patch({ fiveStarRatingBonus: v })} positive icon={<Star className="h-3 w-3" />} />
                </div>
              </Section>

              {/* ── Penalties ── */}
              <Section title="Penalties" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <BonusInput label="Cancel after accept" value={form.cancelAfterAcceptPenalty} onChange={(v) => patch({ cancelAfterAcceptPenalty: v })} negative />
                  <BonusInput label="Late delivery" value={form.lateDeliveryPenalty} onChange={(v) => patch({ lateDeliveryPenalty: v })} negative />
                  <BonusInput label="Unjustified failure" value={form.unjustifiedFailurePenalty} onChange={(v) => patch({ unjustifiedFailurePenalty: v })} negative />
                </div>
              </Section>

              {/* bottom breath */}
              <div className="h-1" />
            </div>
          </div>

          {/* ─── FIXED FOOTER — always visible at bottom ──────────── */}
          <div className="shrink-0 px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400 hidden sm:block">All values can be edited after creation.</p>
            <div className="flex items-center gap-2 ml-auto">
              <Button type="button" variant="outline" size="sm"
                onClick={handleClose} disabled={loading} className="min-w-[80px]">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[130px]">
                {loading ? "Creating…" : "Create config"}
              </Button>
            </div>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function AddSlabBtn({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button" variant="outline" size="sm"
      className="h-8 gap-1.5 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 font-medium"
      onClick={onClick}
    >
      <Plus className="h-3.5 w-3.5" />
      Add slab
    </Button>
  )
}

function Section({ title, icon, action, children }: {
  title: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between min-h-[32px]">
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-slate-400">{icon}</span>}
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Label className={cn("text-xs font-medium text-slate-600", className)}>{children}</Label>
}

function SlabRow({ unitFrom, unitTo, unitRate, fromVal, toVal, rateVal, onFrom, onTo, onRate, onRemove, isLast }: {
  unitFrom: string; unitTo: string; unitRate: string
  fromVal: number; toVal: number | null; rateVal: number
  onFrom: (v: number) => void; onTo: (v: number | null) => void; onRate: (v: number) => void
  onRemove: () => void; isLast: boolean
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2.5">
      <Input type="number" min={0} value={fromVal}
        onChange={(e) => onFrom(Number(e.target.value))}
        className="h-8 w-[60px] text-sm text-center px-1.5" />
      <span className="text-xs text-slate-400 shrink-0">{unitFrom} →</span>

      <Input type="number" min={0} placeholder="∞" value={toVal ?? ""}
        onChange={(e) => onTo(e.target.value === "" ? null : Number(e.target.value))}
        className="h-8 w-[60px] text-sm text-center px-1.5" />
      <span className="text-xs text-slate-400 shrink-0">{unitTo}</span>

      <span className="text-slate-200 mx-0.5">|</span>
      <span className="text-xs text-slate-500 shrink-0 font-medium">{unitRate}</span>

      <Input type="number" min={0} value={rateVal}
        onChange={(e) => onRate(Number(e.target.value))}
        className="h-8 w-[72px] text-sm text-center px-1.5" />

      {isLast && (
        <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400 shrink-0 font-normal">
          unlimited
        </Badge>
      )}

      <Button type="button" variant="ghost" size="icon"
        className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 ml-auto shrink-0"
        onClick={onRemove}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function BonusInput({ label, value, onChange, positive, negative, icon }: {
  label: string; value?: number; onChange: (v: number) => void
  positive?: boolean; negative?: boolean; icon?: React.ReactNode
}) {
  return (
    <div className={cn(
      "rounded-lg border px-3 py-3",
      positive && "border-emerald-100 bg-emerald-50/50",
      negative && "border-red-100 bg-red-50/40",
      !positive && !negative && "border-slate-200 bg-white"
    )}>
      <div className="flex items-center gap-1 mb-2">
        {icon && <span className={cn(positive && "text-emerald-500", negative && "text-red-400")}>{icon}</span>}
        <p className={cn(
          "text-[11px] font-medium leading-tight",
          positive && "text-emerald-600",
          negative && "text-red-500",
          !positive && !negative && "text-slate-500"
        )}>{label}</p>
      </div>
      <div className="relative">
        <IndianRupee className={cn(
          "absolute left-2 top-2 h-3.5 w-3.5 pointer-events-none",
          positive && "text-emerald-400",
          negative && "text-red-400",
          !positive && !negative && "text-slate-400"
        )} />
        <Input type="number" min={0} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "h-8 pl-6 text-sm font-semibold",
            positive && "border-emerald-200 text-emerald-800 focus-visible:ring-emerald-300",
            negative && "border-red-200 text-red-700 focus-visible:ring-red-300",
            !positive && !negative && "border-slate-200 text-slate-900"
          )} />
      </div>
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/60">
      <p className="text-xs text-slate-400">{text}</p>
    </div>
  )
}