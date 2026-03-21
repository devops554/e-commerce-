"use client"
import React, { useEffect, useState } from "react"
import { returnService } from "@/services/return.service"

export function FinanceReportView() {
  const [report, setReport] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    returnService.getFinanceReport()
      .then(setReport)
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <div className="animate-pulse bg-slate-100 h-48 rounded-xl w-full mt-6"></div>
  }

  if (!report.length) {
    return (
      <div className="mt-6 p-6 border border-slate-200 rounded-xl bg-slate-50 text-center text-slate-500">
        No financial data found for completed refunds.
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Refund Finance Report (Admin Only)</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Warehouse</th>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Return Count</th>
              <th className="px-4 py-3 font-semibold">Total Refunded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {report.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{row.warehouseName || "N/A"}</td>
                <td className="px-4 py-3 text-slate-600">{row.productTitle || "N/A"}</td>
                <td className="px-4 py-3 text-slate-500 text-xs uppercase">{row.reason || "N/A"}</td>
                <td className="px-4 py-3 text-slate-900 font-medium">{row.count}</td>
                <td className="px-4 py-3 text-emerald-600 font-bold">₹{row.totalRefundPaid?.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
