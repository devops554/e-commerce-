"use client"
import React, { useEffect, useState } from "react"
import { returnService } from "@/services/return.service"

export function ReturnsStatsDashboard() {
  const [stats, setStats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    returnService.getAdminStats()
      .then(setStats)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <div className="animate-pulse bg-slate-100 h-24 rounded-xl w-full"></div>
  }

  const parseStatus = (status: string) => status.replace(/_/g, " ")

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s._id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{parseStatus(s._id)}</p>
          <p className="text-2xl font-black text-slate-900 mt-2">{s.count}</p>
          {s.totalAmount > 0 && (
            <p className="text-xs font-medium text-emerald-600 mt-1">₹{s.totalAmount?.toLocaleString("en-IN")}</p>
          )}
        </div>
      ))}
    </div>
  )
}
