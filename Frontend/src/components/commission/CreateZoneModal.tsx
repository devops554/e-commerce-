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
import { commissionService, DeliveryZone } from "@/services/commission.service"
import { toast } from "sonner"
import { MapPin, X, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateZoneModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// ─── Zone type config ─────────────────────────────────────────────────────────
const ZONE_TYPES = [
  { value: "METRO_CORE", label: "Metro core", desc: "City centre", multiplier: 1.0, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "METRO_OUTER", label: "Metro outer", desc: "City outskirts", multiplier: 1.1, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "SUBURBAN", label: "Suburban", desc: "Nearby towns", multiplier: 1.2, color: "bg-violet-100 text-violet-700 border-violet-200" },
  { value: "RURAL", label: "Rural", desc: "Remote areas", multiplier: 1.4, color: "bg-amber-100 text-amber-700 border-amber-200" },
] as const

type ZoneTypeValue = typeof ZONE_TYPES[number]["value"]

const DEFAULT_FORM: Partial<DeliveryZone> = {
  name: "",
  zoneType: "METRO_CORE",
  multiplier: 1.0,
  pincodes: [],
  isActive: true,
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export function CreateZoneModal({ isOpen, onClose, onSuccess }: CreateZoneModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<DeliveryZone>>(DEFAULT_FORM)
  const [pinInput, setPinInput] = useState("")
  const [pincodes, setPincodes] = useState<string[]>([])

  const patch = (u: Partial<DeliveryZone>) => setForm((p) => ({ ...p, ...u }))

  // ── Pincode tag management ──
  const addPincodes = () => {
    const incoming = pinInput
      .split(/[\s,]+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 4 && !pincodes.includes(p))
    if (!incoming.length) { setPinInput(""); return }
    setPincodes((prev) => [...prev, ...incoming])
    setPinInput("")
  }

  const removePin = (pin: string) =>
    setPincodes((prev) => prev.filter((p) => p !== pin))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault()
      addPincodes()
    }
    if (e.key === "Backspace" && !pinInput && pincodes.length) {
      setPincodes((prev) => prev.slice(0, -1))
    }
  }

  // ── Zone type change: auto-set default multiplier ──
  const handleZoneTypeChange = (val: ZoneTypeValue) => {
    const meta = ZONE_TYPES.find((z) => z.value === val)
    patch({ zoneType: val, multiplier: meta?.multiplier ?? 1.0 })
  }

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name?.trim()) { toast.error("Zone name is required"); return }
    if (!pincodes.length) { toast.error("Add at least one pincode"); return }
    setLoading(true)
    try {
      await commissionService.createZone({ ...form, pincodes })
      toast.success("Zone created successfully")
      onSuccess()
      handleClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to create zone")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm(DEFAULT_FORM)
    setPincodes([])
    setPinInput("")
    onClose()
  }

  const selectedZone = ZONE_TYPES.find((z) => z.value === form.zoneType)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden rounded-xl">

        {/* ── Fixed header ── */}
        <DialogHeader className="shrink-0 px-6 pt-5 pb-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <MapPin className="h-4 w-4 text-indigo-600" />
            </div>
            <DialogTitle className="text-[15px] font-semibold text-slate-900">
              New delivery zone
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Map pincodes to a zone type. Partners delivering there get the zone multiplier.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-5">

              {/* Zone name */}
              <div>
                <FieldLabel>Zone name</FieldLabel>
                <Input
                  placeholder="e.g. Patna Core Zone"
                  value={form.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  required
                  className="mt-1.5"
                />
              </div>

              {/* Zone type */}
              <div>
                <FieldLabel>Zone type</FieldLabel>
                <Select
                  value={form.zoneType}
                  onValueChange={(v) => handleZoneTypeChange(v as ZoneTypeValue)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select zone type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ZONE_TYPES.map((z) => (
                      <SelectItem key={z.value} value={z.value}>
                        <div className="flex items-center gap-2">
                          <span>{z.label}</span>
                          <span className="text-xs text-slate-400">— {z.desc}</span>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1.5 ml-1", z.color)}
                          >
                            {z.multiplier}×
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Zone type hint card */}
                {selectedZone && (
                  <div className={cn(
                    "mt-2 px-3 py-2 rounded-lg border text-xs flex items-center justify-between",
                    selectedZone.color
                  )}>
                    <span>{selectedZone.label} — {selectedZone.desc}</span>
                    <span className="font-semibold">{selectedZone.multiplier}× pay</span>
                  </div>
                )}
              </div>

              {/* Multiplier override */}
              <div>
                <FieldLabel>Multiplier</FieldLabel>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-1.5">
                  Auto-filled from zone type. Override if needed.
                </p>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.05"
                    min={1}
                    max={5}
                    value={form.multiplier}
                    onChange={(e) => patch({ multiplier: Number(e.target.value) })}
                    className="pr-7"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-medium text-slate-400 pointer-events-none">×</span>
                </div>
              </div>

              {/* Pincodes */}
              <div>
                <FieldLabel>Pincodes</FieldLabel>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-1.5">
                  Type a pincode and press Enter, Space or comma to add it.
                </p>

                {/* Tag input box */}
                <div className={cn(
                  "flex flex-wrap gap-1.5 min-h-[80px] p-2.5 rounded-lg border border-slate-200 bg-white",
                  "focus-within:ring-2 focus-within:ring-indigo-400 focus-within:ring-offset-1 transition-shadow"
                )}>
                  {pincodes.map((pin) => (
                    <span
                      key={pin}
                      className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-md"
                    >
                      <Hash className="h-2.5 w-2.5 opacity-60" />
                      {pin}
                      <button
                        type="button"
                        onClick={() => removePin(pin)}
                        className="ml-0.5 text-indigo-400 hover:text-indigo-700 transition-colors"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addPincodes}
                    placeholder={pincodes.length ? "Add more…" : "400001, 400002…"}
                    className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                  />
                </div>

                {/* Count */}
                {pincodes.length > 0 && (
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {pincodes.length} pincode{pincodes.length > 1 ? "s" : ""} added
                    <button
                      type="button"
                      onClick={() => setPincodes([])}
                      className="ml-2 text-red-400 hover:text-red-600 underline transition-colors"
                    >
                      Clear all
                    </button>
                  </p>
                )}
              </div>

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
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating…
                </span>
              ) : "Create zone"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-medium text-slate-600">{children}</Label>
  )
}