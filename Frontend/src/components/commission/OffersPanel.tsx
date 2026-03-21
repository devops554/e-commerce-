"use client"
import React, { useState } from "react"
import { commissionService, PartnerOffer } from "@/services/commission.service"
import { toast } from "sonner"
import { CreateOfferModal } from "./CreateOfferModal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Plus, Trophy, CalendarDays,
  Layers, Clock, Calendar, Infinity,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Period config ────────────────────────────────────────────────────────────
const PERIOD_META: Record<string, {
  label: string
  badge: string
  icon: React.ElementType
}> = {
  DAILY: { label: "Daily", badge: "bg-amber-50  border-amber-200  text-amber-700", icon: Clock },
  WEEKLY: { label: "Weekly", badge: "bg-violet-50 border-violet-200 text-violet-700", icon: CalendarDays },
  MONTHLY: { label: "Monthly", badge: "bg-blue-50   border-blue-200   text-blue-700", icon: Calendar },
  CUSTOM: { label: "Custom", badge: "bg-slate-50  border-slate-200  text-slate-600", icon: Infinity },
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export function OffersPanel({
  offers,
  onRefresh,
}: {
  offers: PartnerOffer[]
  onRefresh: () => void
}) {
  const [toggling, setToggling] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const now = new Date()

  const activeCount = offers.filter(
    (o) => o.isActive && new Date(o.validTo) >= now
  ).length

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id)
    try {
      await commissionService.toggleOffer(id, !current)
      toast.success(`Offer ${!current ? "activated" : "deactivated"}`)
      onRefresh()
    } catch {
      toast.error("Failed to toggle offer")
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 text-xs gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
              </span>
              {activeCount} live
            </Badge>
          )}
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-400 text-xs">
            {offers.length} total
          </Badge>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          New offer
        </Button>
      </div>

      <CreateOfferModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={onRefresh}
      />

      {/* ── Offer list ── */}
      {offers.length === 0 ? (
        <EmptyState onCreateClick={() => setShowCreate(true)} />
      ) : (
        <div className="space-y-2">
          {offers.map((offer) => {
            const expired = new Date(offer.validTo) < now
            const upcoming = new Date(offer.validFrom) > now
            const period = PERIOD_META[offer.periodType] ?? PERIOD_META.CUSTOM
            const PIcon = period.icon
            const isOn = offer.isActive && !expired
            const busy = toggling === offer._id

            return (
              <Card
                key={offer._id}
                className={cn(
                  "border transition-all duration-200",
                  expired && "opacity-55 border-slate-200",
                  !expired && isOn && "border-violet-200 bg-violet-50/30",
                  !expired && !isOn && "border-slate-200 bg-white hover:border-indigo-100"
                )}
              >
                <CardContent className="px-4 py-4">
                  <div className="flex items-start justify-between gap-4">

                    {/* ── Left: offer info ── */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Icon blob */}
                      <div className={cn(
                        "p-2 rounded-lg shrink-0 mt-0.5",
                        isOn && !expired ? "bg-violet-100" : "bg-slate-100"
                      )}>
                        <Trophy className={cn(
                          "h-3.5 w-3.5",
                          isOn && !expired ? "text-violet-600" : "text-slate-400"
                        )} />
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Title row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {offer.title}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1.5 font-medium shrink-0 flex items-center gap-1", period.badge)}
                          >
                            <PIcon className="h-2.5 w-2.5" />
                            {period.label}
                          </Badge>
                          {expired && <Badge variant="outline" className="text-[10px] px-1.5 border-red-200 bg-red-50 text-red-500">Expired</Badge>}
                          {upcoming && <Badge variant="outline" className="text-[10px] px-1.5 border-blue-200 bg-blue-50 text-blue-500">Upcoming</Badge>}
                        </div>

                        {/* Description */}
                        {offer.description && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{offer.description}</p>
                        )}

                        {/* Tiers */}
                        {offer.tiers?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {offer.tiers.map((tier, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border",
                                  isOn && !expired
                                    ? "bg-violet-50 border-violet-200 text-violet-700"
                                    : "bg-slate-50 border-slate-200 text-slate-600"
                                )}
                              >
                                <Layers className="h-2.5 w-2.5 opacity-60" />
                                {tier.label ?? `Tier ${i + 1}`}
                                <span className="opacity-50 mx-0.5">·</span>
                                {tier.targetCount} deliveries
                                <span className="opacity-50 mx-0.5">→</span>
                                <span className="font-semibold">₹{tier.bonusAmount}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Date range */}
                        <div className="flex items-center gap-1 mt-2">
                          <CalendarDays className="h-3 w-3 text-slate-300" />
                          <p className="text-[11px] text-slate-400">
                            {new Date(offer.validFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            {" – "}
                            {new Date(offer.validTo).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── Right: toggle ── */}
                    <button
                      type="button"
                      disabled={busy || expired}
                      onClick={() => handleToggle(offer._id, offer.isActive)}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 mt-0.5",
                        "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400",
                        isOn ? "bg-violet-500" : "bg-slate-200",
                        (busy || expired) && "opacity-40 cursor-not-allowed"
                      )}
                      aria-label={isOn ? "Deactivate offer" : "Activate offer"}
                    >
                      <span className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                        isOn ? "translate-x-5" : "translate-x-0"
                      )} />
                    </button>

                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <Trophy className="h-8 w-8 text-slate-300 mb-3" />
      <p className="text-sm font-medium text-slate-600">No offers yet</p>
      <p className="text-xs text-slate-400 mt-1 mb-4">
        Create incentive offers to motivate delivery partners.
      </p>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={onCreateClick}>
        <Plus className="h-3.5 w-3.5" />
        Create first offer
      </Button>
    </div>
  )
}