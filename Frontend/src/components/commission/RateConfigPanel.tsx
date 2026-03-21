"use client"
import React, { useState } from "react"
import { commissionService, RateConfig } from "@/services/commission.service"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { CreateRateConfigModal } from "./CreateRateConfigModal"
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Warehouse,
  Globe,
  IndianRupee,
  Ruler,
  Weight,
  Package,
  CircleDot,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────
interface RateConfigPanelProps {
  configs: RateConfig[]
  onRefresh: () => void
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export function RateConfigPanel({ configs, onRefresh }: RateConfigPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await commissionService.deleteRateConfig(id)
      toast.success("Rate config deactivated")
      onRefresh()
    } catch {
      toast.error("Could not delete — pending earnings may be linked")
    } finally {
      setDeleting(null)
    }
  }

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id))

  const activeCount = configs.filter((c) => c.isActive).length
  const inactiveCount = configs.length - activeCount

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 text-xs">
              {activeCount} active
            </Badge>
          )}
          {inactiveCount > 0 && (
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-500 text-xs">
              {inactiveCount} inactive
            </Badge>
          )}
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          size="sm"
          className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          New Rate Config
        </Button>
      </div>

      <CreateRateConfigModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={onRefresh}
      />

      {/* ── Config list ── */}
      {configs.length === 0 ? (
        <EmptyState onCreateClick={() => setShowCreate(true)} />
      ) : (
        <div className="space-y-2">
          {configs.map((cfg) => {
            const isOpen = expandedId === cfg._id
            const warehouseName =
              typeof cfg.warehouseId === "object"
                ? cfg.warehouseId?.name
                : cfg.warehouseId
                  ? "Warehouse Specific"
                  : null

            return (
              <Card
                key={cfg._id}
                className={cn(
                  "overflow-hidden border transition-all duration-200",
                  isOpen ? "border-indigo-200 shadow-sm" : "border-slate-200 shadow-none"
                )}
              >
                {/* ── Row header ── */}
                <CardHeader
                  className="px-4 py-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  onClick={() => toggle(cfg._id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: status dot + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <CircleDot
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          cfg.isActive ? "text-emerald-500" : "text-slate-300"
                        )}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">
                          {cfg.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {warehouseName ? (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Warehouse className="h-3 w-3" />
                              {warehouseName}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Globe className="h-3 w-3" />
                              Global default
                            </span>
                          )}
                          <span className="text-slate-300 text-xs">·</span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <IndianRupee className="h-3 w-3" />
                            {cfg.basePay} base / {cfg.baseKm}km
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: actions + chevron */}
                    <div className="flex items-center gap-1 shrink-0">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            onClick={(e) => e.stopPropagation()}
                            disabled={deleting === cfg._id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate rate config?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will soft-delete <strong>{cfg.name}</strong>. It cannot be
                              deleted if pending earnings are linked to it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(cfg._id)}
                            >
                              {deleting === cfg._id ? "Deleting…" : "Deactivate"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* ── Expanded detail ── */}
                {isOpen && (
                  <CardContent className="px-4 pb-4 pt-0 bg-slate-50/60 border-t border-slate-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <MiniStatCard label="COD bonus" value={`₹${cfg.codBonus}`} positive />
                      <MiniStatCard label="1st delivery" value={`₹${cfg.firstDeliveryDayBonus}`} positive />
                      <MiniStatCard label="Cancel penalty" value={`₹${cfg.cancelAfterAcceptPenalty}`} negative />
                      <MiniStatCard label="Late penalty" value={`₹${cfg.lateDeliveryPenalty}`} negative />
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Distance slabs */}
                      <SlabTable
                        title="Distance slabs"
                        icon={<Ruler className="h-3.5 w-3.5" />}
                        rows={cfg.distanceSlabs.map((s) => ({
                          range: `${s.fromKm}–${s.toKm ?? "∞"} km`,
                          rate: `₹${s.ratePerKm}/km`,
                        }))}
                      />

                      {/* Weight slabs */}
                      <SlabTable
                        title="Weight slabs"
                        icon={<Weight className="h-3.5 w-3.5" />}
                        rows={cfg.weightSlabs.map((s) => ({
                          range: `${s.fromKg}–${s.toKg ?? "∞"} kg`,
                          rate: `₹${s.flatPay} flat`,
                        }))}
                      />
                    </div>

                    {/* Size multipliers */}
                    <div className="mt-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
                        <Package className="h-3.5 w-3.5" />
                        Size multipliers
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(cfg.sizeMultipliers).map(([k, v]) => (
                          <Badge
                            key={k}
                            variant="outline"
                            className="capitalize border-slate-200 bg-white text-slate-700 text-xs"
                          >
                            {k}: {v}×
                          </Badge>
                        ))}
                      </div>
                    </div>
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <IndianRupee className="h-8 w-8 text-slate-300 mb-3" />
      <p className="text-sm font-medium text-slate-600">No rate configs yet</p>
      <p className="text-xs text-slate-400 mt-1 mb-4">
        Create one to start calculating delivery commissions.
      </p>
      <Button
        onClick={onCreateClick}
        size="sm"
        variant="outline"
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Create first config
      </Button>
    </div>
  )
}

function MiniStatCard({
  label,
  value,
  positive,
  negative,
}: {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        positive && "border-emerald-100 bg-emerald-50/60",
        negative && "border-red-100 bg-red-50/50",
        !positive && !negative && "border-slate-200 bg-white"
      )}
    >
      <p className="text-[11px] text-slate-500">{label}</p>
      <p
        className={cn(
          "font-semibold text-sm mt-0.5",
          positive && "text-emerald-700",
          negative && "text-red-600",
          !positive && !negative && "text-slate-900"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function SlabTable({
  title,
  icon,
  rows,
}: {
  title: string
  icon: React.ReactNode
  rows: { range: string; rate: string }[]
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
        {icon}
        {title}
      </p>
      <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
        {rows.map((row, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-between px-3 py-1.5 text-xs",
              i !== rows.length - 1 && "border-b border-slate-100"
            )}
          >
            <span className="text-slate-600">{row.range}</span>
            <span className="font-medium text-slate-900">{row.rate}</span>
          </div>
        ))}
      </div>
    </div>
  )
}