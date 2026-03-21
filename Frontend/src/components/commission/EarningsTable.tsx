"use client"
import React, { useState } from "react"
import { commissionService, PartnerEarning } from "@/services/commission.service"
import { toast } from "sonner"

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REQUESTED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  DISPUTED: "bg-red-100 text-red-700",
}

function BankAccountInfo({ partner }: { partner: any }) {
  if (!partner?.payoutMethod?.accountNumber) return <span className="text-red-500 font-bold italic">Account not set!</span>
  return (
    <div className="text-left bg-slate-100 p-2 rounded-lg border border-slate-200">
      <p className="text-[10px] font-bold text-slate-500 uppercase">Bank Account</p>
      <p className="text-xs font-mono font-bold text-slate-800">{partner.payoutMethod.accountNumber}</p>
      <p className="text-[10px] text-slate-500 uppercase">{partner.payoutMethod.ifsc}</p>
    </div>
  )
}

function UpiInfo({ partner }: { partner: any }) {
  if (!partner?.payoutMethod?.upiId) return <span className="text-red-500 font-bold italic">UPI not set!</span>
  return (
    <div className="text-left bg-slate-100 p-2 rounded-lg border border-slate-200">
      <p className="text-[10px] font-bold text-slate-500 uppercase">UPI ID</p>
      <p className="text-xs font-mono font-bold text-slate-800">{partner.payoutMethod.upiId}</p>
    </div>
  )
}

