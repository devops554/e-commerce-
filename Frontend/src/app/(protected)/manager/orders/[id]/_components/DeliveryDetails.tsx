import React from 'react'
import { User, Phone, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function DeliveryDetails({ order }: { order: any }) {
    if (!order) return null;

    return (
        <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 px-6 pt-6 bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                    <User className="w-5 h-5 text-slate-400" />
                    Delivery Details
                </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900">{order.shippingAddress?.fullName}</p>
                    </div>
                </div>
                <Separator className="bg-slate-100" />
                <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold font-mono">{order.shippingAddress?.phone}</span>
                </div>
                <div
                    className="bg-slate-50 rounded-xl p-4 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group"
                    onClick={() => {
                        const { street, city, state, postalCode, location } = order.shippingAddress
                        const lat = location?.latitude
                        const lng = location?.longitude
                        const url = lat && lng
                            ? `https://www.google.com/maps?q=${lat},${lng}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${street}, ${city}, ${state}, ${postalCode}`)}`
                        window.open(url, '_blank')
                    }}
                >
                    <div className="flex gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5 group-hover:text-blue-500 transition-colors" />
                        <p className="text-xs text-slate-600 font-medium leading-relaxed group-hover:text-blue-600 transition-colors">
                            {order.shippingAddress?.street},<br />
                            {order.shippingAddress?.landmark && <>{order.shippingAddress.landmark},<br /></>}
                            {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                            {order.shippingAddress?.postalCode} - {order.shippingAddress?.country}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}