"use client"
import React, { useEffect, useState } from "react"
import { returnService } from "@/services/return.service"
import { AdminOverrideControls } from "./AdminOverrideControls"

export function CrossWarehouseList({ isAdmin }: { isAdmin: boolean }) {
  const [returns, setReturns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchReturns = () => {
    setIsLoading(true)
    returnService.getAllAdmin({ limit: 50 })
      .then((res) => setReturns(res.data || []))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchReturns()
  }, [])

  if (isLoading) {
    return <div className="animate-pulse bg-slate-100 h-[400px] rounded-xl w-full"></div>
  }

  if (!returns.length) {
    return (
      <div className="p-12 text-center border border-slate-200 rounded-xl bg-slate-50 text-slate-500">
        No return requests found across warehouses.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {returns.map((r) => (
        <div key={r._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {r.warehouseId?.name || "Unassigned Warehouse"}
              </p>
              <h4 className="text-lg font-bold text-slate-900">{r.productId?.title || "Unknown Product"}</h4>
              <p className="text-sm text-slate-600">Order: {r.orderId?.orderId || "N/A"}</p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
              r.status === "PENDING" ? "bg-amber-100 text-amber-700" :
              r.status === "QC_FAILED" ? "bg-red-100 text-red-700" :
              r.status === "REFUND_COMPLETED" ? "bg-emerald-100 text-emerald-700" :
              "bg-slate-100 text-slate-700"
            }`}>
              {r.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <div>
              <p className="font-semibold text-slate-900">Customer</p>
              <p className="text-slate-600">{r.customerId?.name || "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Reason</p>
              <p className="text-slate-600">{r.reason || "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Quantity</p>
              <p className="text-slate-600">{r.quantity}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Partner</p>
              <p className="text-slate-600">{r.assignedPartnerId?.name || "Unassigned"}</p>
            </div>
          </div>

          <hr className="border-slate-100 my-4" />

          {/* Action Panel and Admin Overrides */}
          <AdminOverrideControls returnData={r} isAdmin={isAdmin} onRefresh={fetchReturns} />
        </div>
      ))}
    </div>
  )
}
