// components/order/OrderPaymentCard.tsx
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Wallet, CheckCircle2 } from 'lucide-react'

interface Props {
    paymentMethod: string
    paymentStatus: string
    razorpayOrderId?: string
    razorpayPaymentId?: string
}

export function OrderPaymentCard({
    paymentMethod,
    paymentStatus,
    razorpayOrderId,
    razorpayPaymentId,
}: Props) {
    const rows = [
        {
            label: 'Method',
            value: paymentMethod === 'razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery',
            mono: false,
        },
        ...(razorpayOrderId
            ? [{ label: 'Razorpay Order ID', value: razorpayOrderId, mono: true }]
            : []),
        ...(razorpayPaymentId
            ? [{ label: 'Payment ID', value: razorpayPaymentId, mono: true }]
            : []),
    ]

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    Payment Info
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
                {/* payment status badge */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${paymentStatus === 'paid' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Payment Status</span>
                    </div>
                    <Badge
                        variant={
                            paymentStatus === 'paid'
                                ? 'default'
                                : paymentStatus === 'failed'
                                    ? 'destructive'
                                    : 'outline'
                        }
                        className={`capitalize text-[10px] font-black px-3 py-1 rounded-xl gap-1.5 shadow-sm ${paymentStatus === 'paid' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    >
                        {paymentStatus === 'paid' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {paymentStatus}
                    </Badge>
                </div>

                {rows.map((row) => (
                    <div key={row.label}>
                        <Separator className="mb-3" />
                        <div className="flex items-start justify-between gap-4">
                            <span className="text-sm text-muted-foreground shrink-0">{row.label}</span>
                            <span
                                className={`text-sm font-semibold text-foreground text-right break-all ${row.mono ? 'font-mono text-xs' : ''
                                    }`}
                            >
                                {row.value}
                            </span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}