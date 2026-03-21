"use client"
import React, { useState } from "react"
import { returnService, RefundMethod } from "@/services/return.service"

export function AdminOverrideControls({ returnData: r, isAdmin, onRefresh }: { returnData: any, isAdmin: boolean, onRefresh: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false)
  
  const handleApprove = async () => {
    if (!confirm("Approve this return?")) return
    setIsProcessing(true)
    try {
      await returnService.adminApprove(r._id, { adminNote: "Approved by Admin/Sub-admin" })
      onRefresh()
    } catch (e: any) { alert(e.response?.data?.message || "Error") }
    finally { setIsProcessing(false) }
  }

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason:")
    if (!reason) return
    setIsProcessing(true)
    try {
      await returnService.adminReject(r._id, { rejectionReason: reason })
      onRefresh()
    } catch (e: any) { alert(e.response?.data?.message || "Error") }
    finally { setIsProcessing(false) }
  }

  const handleForceClose = async () => {
    const reason = prompt("FORCE CLOSE: Enter reason for forcefully closing this return:")
    if (!reason) return
    setIsProcessing(true)
    try {
      await returnService.forceClose(r._id, { reason })
      onRefresh()
    } catch (e: any) { alert(e.response?.data?.message || "Error") }
    finally { setIsProcessing(false) }
  }

  const handleRefund = async () => {
    const amountStr = prompt(`Refund Amount (Max: ${r.productId?.salePrice * r.quantity}):`, (r.productId?.salePrice * r.quantity).toString())
    if (!amountStr) return
    setIsProcessing(true)
    try {
      await returnService.adminRefund(r._id, {
        refundMethod: RefundMethod.WALLET, // Assuming wallet mapping for demo UI
        refundAmount: Number(amountStr)
      })
      onRefresh()
    } catch (e: any) { alert(e.response?.data?.message || "Error") }
    finally { setIsProcessing(false) }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sub-admin and Admin common actions */}
      {r.status === "PENDING" && (
        <>
          <button onClick={handleApprove} disabled={isProcessing} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Approve
          </button>
          <button onClick={handleReject} disabled={isProcessing} className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-sm font-semibold rounded-lg transition-colors">
            Reject
          </button>
        </>
      )}

      {/* Admin Exclusive Overrides */}
      {isAdmin && (
        <div className="flex flex-wrap gap-2 ml-auto border-l pl-4 border-slate-200">
          {(r.status === "QC_PASSED" || r.status === "QC_FAILED" || r.status === "RECEIVED_AT_WAREHOUSE") && (
            <button onClick={handleRefund} disabled={isProcessing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
              Trigger Refund
            </button>
          )}
          {r.status !== "CLOSED" && (
            <button onClick={handleForceClose} disabled={isProcessing} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
              Force Close
            </button>
          )}
        </div>
      )}
    </div>
  )
}
