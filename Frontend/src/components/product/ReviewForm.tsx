"use client"

import React, { useState } from 'react'
import { Star, Loader2, Package, Truck, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'

interface ReviewFormProps {
    orderId: string
    productId: string
    productTitle: string
    productImage?: string
    onSubmit: (values: any) => Promise<void>
    onCancel: () => void
}

// ─────────────────────────────────────────────
// STAR RATING
// ─────────────────────────────────────────────

const ratingLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Great',
    5: 'Excellent',
}

function StarRating({
    rating,
    setRating,
    color = 'text-yellow-400',
}: {
    rating: number
    setRating: (r: number) => void
    color?: string
}) {
    const [hovered, setHovered] = useState(0)
    const active = hovered || rating

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                        aria-label={`Rate ${star} stars`}
                    >
                        <Star
                            className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors duration-100
                                ${star <= active ? `${color} fill-current` : 'text-slate-200'}`}
                        />
                    </button>
                ))}
                {active > 0 && (
                    <span className="ml-2 text-xs font-bold text-slate-500 transition-all">
                        {ratingLabels[active]}
                    </span>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────

function SectionHead({
    icon,
    title,
    bg,
    iconColor,
}: {
    icon: React.ReactNode
    title: string
    bg: string
    iconColor: string
}) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${iconColor} shrink-0`}>
                {icon}
            </div>
            <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>
        </div>
    )
}

// ─────────────────────────────────────────────
// MAIN FORM
// ─────────────────────────────────────────────

export default function ReviewForm({
    orderId,
    productId,
    productTitle,
    productImage,
    onSubmit,
    onCancel,
}: ReviewFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [productRating, setProductRating] = useState(0)
    const [productComment, setProductComment] = useState('')
    const [deliveryRating, setDeliveryRating] = useState(0)
    const [deliveryComment, setDeliveryComment] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (productRating === 0) {
            toast.error('Please rate the product.')
            return
        }
        if (deliveryRating === 0) {
            toast.error('Please rate the delivery experience.')
            return
        }
        setIsSubmitting(true)
        try {
            await onSubmit({
                orderId,
                productId,
                rating: productRating,
                comment: productComment,
                deliveryRating,
                deliveryComment,
                images: [],
            })
            toast.success('Review submitted! Thank you.')
        } catch (err) {
            console.error(err)
            toast.error('Submission failed. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const bothRated = productRating > 0 && deliveryRating > 0

    return (
        /*
         * Outer wrapper fills the dialog viewport.
         * max-h + overflow-y-auto makes the form scrollable inside
         * the dialog on small screens without the dialog itself
         * overflowing the viewport.
         */
        <form
            onSubmit={handleSubmit}
            className="flex flex-col bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg mx-auto"
            style={{ maxHeight: 'min(90dvh, 680px)' }}
        >
            {/* ── Sticky header ── */}
            <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
                {/* Product thumbnail */}
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 shrink-0">
                    {productImage ? (
                        <img
                            src={productImage}
                            alt={productTitle}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-300" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-900 leading-tight truncate">
                        {productTitle}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        {orderId}
                    </p>
                </div>

                {/* Close button */}
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5 space-y-6">

                {/* Product rating section */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-4">
                    <SectionHead
                        icon={<Package className="h-4 w-4" />}
                        title="Product Feedback"
                        bg="bg-blue-50"
                        iconColor="text-blue-600"
                    />

                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            Product Quality
                        </p>
                        <StarRating
                            rating={productRating}
                            setRating={setProductRating}
                            color="text-yellow-400"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Your Thoughts
                        </p>
                        <Textarea
                            placeholder="What did you like or dislike?"
                            value={productComment}
                            onChange={(e) => setProductComment(e.target.value)}
                            rows={3}
                            className="resize-none rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
                        />
                    </div>
                </div>

                {/* Delivery rating section */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-4">
                    <SectionHead
                        icon={<Truck className="h-4 w-4" />}
                        title="Delivery Experience"
                        bg="bg-purple-50"
                        iconColor="text-purple-600"
                    />

                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            Delivery Service
                        </p>
                        <StarRating
                            rating={deliveryRating}
                            setRating={setDeliveryRating}
                            color="text-purple-400"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Service Feedback
                        </p>
                        <Textarea
                            placeholder="Was delivery on time? How was the partner's behavior?"
                            value={deliveryComment}
                            onChange={(e) => setDeliveryComment(e.target.value)}
                            rows={3}
                            className="resize-none rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-purple-500/20 focus-visible:border-purple-400"
                        />
                    </div>
                </div>

            </div>

            {/* ── Sticky footer ── */}
            <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">

                {/* Rating completion indicator */}
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {bothRated
                        ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Ready to submit</>
                        : <><span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 inline-block" /> Rate both sections</>
                    }
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="rounded-xl text-slate-400 hover:text-slate-700 font-bold text-xs h-9"
                    >
                        Later
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isSubmitting || !bothRated}
                        className="rounded-xl font-black bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-40 h-9 px-5 text-xs"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Posting…
                            </span>
                        ) : (
                            'Post Review'
                        )}
                    </Button>
                </div>
            </div>
        </form>
    )
}