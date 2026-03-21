"use client"
import React, { useEffect, useState, useCallback } from "react"
import { useBreadcrumb } from "@/providers/BreadcrumbContext"
import { commissionService, PartnerEarning, EarningsSummary } from "@/services/commission.service"
import { EarningsTable } from "@/components/commission/EarningsTable"
import { EarningsSummaryTable } from "@/components/commission/EarningsSummaryTable"
import { toast } from "sonner"
import { IndianRupee, PieChart, Users } from "lucide-react"

const TABS = [
  { key: "earnings", label: "💰 Recent Earnings", desc: "Approve & pay partner earnings" },
  { key: "summary", label: "📊 Partner Summary", desc: "Per-partner payout overview" },
]

export default function PartnerEarningsPage() {
  const { setBreadcrumbs } = useBreadcrumb()
  const [activeTab, setActiveTab] = useState("earnings")

  // Data
  const [earnings, setEarnings] = useState<PartnerEarning[]>([])
  const [summaries, setSummaries] = useState<EarningsSummary[]>([])
  const [earningsPage, setEarningsPage] = useState(1)
  const [earningsTotal, setEarningsTotal] = useState(0)
  const [earningsTotalPages, setEarningsTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Commission Management", href: "/admin/commission" },
      { label: "Partner Earnings", href: "/admin/commission/earnings" }
    ])
  }, [setBreadcrumbs])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === "earnings") {
        const earn = await commissionService.getEarnings({ page: earningsPage, limit: 20 })
        setEarnings(earn.data)
        setEarningsTotal(earn.total)
        setEarningsTotalPages(earn.totalPages)
      } else {
        const summ = await commissionService.getEarningsSummary()
        setSummaries(summ)
      }
    } catch {
      toast.error("Error loading earnings data")
    } finally {
      setLoading(false)
    }
  }, [activeTab, earningsPage])

  useEffect(() => { loadData() }, [loadData])

  const pendingCount = earnings.filter(e => e.payoutStatus === "PENDING").length

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Partner Earnings</h1>
        <p className="text-sm text-slate-500">Track, approve and process payouts for delivery partners.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Partners"
          value={summaries.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending Payouts"
          value={pendingCount}
          sub="on current page"
          icon={IndianRupee}
          color="yellow"
        />
        <StatCard
          title="Total Earned"
          value={`₹${summaries.reduce((acc, s) => acc + s.totalEarned, 0).toLocaleString()}`}
          icon={PieChart}
          color="indigo"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-t-lg text-sm font-medium transition ${activeTab === tab.key
                ? "text-indigo-700 bg-indigo-50 border-b-2 border-indigo-600"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading...</div>
      ) : (
        <>
          {activeTab === "earnings" && (
            <EarningsTable
              earnings={earnings}
              total={earningsTotal}
              page={earningsPage}
              totalPages={earningsTotalPages}
              onPageChange={setEarningsPage}
              onRefresh={loadData}
            />
          )}
          {activeTab === "summary" && <EarningsSummaryTable summaries={summaries} />}
        </>
      )}
    </div>
  )
}

function StatCard({ title, value, sub, color, icon: Icon }: { title: string; value: string | number; sub?: string; color: string; icon: any }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200  text-blue-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    slate: "bg-slate-50 border-slate-200 text-slate-700",
  }
  return (
    <div className={`rounded-xl border p-4 flex items-start justify-between ${colors[color] ?? colors.slate}`}>
      <div>
        <p className="text-xs font-medium opacity-70">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
      </div>
      <div className="p-2 bg-white/50 rounded-lg">
        <Icon className="w-5 h-5 opacity-80" />
      </div>
    </div>
  )
}
