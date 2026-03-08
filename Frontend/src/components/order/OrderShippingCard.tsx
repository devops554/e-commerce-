// components/order/OrderShippingCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MapPin, Home, Phone } from 'lucide-react'

interface ShippingAddress {
    fullName: string
    phone: string
    street: string
    landmark?: string
    city: string
    state: string
    postalCode: string
    country: string
    latitude?: number
    longitude?: number
}

interface Props {
    address: ShippingAddress
}

export function OrderShippingCard({ address: a }: Props) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Shipping Address
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
                <div
                    className="bg-slate-50 rounded-xl p-4 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group"
                    onClick={() => {
                        const { latitude, longitude, street, city, state, postalCode } = a
                        const url = latitude && longitude
                            ? `https://www.google.com/maps?q=${latitude},${longitude}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${street}, ${city}, ${state}, ${postalCode}`)}`
                        window.open(url, '_blank')
                    }}
                >
                    <div className="flex gap-3">
                        <div className="text-sm leading-relaxed space-y-0.5">
                            <p className="font-semibold text-foreground">{a.fullName}</p>
                            <p className="text-muted-foreground">{a.street}</p>
                            {a.landmark && (
                                <p className="text-muted-foreground text-xs italic">Near: {a.landmark}</p>
                            )}
                            <p className="text-muted-foreground">
                                {a.city}, {a.state}&nbsp;&ndash;&nbsp;
                                <span className="font-semibold text-foreground">{a.postalCode}</span>
                            </p>
                            <p className="text-muted-foreground text-xs">{a.country}</p>
                        </div>
                    </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <p className="text-sm font-semibold text-foreground font-mono tracking-wider">
                        {a.phone}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}