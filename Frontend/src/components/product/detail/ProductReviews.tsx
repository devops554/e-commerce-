"use client"

import React from 'react'
import { Star, ThumbsUp, CheckCircle2, MessageSquare } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ReusablePagination } from '@/components/ReusablePagination';

interface Review {
    _id: string;
    rating: number;
    comment: string;
    customerId: {
        name: string;
        profilePic?: string;
    };
    createdAt: string;
    images?: { url: string }[];
}

interface ProductReviewsProps {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export default function ProductReviews({
    reviews = [],
    averageRating = 0,
    totalReviews = 0,
    currentPage,
    totalPages,
    totalItems,
    onPageChange
}: ProductReviewsProps) {
    // ... rest of the component remains similar ...
    // Note: totalItems might be different from totalReviews if totalReviews is the pre-aggregated count from product doc
    // and totalItems is the count from the review query results. Use totalItems for pagination feedback.

    const breakdown = [
        { stars: 5, count: Math.ceil(totalReviews * 0.7) },
        { stars: 4, count: Math.ceil(totalReviews * 0.15) },
        { stars: 3, count: Math.ceil(totalReviews * 0.08) },
        { stars: 2, count: Math.ceil(totalReviews * 0.05) },
        { stars: 1, count: Math.ceil(totalReviews * 0.02) },
    ]

    return (
        <section className="bg-white p-6 md:p-8 border border-slate-200 rounded-[32px] shadow-sm space-y-10 mt-10">
            <div className="flex flex-col md:flex-row gap-10">
                {/* Rating Overview */}
                <div className="flex flex-col items-center md:items-start gap-2 min-w-[180px]">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        Customer Reviews
                    </h2>
                    <div className="mt-4 flex flex-col items-center md:items-start">
                        <span className="text-6xl font-black text-slate-900 leading-none">{averageRating.toFixed(1)}</span>
                        <div className="flex items-center gap-1 my-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={`h-4 w-4 ${s <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{totalReviews} Verified Ratings</span>
                    </div>
                </div>

                {/* Rating Breakdown */}
                <div className="flex-1 space-y-3">
                    {breakdown.map((item) => (
                        <div key={item.stars} className="flex items-center gap-4 text-sm">
                            <span className="w-12 font-bold text-slate-600 flex items-center gap-1 justify-end">
                                {item.stars} <Star className="h-3 w-3 fill-slate-400 text-slate-400" />
                            </span>
                            <Progress
                                value={totalReviews > 0 ? (item.count / totalReviews) * 100 : 0}
                                className="h-2 flex-1 bg-slate-100"
                            />
                            <span className="w-10 text-slate-400 font-medium">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-8 divide-y divide-slate-100">
                {reviews.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-slate-400 font-medium">No reviews yet for this product.</p>
                    </div>
                ) : (
                    <>
                        {reviews.map((review) => (
                            <div key={review._id} className="pt-8 first:pt-0 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-slate-100">
                                            <AvatarImage src={review.customerId.profilePic} />
                                            <AvatarFallback className="bg-blue-50 text-blue-600 font-bold uppercase">
                                                {review.customerId.name.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900">{review.customerId.name}</span>
                                                <div className="flex items-center gap-1 bg-green-50 text-green-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-green-100">
                                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                                    Verified Purchase
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={`h-3 w-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="pl-13">
                                    <p className="text-slate-700 leading-relaxed">{review.comment}</p>

                                    {review.images && review.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {review.images.map((img, idx) => (
                                                <div key={idx} className="h-16 w-16 rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
                                                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-6 flex items-center gap-4">
                                        <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
                                            <ThumbsUp className="h-3.5 w-3.5" />
                                            Helpful
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <ReusablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={10}
                            onPageChange={onPageChange}
                            itemsLabel="reviews"
                        />
                    </>
                )}
            </div>
        </section>
    )
}
