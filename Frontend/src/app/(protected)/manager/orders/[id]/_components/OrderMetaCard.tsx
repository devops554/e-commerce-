import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface OrderMetaCardProps {
    order: any
}

export function OrderMetaCard({ order }: OrderMetaCardProps) {
    if (!order) return null
    
    return (
        <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-3 px-6 pt-6 bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-black text-slate-900">Order Meta</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5">
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Placed On</span>
                        <span className="font-bold text-slate-900">{format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Payment</span>
                        <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.paymentStatus || 'pending'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
