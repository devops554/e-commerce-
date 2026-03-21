import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle2, XCircle, Loader2, ClipboardCheck, CreditCard, Clock } from 'lucide-react'
import { ReturnRequest, ReturnRequestStatus } from '@/services/return.service'
import { toast } from 'sonner'

interface ActionCardsProps {
    request: ReturnRequest;
    role?: string;
    onReview: (status: ReturnRequestStatus, reason?: string, note?: string) => Promise<void>;
    onResolveFailedPickup: (status: ReturnRequestStatus, reason?: string, note?: string) => Promise<void>;
    onQC: (grade: string, notes: string) => Promise<void>;
    onRefund: (method: string, amount: number, transactionId?: string) => Promise<void>;
    isPending: boolean;
}

export function ActionCards({ request, role, onReview, onResolveFailedPickup, onQC, onRefund, isPending }: ActionCardsProps) {
    const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
    const [reason, setReason] = useState('')
    const [adminNote, setAdminNote] = useState('')

    const [qcGrade, setQcGrade] = useState('RESELLABLE')
    const [qcNotes, setQcNotes] = useState('')

    // Auto-fill logic: refund is calculated by the backend during return request creation to exclude shipping.
    const calculatedRefund = request.refundAmount || request.productId?.salePrice || 0;

    const [refundAmount, setRefundAmount] = useState(() => calculatedRefund)
    const [transactionId, setTransactionId] = useState('')

    console.log(request, "request");
    console.log(role, "role");


    const isAdmin = role === 'admin'

    if (request.status === ReturnRequestStatus.PENDING) {
        return (
            <Card className="border-none shadow-xl shadow-blue-100/50 rounded-3xl overflow-hidden bg-white ring-1 ring-blue-50">
                <CardHeader className="p-6 bg-slate-900 text-white">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5" />
                        Review Return Request
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <p className="text-sm text-slate-600 font-medium">
                        Review the return request details and decide whether to approve it for pickup.
                    </p>
                    <div className="space-y-2">
                        <Label>Action</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={reviewStatus === 'APPROVED' ? 'default' : 'outline'}
                                className={`flex-1 rounded-2xl h-12 font-bold ${reviewStatus === 'APPROVED' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                                onClick={() => setReviewStatus('APPROVED')}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button
                                variant={reviewStatus === 'REJECTED' ? 'default' : 'outline'}
                                className={`flex-1 rounded-2xl h-12 font-bold ${reviewStatus === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                                onClick={() => setReviewStatus('REJECTED')}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                        </div>
                    </div>

                    {reviewStatus === 'REJECTED' && (
                        <div className="space-y-2">
                            <Label>Rejection Reason</Label>
                            <Textarea
                                placeholder="Explain why the return is being rejected..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="rounded-2xl border-slate-200"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Internal Note (Optional)</Label>
                        <Textarea
                            placeholder="Add any internal notes for the team..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            className="rounded-2xl border-slate-200"
                        />
                    </div>

                    <Button
                        className="w-full h-12 rounded-2xl font-black bg-slate-900 hover:bg-black text-white shadow-lg"
                        disabled={isPending || (reviewStatus === 'REJECTED' && !reason)}
                        onClick={() => onReview(reviewStatus === 'APPROVED' ? ReturnRequestStatus.APPROVED : ReturnRequestStatus.REJECTED, reason, adminNote)}
                    >
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                        Complete Review
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (request.status === ReturnRequestStatus.FAILED_PICKUP) {
        return (
            <Card className="border-none shadow-xl shadow-red-100/50 rounded-3xl overflow-hidden bg-white ring-1 ring-red-50">
                <CardHeader className="p-6 bg-red-600 text-white">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Resolve Failed Pickup
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <p className="text-sm text-slate-600 font-medium">
                        The delivery partner reported an issue (Wrong Item). Review the evidence and decide how to proceed.
                    </p>
                    <div className="space-y-2">
                        <Label>Action</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={reviewStatus === 'APPROVED' ? 'default' : 'outline'}
                                className={`flex-1 rounded-2xl h-12 font-bold ${reviewStatus === 'APPROVED' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                                onClick={() => setReviewStatus('APPROVED')}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Retry Pickup
                            </Button>
                            <Button
                                variant={reviewStatus === 'REJECTED' ? 'default' : 'outline'}
                                className={`flex-1 rounded-2xl h-12 font-bold ${reviewStatus === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                                onClick={() => setReviewStatus('REJECTED')}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Cancel Return
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{reviewStatus === 'REJECTED' ? 'Cancellation Reason' : 'Notes for Re-pickup'}</Label>
                        <Textarea
                            placeholder={reviewStatus === 'REJECTED' ? "Explain why you're cancelling the return..." : "Internal notes..."}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="rounded-2xl border-slate-200"
                        />
                    </div>

                    <Button
                        className="w-full h-12 rounded-2xl font-black bg-slate-900 hover:bg-black text-white shadow-lg"
                        disabled={isPending || !reason}
                        onClick={() => onResolveFailedPickup(reviewStatus === 'APPROVED' ? ReturnRequestStatus.APPROVED : ReturnRequestStatus.REJECTED, reason, adminNote)}
                    >
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                        Submit Resolution
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (request.status === ReturnRequestStatus.RECEIVED_AT_WAREHOUSE) {
        return (
            <Card className="border-none shadow-xl shadow-amber-100/50 rounded-3xl overflow-hidden bg-white ring-1 ring-amber-50">
                <CardHeader className="p-6 bg-amber-500 text-white">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5" />
                        Warehouse Quality Check
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {/* Inventory Info Banner */}
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                        <div className="p-1.5 rounded-xl bg-blue-100 shrink-0">
                            <ClipboardCheck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-blue-800 uppercase tracking-wider mb-1">Inventory Update</p>
                            <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                Grading as <strong>Resellable</strong> will automatically restock this item into warehouse inventory.
                                Items graded as <strong>Refurbish</strong> or <strong>Dispose</strong> will NOT be restocked.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Item Grade</Label>
                        <Select value={qcGrade} onValueChange={setQcGrade}>
                            <SelectTrigger className="h-12 rounded-2xl border-slate-200">
                                <SelectValue placeholder="Select Grade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RESELLABLE">✅ Resellable — Add back to stock</SelectItem>
                                <SelectItem value="REFURBISH">🔧 Refurbish — Send for repair</SelectItem>
                                <SelectItem value="DISPOSE">❌ Dispose — Defective / Damaged</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>QC Notes</Label>
                        <Textarea
                            placeholder="Details about the item condition..."
                            value={qcNotes}
                            onChange={(e) => setQcNotes(e.target.value)}
                            className="rounded-2xl border-slate-200"
                        />
                    </div>
                    <Button
                        className="w-full h-12 rounded-2xl font-black bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
                        disabled={isPending}
                        onClick={() => onQC(qcGrade, qcNotes)}
                    >
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                        Complete QC &amp; Update Inventory
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (request.status === ReturnRequestStatus.QC_PASSED || (request.status === ReturnRequestStatus.QC_FAILED && isAdmin)) {
        const bankDetails = (request as any).bankDetails
        const refundMethodLabel = request.refundMethod === 'BANK_TRANSFER' ? '🏦 Bank Transfer'
            : request.refundMethod === 'WALLET' ? '💼 Wallet'
                : '💳 Original Source'

        return (
            <Card className={`border-none shadow-xl ${request.status === ReturnRequestStatus.QC_FAILED ? 'shadow-amber-100/50 ring-amber-50' : 'shadow-emerald-100/50 ring-emerald-50'} rounded-3xl overflow-hidden bg-white ring-1`}>
                <CardHeader className={`p-6 ${request.status === ReturnRequestStatus.QC_FAILED ? 'bg-amber-600' : 'bg-emerald-600'} text-white`}>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        {request.status === ReturnRequestStatus.QC_FAILED ? 'Initiate Refund (Override QC Failure)' : 'Initiate Refund'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {isAdmin ? (
                        <>
                            {/* QC Failed Override Warning */}
                            {request.status === ReturnRequestStatus.QC_FAILED && (
                                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                                    <XCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700 font-semibold">
                                        QC Failed — you are overriding this. Ensure this is approved per policy.
                                    </p>
                                </div>
                            )}

                            {/* Customer Bank Details Card */}
                            {request.refundMethod === 'BANK_TRANSFER' && bankDetails && (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 overflow-hidden">
                                    <div className="px-4 py-2.5 bg-emerald-100 flex items-center gap-2">
                                        <CreditCard className="h-3.5 w-3.5 text-emerald-700" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Customer Bank Details</p>
                                    </div>
                                    <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3">
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Account Holder</p>
                                            <p className="text-sm font-bold text-slate-800">{bankDetails.accountHolderName || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Bank Name</p>
                                            <p className="text-sm font-bold text-slate-800">{bankDetails.bankName || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Account Number</p>
                                            <p className="text-sm font-mono font-bold text-slate-800">
                                                {'•'.repeat(Math.max(0, (bankDetails.accountNumber?.length || 4) - 4))}
                                                {bankDetails.accountNumber?.slice(-4) || '••••'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">IFSC Code</p>
                                            <p className="text-sm font-mono font-bold text-slate-800">{bankDetails.ifscCode || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2.5 border-t border-emerald-100 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-xs text-emerald-700 font-semibold">Razorpay Payout will transfer directly to this account (2-3 business days)</p>
                                    </div>
                                </div>
                            )}

                            {/* Refund Method Info Banner */}
                            {(request.refundMethod === 'ORIGINAL_SOURCE' || !request.refundMethod) && (
                                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-indigo-600 shrink-0" />
                                    <p className="text-xs text-indigo-700 font-semibold">
                                        Refund sent instantly to customer&apos;s original payment method via Razorpay.
                                    </p>
                                </div>
                            )}
                            {request.refundMethod === 'WALLET' && (
                                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                                    <p className="text-xs text-purple-700 font-semibold">
                                        Amount will be credited to the customer&apos;s store wallet.
                                    </p>
                                </div>
                            )}

                            {/* Amount + Method Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3 col-span-2 sm:col-span-1">
                                    <Label>Refund Amount (₹)</Label>
                                    <input
                                        type="number"
                                        className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                                    />
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1.5">
                                        <div className="flex justify-between text-slate-700 font-bold">
                                            <span>Eligible Item Refund</span>
                                            <span className="text-emerald-600">₹{calculatedRefund.toFixed(2)}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-1">
                                            Auto-calculated by the server to exclude delivery fees.
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label>Refund Method</Label>
                                    <div className="h-12 flex items-center px-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700">
                                        {refundMethodLabel}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 px-1">
                                        Refund amount auto-excludes delivery charges per standard e-commerce policy (Amazon/Flipkart format).
                                    </p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <Button
                                className={`w-full h-14 rounded-2xl font-black text-base ${request.status === ReturnRequestStatus.QC_FAILED ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white shadow-lg`}
                                disabled={isPending || refundAmount <= 0}
                                onClick={() => onRefund(request.refundMethod || 'ORIGINAL_SOURCE', refundAmount, transactionId)}
                            >
                                {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                                {request.refundMethod === 'BANK_TRANSFER' ? '🏦 Send Bank Payout via Razorpay'
                                    : request.refundMethod === 'WALLET' ? '💼 Credit to Wallet'
                                        : '💳 Process Razorpay Refund'}
                            </Button>
                        </>
                    ) : (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <p className="text-sm font-bold text-slate-500 italic">
                                Awaiting Admin Refund Trigger
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    if (request.status === ReturnRequestStatus.QC_FAILED) {
        return (
            <Card className="border-none shadow-xl shadow-rose-100/50 rounded-3xl overflow-hidden bg-white ring-1 ring-rose-50">
                <CardHeader className="p-6 bg-rose-600 text-white">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        QC Failed
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-2">
                        <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Reason for Failure</p>
                        <p className="text-sm font-medium text-rose-600">
                            {request.warehouseQcNotes || 'No specific notes provided.'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (request.status === ReturnRequestStatus.REFUND_INITIATED || request.status === ReturnRequestStatus.REFUND_COMPLETED) {
        return (
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100">
                <CardHeader className={`p-6 ${request.status === ReturnRequestStatus.REFUND_COMPLETED ? 'bg-slate-900' : 'bg-indigo-600'} text-white`}>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        {request.status === ReturnRequestStatus.REFUND_COMPLETED ? 'Return Completed' : 'Refund In Progress'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Refund Amount</span>
                        <span className="text-lg font-black text-slate-900">₹{request.refundAmount || 0}</span>
                    </div>
                    {request.refundMethod && (
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-sm font-bold text-slate-500">Method</span>
                            <span className="text-sm font-bold text-slate-700">
                                {request.refundMethod === 'BANK_TRANSFER' ? '🏦 Bank Transfer'
                                    : request.refundMethod === 'WALLET' ? '💼 Wallet'
                                        : '💳 Original Source'}
                            </span>
                        </div>
                    )}
                    {request.refundTransactionId && (
                        <div className="space-y-1 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction / Payout ID</p>
                            <p className="text-sm font-mono font-bold text-slate-700 break-all">{request.refundTransactionId}</p>
                        </div>
                    )}
                    {request.status === ReturnRequestStatus.REFUND_INITIATED && request.refundMethod === 'BANK_TRANSFER' && (
                        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                            <p className="text-xs text-blue-700 font-semibold">Bank transfer may take 2-3 business days to reflect.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    if (request.status === ReturnRequestStatus.PICKED_UP) {
        return (
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden ring-1 ring-indigo-100">
                <CardHeader className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Awaiting Warehouse Handover
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <p className="text-sm font-medium text-slate-600">
                        The delivery partner has picked up the item and is heading to the warehouse.
                    </p>
                    <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white shadow-sm shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                        </div>
                        <p className="text-xs text-indigo-700 font-semibold leading-relaxed">
                            Upon arrival, the delivery partner will request a verification OTP.
                            You will receive this OTP via notification to confirm the drop-off.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return null
}
