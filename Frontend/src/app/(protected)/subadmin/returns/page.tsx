"use client"
import React, { useEffect } from "react"
import { useBreadcrumb } from "@/providers/BreadcrumbContext"
import { ReturnsStatsDashboard } from "@/components/returns/ReturnsStatsDashboard"
import { CrossWarehouseList } from "@/components/returns/CrossWarehouseList"

export default function SubadminReturnsPage() {
  const { setBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    setBreadcrumbs([{ label: "Cross-Warehouse Returns", href: "/subadmin/returns" }])
  }, [setBreadcrumbs])

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Returns Oversight (Sub-admin)</h1>
        <p className="text-sm text-slate-500 font-medium">Cross-warehouse visibility and escalation handling.</p>
      </div>

      <ReturnsStatsDashboard />
      
      <div className="mt-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">All Return Requests</h3>
        {/* Sub-admin has isAdmin=false to hide refund triggers and force close */}
        <CrossWarehouseList isAdmin={false} /> 
      </div>
    </div>
  )
}
