"use client"
import React, { useState } from "react"
import { commissionService, DeliveryZone } from "@/services/commission.service"
import { toast } from "sonner"
import { CreateZoneModal } from "./CreateZoneModal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Plus, ChevronDown, ChevronUp,
  MapPin, Hash, X, Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Zone type display config ─────────────────────────────────────────────────
const ZONE_META: Record<string, { label: string; badge: string; dot: string }> = {
  METRO_CORE: { label: "Metro core", badge: "bg-blue-50   border-blue-200   text-blue-700", dot: "bg-blue-500" },
  METRO_OUTER: { label: "Metro outer", badge: "bg-indigo-50  border-indigo-200  text-indigo-700", dot: "bg-indigo-500" },
  SUBURBAN: { label: "Suburban", badge: "bg-violet-50  border-violet-200  text-violet-700", dot: "bg-violet-500" },
  RURAL: { label: "Rural", badge: "bg-amber-50   border-amber-200   text-amber-700", dot: "bg-amber-500" },
}

const PINS_PREVIEW = 24   // how many pincode tags to show before "+N more"

// ─── Main panel ───────────────────────────────────────────────────────────────
export function ZonesPanel({
  zones,
  onRefresh,
}: {
  zones: DeliveryZone[]
  onRefresh: () => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id))

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-500 text-xs">
          {zones.length} zone{zones.length !== 1 ? "s" : ""} configured
        </Badge>
        <Button
          size="sm"
          className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          New zone
        </Button>
      </div>

      <CreateZoneModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={onRefresh}
      />

      {/* ── Zone list ── */}
      {zones.length === 0 ? (
        <EmptyState onCreateClick={() => setShowCreate(true)} />
      ) : (
        <div className="space-y-2">
          {zones.map((zone) => {
            const meta = ZONE_META[zone.zoneType] ?? { label: zone.zoneType, badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" }
            const isOpen = expandedId === zone._id

            return (
              <Card
                key={zone._id}
                className={cn(
                  "overflow-hidden border transition-all duration-200",
                  isOpen ? "border-indigo-200 shadow-sm" : "border-slate-200 shadow-none"
                )}
              >
                {/* ── Row header ── */}
                <CardHeader
                  className="px-4 py-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  onClick={() => toggle(zone._id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", meta.dot)} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {zone.name}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1.5 shrink-0 font-medium", meta.badge)}
                          >
                            {meta.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500 font-medium">
                            {zone.multiplier}×
                          </span>
                          <span className="text-slate-300 text-xs">·</span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Hash className="h-2.5 w-2.5" />
                            {zone.pincodes.length} pincode{zone.pincodes.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chevron */}
                    {isOpen
                      ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    }
                  </div>
                </CardHeader>

                {/* ── Expanded section ── */}
                {isOpen && (
                  <CardContent className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/50">
                    <PincodeManager
                      zone={zone}
                      onRefresh={onRefresh}
                      meta={meta}
                    />
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Pincode manager (inside expanded card) ───────────────────────────────────
function PincodeManager({
  zone,
  onRefresh,
  meta,
}: {
  zone: DeliveryZone
  onRefresh: () => void
  meta: { badge: string; dot: string; label: string }
}) {
  const [pinInput, setPinInput] = useState("")
  const [adding, setAdding] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const visiblePins = showAll ? zone.pincodes : zone.pincodes.slice(0, PINS_PREVIEW)
  const hiddenCount = zone.pincodes.length - PINS_PREVIEW

  // ── Add pincodes ──
  const commitAdd = async () => {
    const pins = pinInput
      .split(/[\s,]+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 4 && !zone.pincodes.includes(p))

    if (!pins.length) { toast.error("No new valid pincodes to add"); return }
    setAdding(true)
    try {
      await commissionService.addPincodes(zone._id, pins)
      toast.success(`${pins.length} pincode${pins.length > 1 ? "s" : ""} added`)
      setPinInput("")
      onRefresh()
    } catch {
      toast.error("Failed to add pincodes")
    } finally {
      setAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); commitAdd() }
  }

  return (
    <div className="space-y-3 mt-3">

      {/* Pincode tags */}
      {zone.pincodes.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {visiblePins.map((pin) => (
            <span
              key={pin}
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border bg-white text-slate-600 border-slate-200"
            >
              {pin}
            </span>
          ))}

          {!showAll && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium px-2 py-0.5 rounded-md border border-indigo-100 bg-indigo-50 transition-colors"
            >
              +{hiddenCount} more
            </button>
          )}
          {showAll && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-0.5 rounded-md border border-slate-200 bg-white transition-colors"
            >
              Show less
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">No pincodes mapped yet.</p>
      )}

      {/* Add pincode input */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Hash className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-300 pointer-events-none" />
          <input
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add pincodes, comma-separated…"
            className={cn(
              "w-full pl-8 pr-3 py-2 text-xs rounded-lg border bg-white text-slate-700 placeholder:text-slate-300",
              "border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
            )}
          />
        </div>
        <Button
          size="sm"
          onClick={commitAdd}
          disabled={adding || !pinInput.trim()}
          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
        >
          {adding ? (
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Adding…
            </span>
          ) : (
            <>
              <Plus className="h-3 w-3 mr-1" />
              Add
            </>
          )}
        </Button>
      </div>
      <p className="text-[11px] text-slate-400">
        Press Enter or click Add. Duplicates and short strings are ignored.
      </p>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <Globe className="h-8 w-8 text-slate-300 mb-3" />
      <p className="text-sm font-medium text-slate-600">No delivery zones yet</p>
      <p className="text-xs text-slate-400 mt-1 mb-4">
        Create zones to apply region-based pay multipliers.
      </p>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={onCreateClick}>
        <Plus className="h-3.5 w-3.5" />
        Create first zone
      </Button>
    </div>
  )
}