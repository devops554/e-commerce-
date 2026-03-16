"use client"

import React, { useState } from 'react'
import { Star, Upload, Loader2, MessageSquare, Truck, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'react-hot-toast'

interface ReviewFormProps {
    orderId: string;
    productId: string;
    productTitle: string;
    productImage?: string;
    onSubmit: (values: any) => Promise<void>;
    onCancel: () => void;
}

export default function ReviewForm({ 
    orderId, 
    productId, 
    productTitle, 
    productImage, 
    onSubmit, 
    onCancel 
}: ReviewFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [productRating, setProductRating] = useState(0)
    const [productComment, setProductComment] = useState('')
    const [deliveryRating, setDeliveryRating] = useState(0)
    const [deliveryComment, setDeliveryComment] = useState('')
    const [images, setImages] = useState<string[]>([]) // For now, simple URLs or placeholders

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (productRating === 0 || deliveryRating === 0) {
            toast.error('Please provide a rating for both product and delivery.')
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
                images: images.map(url => ({ url }))
            })
            toast.success('Review submitted for moderation!')
        } catch (error) {
            console.error('Submission failed', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const StarRating = ({ rating, setRating, label }: { rating: number, setRating: (r: number) => void, label: string }) => (
        <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`transition-all transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`}
                    >
                        <Star className={`h-8 w-8 ${star <= rating ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
        </div>
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="rounded-[32px] border-slate-100 shadow-xl overflow-hidden bg-white">
                <CardContent className="p-8 space-y-10">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 shrink-0 shadow-sm">
                            {productImage ? (
                                <img src={productImage} alt={productTitle} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                    <Package className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight">Rate Your Purchase</h3>
                            <p className="text-sm font-bold text-slate-400">Order ID: {orderId}</p>
                        </div>
                    </div>

                    {/* Product Rating */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Package className="h-5 w-5" />
                            </div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">Product Feedback</h4>
                        </div>
                        
                        <StarRating rating={productRating} setRating={setProductRating} label="Product Quality" />
                        
                        <div className="space-y-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Thoughts</span>
                            <Textarea 
                                placeholder="What did you like or dislike about the product?"
                                value={productComment}
                                onChange={(e) => setProductComment(e.target.value)}
                                className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/50"
                            />
                        </div>
                    </div>

                    {/* Delivery Rating */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <Truck className="h-5 w-5" />
                            </div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">Delivery Experience</h4>
                        </div>

                        <StarRating rating={deliveryRating} setRating={setDeliveryRating} label="Delivery Service" />

                        <div className="space-y-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Service Feedback</span>
                            <Textarea 
                                placeholder="How was the delivery person's behavior? Was it on time?"
                                value={deliveryComment}
                                onChange={(e) => setDeliveryComment(e.target.value)}
                                className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-purple-500/10 focus:border-purple-500 bg-slate-50/50"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button 
                            variant="ghost" 
                            type="button" 
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="rounded-2xl font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                        >
                            Review Later
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="rounded-2xl px-10 font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Submitting
                                </span>
                            ) : (
                                "Post Review"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
