import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle2, XCircle, Loader2, ClipboardCheck, CreditCard } from 'lucide-react'
import { ReturnRequest, ReturnRequestStatus } from '@/services/return.service'
import { toast } from 'sonner'

interface ActionCardsProps {
    request: ReturnRequest;
    onReview: (status: ReturnRequestStatus, reason?: string, note?: string) => Promise<void>;
    onQC: (grade: string, notes: string) => Promise<void>;
    onRefund: (method: string, amount: number, transactionId?: string) => Promise<void>;
    isPending: boolean;
}

export function ActionCards({ request, onReview, onQC, onRefund, isPending }: ActionCardsProps) {
    const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
    const [reason, setReason] = useState('')
    const [adminNote, setAdminNote] = useState('')

    const [qcGrade, setQcGrade] = useState('A')
    const [qcNotes, setQcNotes] = useState('')

    const [refundAmount, setRefundAmount] = useState(request.refundAmount || request.productId?.salePrice || 0)
    const [transactionId, setTransactionId] = useState('')

    if (request.status === ReturnRequestStatus.PENDING) {
        return (
            <Card className="border-none shadow-xl shadow-blue-100/50 rounded-3xl overflow-hidden bg-white ring-1 ring-blue-50">
                <CardHeader className="p-6 bg-blue-600 text-white">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5" />
                        Manager Review
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Action</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={reviewStatus === 'APPROVED' ? 'default' : 'outline'}
                                className={`flex-1 rounded-2xl h-12 font-bold ${reviewStatus === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : ''}`}
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
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                            <Label>Rejection Reason</Label>
                            <Textarea
                                placeholder="Explain why the return is rejected..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="rounded-2xl border-slate-200 focus:ring-red-500"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Internal Note (Optional)</Label>
                        <Textarea
                            placeholder="Add notes for other managers..."
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
                        Submit Review
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
                        Warehouse QC
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Item Grade</Label>
                        <Select value={qcGrade} onValueChange={setQcGrade}>
                            <SelectTrigger className="h-12 rounded-2xl border-slate-200">
                                <SelectValue placeholder="Select Grade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="A">Grade A (Resellable - Like New)</SelectItem>
                                <SelectItem value="B">Grade B (Minor Wear - Refurbished)</SelectItem>
                                <SelectItem value="C">Grade C (Damaged - Spare Parts)</SelectItem>
                                <SelectItem value="F">Grade F (Total Loss - Scrapped)</SelectItem>
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
                        Complete QC
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (request.status === ReturnRequestStatus.QC_PASSED) {
        return (
            <Card className="border-none shadow-xl shadow-emerald-100/50 rounded-3xl overflow-hidden bg-white ring-1 ring-emerald-50">
                <CardHeader className="p-6 bg-emerald-600 text-white">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Initiate Refund
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Refund Amount (Max: {request.productId?.salePrice})</Label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                            <input
                                type="number"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(Number(e.target.value))}
                                className="w-full h-12 pl-8 pr-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Transaction ID (Optional)</Label>
                        <input
                            type="text"
                            placeholder="External reference number"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-sm"
                        />
                    </div>
                    <Button
                        className="w-full h-12 rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                        disabled={isPending || refundAmount <= 0}
                        onClick={() => onRefund(request.refundMethod || 'ORIGINAL_PAYMENT', refundAmount, transactionId)}
                    >
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                        Process Refund
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return null
}