interface Props {
  earnings: PartnerEarning[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function EarningsTable({ earnings, total, page, totalPages, onPageChange, onRefresh }: Props) {
  const [mode, setMode] = useState<'RAZORPAY' | 'MANUAL_UPI' | 'BANK' | 'CASH'>("RAZORPAY")
  const [note, setNote] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [payoutModal, setPayoutModal] = useState(false)
  const [txId, setTxId] = useState("")

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAllPending = () => {
    const pendingIds = earnings.filter(e => e.payoutStatus === "PENDING").map(e => e._id)
    setSelected(new Set(pendingIds))
  }

  const selectAllApproved = () => {
    const approvedIds = earnings.filter(e => e.payoutStatus === "APPROVED").map(e => e._id)
    setSelected(new Set(approvedIds))
  }

  const handleApprove = async () => {
    const pendingInSelection = earnings.filter(e => selected.has(e._id) && e.payoutStatus === "PENDING").map(e => e._id)
    if (!pendingInSelection.length) return
    setLoading(true)
    try {
      await commissionService.approveBulk(pendingInSelection)
      toast.success(`${pendingInSelection.length} earnings approved`)
      setSelected(new Set())
      onRefresh()
    } catch { toast.error("Failed to approve") }
    finally { setLoading(false) }
  }

  const handlePayout = async () => {
    if (!selected.size) return
    if (mode !== "RAZORPAY" && !txId.trim()) {
      toast.error("Please enter Transaction ID for manual payments")
      return
    }

    setLoading(true)
    try {
      const first = earnings.find(e => selected.has(e._id))
      const partnerId = typeof first?.partnerId === "object" ? first.partnerId._id : first?.partnerId ?? ""
      const amount = earnings.filter(e => selected.has(e._id)).reduce((s, e) => s + e.totalEarned, 0)

      await commissionService.processPayout({
        partnerId,
        amount,
        mode,
        transactionId: txId,
        earningsIds: [...selected],
        note
      })

      toast.success(`Payout processed via ${mode}!`)
      setSelected(new Set()); setPayoutModal(false); setTxId(""); setNote(""); setMode("RAZORPAY")
      onRefresh()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payout failed")
    }
    finally { setLoading(false) }
  }

  const selectedEarnings = earnings.filter(e => selected.has(e._id))
  const canApprove = selectedEarnings.some(e => e.payoutStatus === "PENDING")
  const canPay = selectedEarnings.length > 0 && selectedEarnings.every(e => e.payoutStatus === "APPROVED")

  return (
    <div className="space-y-4">
      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-200 sticky top-0 z-10 shadow-sm">
          <p className="text-sm font-medium text-indigo-900 flex-1">{selected.size} selected</p>
          {canApprove && (
            <button onClick={handleApprove} disabled={loading}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
              Approve Selected
            </button>
          )}
          {canPay ? (
            <button onClick={() => setPayoutModal(true)}
              className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Process Payout
            </button>
          ) : (
            selectedEarnings.some(e => e.payoutStatus === "PENDING") && (
              <p className="text-[10px] text-slate-500 italic">Approve first to process payout</p>
            )
          )}
          <button onClick={() => setSelected(new Set())} className="text-xs text-slate-500 hover:text-slate-700">Clear</button>
        </div>
      )}

      {/* Payout modal */}
      {payoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setPayoutModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 text-lg mb-1">Process Payout</h3>
            <p className="text-xs text-slate-500 mb-6">Process earnings for {typeof selectedEarnings[0]?.partnerId === 'object' ? selectedEarnings[0].partnerId.name : 'Partner'}</p>

            <div className="bg-slate-50 rounded-xl p-4 mb-4 flex justify-between items-center border border-slate-100">
              <span className="text-sm text-slate-600">Total Amount</span>
              <span className="text-xl font-bold text-slate-900">₹{selectedEarnings.reduce((s, e) => s + e.totalEarned, 0).toFixed(2)}</span>
            </div>

            <div className="mb-6">
              {mode === 'MANUAL_UPI' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target UPI ID</label>
                  <UpiInfo partner={typeof selectedEarnings[0]?.partnerId === 'object' ? selectedEarnings[0].partnerId : null} />
                </div>
              )}
              {mode === 'BANK' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Bank Account</label>
                  <BankAccountInfo partner={typeof selectedEarnings[0]?.partnerId === 'object' ? selectedEarnings[0].partnerId : null} />
                </div>
              )}
              {mode === 'RAZORPAY' && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-[10px] text-amber-700 italic">
                  Payout will be processed automatically via RazorpayX.
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'RAZORPAY', label: 'Razorpay', icon: '⚡' },
                  { key: 'MANUAL_UPI', label: 'UPI', icon: '📱' },
                  { key: 'BANK', label: 'Bank', icon: '🏦' },
                  { key: 'CASH', label: 'Cash', icon: '💵' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMode(m.key as any)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition ${mode === m.key ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'
                      }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-[10px] font-bold">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {mode !== 'RAZORPAY' && (
              <div className="space-y-1 mb-4">
                <label className="text-xs font-semibold text-slate-500">Transaction ID / UTR</label>
                <input
                  value={txId}
                  onChange={e => setTxId(e.target.value)}
                  placeholder="Enter reference number"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            )}

            <div className="space-y-1 mb-6">
              <label className="text-xs font-semibold text-slate-500">Internal Note (Optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a remark..."
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePayout}
                disabled={loading || (mode !== 'RAZORPAY' && !txId)}
                className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition shadow-lg shadow-indigo-200"
              >
                {loading ? "Processing..." : mode === 'RAZORPAY' ? "Pay via Razorpay" : "Confirm Manual Payout"}
              </button>
              <button
                onClick={() => setPayoutModal(false)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-500">{total} earnings</p>
          <div className="flex gap-3">
            <button onClick={selectAllPending} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-tight">Select Pending</button>
            <div className="w-px h-3 bg-slate-200 self-center" />
            <button onClick={selectAllApproved} className="text-[10px] font-bold text-green-600 hover:text-green-800 uppercase tracking-tight">Select Approved</button>
          </div>
        </div>

        {earnings.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No earnings found</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {earnings.map(e => {
              const partnerName = typeof e.partnerId === "object" ? e.partnerId.name : "—"
              const orderId = typeof e.orderId === "object" ? e.orderId.orderId : e.orderId
              const selectable = e.payoutStatus === "PENDING" || e.payoutStatus === "APPROVED";
              return (
                <div key={e._id}>
                  <div className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition cursor-pointer ${selected.has(e._id) ? 'bg-indigo-50/30' : ''}`}
                    onClick={() => setExpanded(expanded === e._id ? null : e._id)}>
                    {selectable && (
                      <input type="checkbox" checked={selected.has(e._id)}
                        onChange={() => toggleSelect(e._id)}
                        onClick={ev => ev.stopPropagation()}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{partnerName}</p>
                      <p className="text-xs text-slate-500">Order #{orderId} · {new Date(e.deliveredAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900">₹{e.totalEarned.toFixed(2)}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_STYLE[e.payoutStatus]}`}>{e.payoutStatus}</span>
                    </div>
                  </div>
                  {/* Expanded breakdown */}
                  {expanded === e._id && (
                    <div className="px-4 pb-4 bg-slate-50 grid grid-cols-3 md:grid-cols-6 gap-3">
                      {[
                        ["Base", e.basePay], ["Distance", e.distancePay], ["Weight", e.weightPay],
                        ["Surge", e.surgePay], ["Zone", e.zonePay], ["COD", e.codBonus],
                        ["1st Del.", e.firstDeliveryBonus], ["Target", e.targetBonus], ["Penalties", -e.penalties],
                      ].map(([label, val]) => (
                        <div key={label as string} className="bg-white rounded-lg p-2 border border-slate-200 text-center">
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className={`font-semibold text-sm ${Number(val) < 0 ? "text-red-600" : "text-slate-900"}`}>
                            ₹{Number(val).toFixed(2)}
                          </p>
                        </div>
                      ))}
                      <div className="col-span-3 md:col-span-6 bg-white rounded-lg p-3 border border-slate-200 mt-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Payout Preference</p>
                            <p className="text-xs font-semibold text-slate-700">
                              Method: {typeof e.partnerId === 'object' ? e.partnerId.payoutMethod?.method || 'Not Set' : '—'}
                            </p>
                          </div>
                          <div className="w-48">
                            {typeof e.partnerId === 'object' && e.partnerId.payoutMethod?.method === 'UPI' ? (
                              <UpiInfo partner={e.partnerId} />
                            ) : (
                              <BankAccountInfo partner={typeof e.partnerId === 'object' ? e.partnerId : null} />
                            )}
                          </div>
                        </div>
                      </div>
                      {e.zoneName && <p className="text-xs text-slate-500 col-span-3 md:col-span-6">Zone: {e.zoneName} · Surge: {e.activeSurgeNames.join(", ") || "None"}</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
              className="text-sm text-slate-600 disabled:opacity-40 hover:text-indigo-600 transition">← Prev</button>
            <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
            <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
              className="text-sm text-slate-600 disabled:opacity-40 hover:text-indigo-600 transition">Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
