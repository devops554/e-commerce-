"use client"
import React from "react"
import { PaymentConfigPanel } from "@/components/commission/PaymentConfigPanel"
import { useBreadcrumb } from "@/providers/BreadcrumbContext"
import { useEffect } from "react"

export default function PayoutSettingsPage() {
  const { setBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Payout Settings", href: "/admin/commission/settings" },
    ])
  }, [setBreadcrumbs])

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payout Settings</h1>
        <p className="text-sm text-slate-500">Configure payment gateway and payout modes for delivery partners.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <PaymentConfigPanel />
      </div>
    </div>
  )
}
