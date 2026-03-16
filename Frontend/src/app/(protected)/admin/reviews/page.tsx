"use client"

import React, { useState } from 'react'
import { useReviews, useReviewActions } from '@/hooks/useReviews'
import { ReusablePagination } from '@/components/ReusablePagination'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, CheckCircle2, XCircle, Clock, MessageSquare, Truck, Package } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

// ── Import (or re-declare) the ReviewStatus enum so the type is available ──
// If your project exports it from a service/types file, import from there instead:
// import { ReviewStatus } from '@/services/review.service'
export enum ReviewStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────

function StatusBadge({ status }: { status: ReviewStatus | string }) {
    switch (status) {
        case ReviewStatus.APPROVED:
            return (
                <Badge className="bg-green-50 text-green-600 border-green-100 uppercase text-[10px] font-black tracking-widest px-3 py-1 rounded-xl">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                </Badge>
            )
        case ReviewStatus.REJECTED:
            return (
                <Badge className="bg-rose-50 text-rose-600 border-rose-100 uppercase text-[10px] font-black tracking-widest px-3 py-1 rounded-xl">
                    <XCircle className="w-3 h-3 mr-1" /> Rejected
                </Badge>
            )
        default:
            return (
                <Badge className="bg-amber-50 text-amber-600 border-amber-100 uppercase text-[10px] font-black tracking-widest px-3 py-1 rounded-xl">
                    <Clock className="w-3 h-3 mr-1" /> Pending
                </Badge>
            )
    }
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default function ReviewModerationPage() {
    const [status, setStatus] = useState<ReviewStatus>(ReviewStatus.PENDING)
    const [page, setPage] = useState(1)

    const { data: reviewsData, isLoading } = useReviews({ status, page, limit: 10 })
    const { moderateReview, isModerating } = useReviewActions()

    // newStatus is now ReviewStatus — no string/type mismatch
    const handleModerate = async (id: string, newStatus: ReviewStatus) => {
        if (!id) return
        try {
            await moderateReview({ id, status: newStatus })
        } catch (error) {
            console.error('Moderation failed', error)
        }
    }

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Review Moderation</h1>
                    <p className="text-slate-500 font-medium">Manage and moderate customer feedback for products and delivery.</p>
                </div>
                <Select
                    value={status}
                    onValueChange={(val) => {
                        setStatus(val as ReviewStatus)
                        setPage(1)
                    }}
                >
                    <SelectTrigger className="w-[180px] rounded-2xl border-slate-200 bg-white font-bold text-slate-700 h-11">
                        <SelectValue placeholder="Status Filter" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100">
                        <SelectItem value={ReviewStatus.PENDING} className="font-bold">Pending Reviews</SelectItem>
                        <SelectItem value={ReviewStatus.APPROVED} className="font-bold">Approved Reviews</SelectItem>
                        <SelectItem value={ReviewStatus.REJECTED} className="font-bold">Rejected Reviews</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-[32px]" />)}
                    </div>
                ) : reviewsData?.data?.length === 0 ? (
                    <Card className="rounded-[32px] border-dashed border-2 border-slate-200 bg-slate-50/50 py-20">
                        <div className="flex flex-col items-center justify-center text-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <MessageSquare className="h-10 w-10 text-slate-200" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-black text-slate-900">
                                    No {status.toLowerCase()} reviews found
                                </p>
                                <p className="text-slate-400 font-medium tracking-tight">
                                    Great job! You've handled all the incoming feedback.
                                </p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {reviewsData?.data?.map((review: any) => (
                            <Card
                                key={review._id}
                                className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-300"
                            >
                                <CardContent className="p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row gap-8">

                                        {/* Product & User column */}
                                        <div className="w-full md:w-64 space-y-6 shrink-0">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 border-2 border-slate-100 shadow-sm">
                                                    <AvatarImage src={review.customerId?.profilePic} />
                                                    <AvatarFallback className="bg-blue-50 text-blue-600 font-black">
                                                        {review.customerId?.name?.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-900 truncate">{review.customerId?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 truncate tracking-tight">{review.customerId?.email}</p>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3">
                                                <div className="h-12 w-12 rounded-xl border border-slate-200 overflow-hidden bg-white">
                                                    <img src={review.productId?.thumbnail?.url} className="h-full w-full object-cover" alt="" />
                                                </div>
                                                <p className="text-xs font-black text-slate-800 leading-tight line-clamp-2">
                                                    {review.productId?.title}
                                                </p>
                                                <StatusBadge status={review.status} />
                                            </div>
                                        </div>

                                        {/* Review content column */}
                                        <div className="flex-1 space-y-10">
                                            <div className="grid md:grid-cols-2 gap-8">

                                                {/* Product review */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-blue-600">
                                                            <Package className="h-4 w-4" />
                                                            <span className="text-xs font-black uppercase tracking-widest">Product Rating</span>
                                                        </div>
                                                        <div className="flex items-center gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-700 font-medium leading-relaxed italic border-l-4 border-blue-100 pl-4 py-1">
                                                        "{review.comment}"
                                                    </p>
                                                    {review.images?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {review.images.map((img: any, idx: number) => (
                                                                <div key={idx} className="h-14 w-14 rounded-lg overflow-hidden border border-slate-100 cursor-zoom-in">
                                                                    <img src={img.url} className="h-full w-full object-cover" alt="" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Delivery review */}
                                                <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-purple-600">
                                                            <Truck className="h-4 w-4" />
                                                            <span className="text-xs font-black uppercase tracking-widest">Delivery Rating</span>
                                                        </div>
                                                        <div className="flex items-center gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star key={s} className={`h-3 w-3 ${s <= review.deliveryRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-700 font-medium leading-relaxed italic border-l-4 border-purple-100 pl-4 py-1">
                                                        "{review.deliveryComment || 'No delivery comment provided.'}"
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action buttons — only for PENDING */}
                                            {review.status === ReviewStatus.PENDING && (
                                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                                                    <Button
                                                        variant="ghost"
                                                        className="rounded-2xl font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-6"
                                                        onClick={() => handleModerate(review._id, ReviewStatus.REJECTED)}
                                                        disabled={isModerating}
                                                    >
                                                        Reject Review
                                                    </Button>
                                                    <Button
                                                        className="rounded-2xl font-black bg-blue-600 hover:bg-blue-700 px-10 shadow-lg shadow-blue-500/20"
                                                        onClick={() => handleModerate(review._id, ReviewStatus.APPROVED)}
                                                        disabled={isModerating}
                                                    >
                                                        Approve Review
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            <ReusablePagination
                currentPage={page}
                totalPages={reviewsData?.totalPages || 0}
                totalItems={reviewsData?.total || 0}
                itemsPerPage={10}
                onPageChange={setPage}
                itemsLabel="reviews"
            />
        </div>
    )
}