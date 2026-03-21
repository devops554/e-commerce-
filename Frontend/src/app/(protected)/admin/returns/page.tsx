"use client"
import React, { useEffect } from "react"
import { useBreadcrumb } from "@/providers/BreadcrumbContext"
import { ReturnsStatsDashboard } from "@/components/returns/ReturnsStatsDashboard"
import { CrossWarehouseList } from "@/components/returns/CrossWarehouseList"
import { FinanceReportView } from "@/components/returns/FinanceReportView"

export default function AdminReturnsPage() {
  const { setBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    setBreadcrumbs([{ label: "Cross-Warehouse Returns", href: "/admin/returns" }])
  }, [setBreadcrumbs])

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Returns Oversight (Admin)</h1>
        <p className="text-sm text-slate-500 font-medium">Cross-warehouse visibility and full financial controls.</p>
      </div>

      <ReturnsStatsDashboard />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-4">All Return Requests</h3>
          <CrossWarehouseList isAdmin={true} />
        </div>
        <div>
          <FinanceReportView />
        </div>
      </div>
    </div>
  )
}
