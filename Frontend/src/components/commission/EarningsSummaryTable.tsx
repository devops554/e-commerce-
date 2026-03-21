"use client"
import React from "react"
import { EarningsSummary } from "@/services/commission.service"

function BankAccountInfo({ partner }: { partner: any }) {
  if (!partner?.payoutMethod?.accountNumber) return <span className="text-red-400 text-[10px] italic">Not Set</span>
  return (
    <div className="text-left bg-slate-50 p-1.5 rounded border border-slate-100">
      <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Bank Account</p>
      <p className="text-[10px] font-mono font-bold text-slate-700">{partner.payoutMethod.accountNumber}</p>
      <p className="text-[9px] text-slate-400 uppercase leading-none">{partner.payoutMethod.ifsc}</p>
    </div>
  )
}

function UpiInfo({ partner }: { partner: any }) {
  if (!partner?.payoutMethod?.upiId) return <span className="text-red-400 text-[10px] italic">Not Set</span>
  return (
    <div className="text-left bg-slate-50 p-1.5 rounded border border-slate-100">
      <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">UPI ID</p>
      <p className="text-[10px] font-mono font-bold text-slate-700">{partner.payoutMethod.upiId}</p>
    </div>
  )
}

export function EarningsSummaryTable({ summaries }: { summaries: EarningsSummary[] }) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-900">Partner Earnings Summary</p>
      </div>
      {summaries.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No data available</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {summaries.map(s => (
            <div key={s._id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">{s.partnerName}</p>
                <p className="text-xs text-slate-500 mb-2">{s.partnerPhone}</p>
                <div className="flex gap-2">
                  <div className="w-40">
                    {s.payoutMethod?.method === 'BANK' ? <BankAccountInfo partner={s} /> : <UpiInfo partner={s} />}
                  </div>
                  <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                    <span className="text-[9px] font-black text-indigo-400 uppercase">Deliveries</span>
                    <span className="text-xs font-bold text-indigo-700">{s.totalDeliveries}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="flex flex-col gap-1 text-center min-w-[60px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
                  <p className="text-xs font-bold text-yellow-600">₹{s.totalPending.toFixed(0)}</p>
                </div>
                <div className="flex flex-col gap-1 text-center min-w-[60px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Req/Appr</p>
                  <p className="text-xs font-bold text-blue-600">₹{(s.totalRequested + s.totalApproved).toFixed(0)}</p>
                </div>
                <div className="flex flex-col gap-1 text-center min-w-[60px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Paid</p>
                  <p className="text-xs font-bold text-green-600">₹{s.totalPaid.toFixed(0)}</p>
                </div>
                <div className="w-px h-8 bg-slate-100 mx-1" />
                <div className="flex flex-col gap-1 text-right min-w-[80px]">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Total Earned</p>
                  <p className="text-sm font-black text-slate-900">₹{s.totalEarned.toFixed(0)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
