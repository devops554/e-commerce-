"use client"
import React, { useEffect, useState, useCallback } from "react"
import { useBreadcrumb } from "@/providers/BreadcrumbContext"
import {
  commissionService,
  RateConfig,
  SurgeRule,
  DeliveryZone,
  PartnerOffer,
} from "@/services/commission.service"
import { RateConfigPanel } from "@/components/commission/RateConfigPanel"
import { SurgeRulesPanel } from "@/components/commission/SurgeRulesPanel"
import { ZonesPanel } from "@/components/commission/ZonesPanel"
import { OffersPanel } from "@/components/commission/OffersPanel"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import {
  SlidersHorizontal,
  Zap,
  MapPin,
  Trophy,
  TrendingUp,
  AlertCircle,
} from "lucide-react"

// ─── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
  {
    key: "rates",
    label: "Rate Config",
    icon: SlidersHorizontal,
    desc: "Base pay, distance & weight slabs, size multipliers",
  },
  {
    key: "surges",
    label: "Surges",
    icon: Zap,
    desc: "Rain, peak, night and festival surge controls",
  },
  {
    key: "zones",
    label: "Zones",
    icon: MapPin,
    desc: "Pincode-to-zone mapping and region multipliers",
  },
  {
    key: "offers",
    label: "Offers",
    icon: Trophy,
    desc: "Target incentives and tier bonuses for partners",
  },
]

// ─── Stat card config ─────────────────────────────────────────────────────────
type StatVariant = "blue" | "amber" | "violet" | "emerald" | "rose"

interface StatDef {
  title: string
  variant: StatVariant
  icon: React.ElementType
  getValue: (data: PageData) => number
  getSub: (data: PageData) => string
  getAlert?: (data: PageData) => boolean
}

interface PageData {
  rateConfigs: RateConfig[]
  surgeRules: SurgeRule[]
  zones: DeliveryZone[]
  offers: PartnerOffer[]
}

const STATS: StatDef[] = [
  {
    title: "Rate Configs",
    variant: "blue",
    icon: SlidersHorizontal,
    getValue: ({ rateConfigs }) => rateConfigs.filter((r) => r.isActive).length,
    getSub: ({ rateConfigs }) => `of ${rateConfigs.length} total`,
  },
  {
    title: "Active Surges",
    variant: "amber",
    icon: Zap,
    getValue: ({ surgeRules }) => surgeRules.filter((s) => s.isActive).length,
    getSub: ({ surgeRules }) => `of ${surgeRules.length} rules`,
    getAlert: ({ surgeRules }) => surgeRules.some((s) => s.isActive),
  },
  {
    title: "Active Offers",
    variant: "violet",
    icon: Trophy,
    getValue: ({ offers }) => offers.filter((o) => o.isActive).length,
    getSub: () => "partner incentives",
  },
  {
    title: "Delivery Zones",
    variant: "emerald",
    icon: MapPin,
    getValue: ({ zones }) => zones.length,
    getSub: () => "mapped regions",
  },
]

// ─── Variant tokens ───────────────────────────────────────────────────────────
const VARIANT_STYLES: Record<
  StatVariant,
  { card: string; icon: string; badge: string; value: string }
> = {
  blue: {
    card: "border-blue-200 bg-blue-50/60",
    icon: "bg-blue-100 text-blue-600",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    value: "text-blue-900",
  },
  amber: {
    card: "border-amber-200 bg-amber-50/60",
    icon: "bg-amber-100 text-amber-600",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    value: "text-amber-900",
  },
  violet: {
    card: "border-violet-200 bg-violet-50/60",
    icon: "bg-violet-100 text-violet-600",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    value: "text-violet-900",
  },
  emerald: {
    card: "border-emerald-200 bg-emerald-50/60",
    icon: "bg-emerald-100 text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    value: "text-emerald-900",
  },
  rose: {
    card: "border-rose-200 bg-rose-50/60",
    icon: "bg-rose-100 text-rose-600",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    value: "text-rose-900",
  },
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminCommissionPage() {
  const { setBreadcrumbs } = useBreadcrumb()
  const [activeTab, setActiveTab] = useState("rates")
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState<PageData>({
    rateConfigs: [],
    surgeRules: [],
    zones: [],
    offers: [],
  })

  useEffect(() => {
    setBreadcrumbs([
      { label: "Commission Management", href: "/admin/commission" },
    ])
  }, [setBreadcrumbs])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [rc, surgs, zns, offs] = await Promise.allSettled([
        commissionService.getRateConfigs(),
        commissionService.getSurgeRules(),
        commissionService.getZones(),
        commissionService.getOffers(),
      ])
      setData({
        rateConfigs: rc.status === "fulfilled" ? rc.value : [],
        surgeRules: surgs.status === "fulfilled" ? surgs.value : [],
        zones: zns.status === "fulfilled" ? zns.value : [],
        offers: offs.status === "fulfilled" ? offs.value : [],
      })
    } catch {
      toast.error("Error loading commission data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const activeSurgeCount = data.surgeRules.filter((s) => s.isActive).length

  return (
    <div className="space-y-6 pb-20">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Commission Management
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Configure rate slabs, surge controls, delivery zones and partner
            incentive offers.
          </p>
        </div>

        {/* Live surge alert badge */}
        {activeSurgeCount > 0 && (
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 border-amber-300 bg-amber-50 text-amber-700 px-3 py-1.5 text-xs font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            {activeSurgeCount} surge{activeSurgeCount > 1 ? "s" : ""} active
          </Badge>
        )}
      </div>

      <Separator />

      {/* ── Stat cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((stat) => {
            const s = VARIANT_STYLES[stat.variant]
            const value = stat.getValue(data)
            const sub = stat.getSub(data)
            const alert = stat.getAlert?.(data) ?? false
            const Icon = stat.icon

            return (
              <Card
                key={stat.title}
                className={`border ${s.card} shadow-none transition-all duration-200 hover:shadow-sm`}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-1.5 rounded-lg ${s.icon}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-end justify-between">
                    <p className={`text-3xl font-bold tracking-tight ${s.value}`}>
                      {value}
                    </p>
                    {alert && (
                      <AlertCircle className="h-4 w-4 text-amber-500 mb-1" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{sub}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto p-1 bg-slate-100 rounded-xl gap-1 w-full sm:w-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 transition-all"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Tab description */}
        {!loading && (
          <p className="mt-3 text-xs text-slate-400">
            {TABS.find((t) => t.key === activeTab)?.desc}
          </p>
        )}

        {/* Tab content */}
        {loading ? (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-3/4 rounded-xl" />
          </div>
        ) : (
          <>
            <TabsContent value="rates" className="mt-4">
              <RateConfigPanel
                configs={data.rateConfigs}
                onRefresh={loadAll}
              />
            </TabsContent>

            <TabsContent value="surges" className="mt-4">
              <SurgeRulesPanel
                surges={data.surgeRules}
                onRefresh={loadAll}
              />
            </TabsContent>

            <TabsContent value="zones" className="mt-4">
              <ZonesPanel zones={data.zones} onRefresh={loadAll} />
            </TabsContent>

            <TabsContent value="offers" className="mt-4">
              <OffersPanel offers={data.offers} onRefresh={loadAll} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}