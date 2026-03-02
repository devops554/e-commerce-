// components/order/OrderMetaCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ReceiptText } from 'lucide-react'
import React from 'react'

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

interface Props {
    orderId: string
    createdAt: string
    updatedAt: string
    isStockDeducted?: boolean
}

export function OrderMetaCard({ orderId, createdAt, updatedAt, isStockDeducted = false }: Props) {
    const rows = [
        { label: 'Order ID', value: orderId, mono: true },
        { label: 'Placed On', value: `${fmtDate(createdAt)}, ${fmtTime(createdAt)}`, mono: false },
        { label: 'Last Updated', value: `${fmtDate(updatedAt)}, ${fmtTime(updatedAt)}`, mono: false },
        { label: 'Stock Status', value: isStockDeducted ? 'Deducted' : 'Not yet deducted', mono: false },
    ]

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ReceiptText className="w-4 h-4 text-muted-foreground" />
                    Order Info
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
                {rows.map((row, i) => (
                    <React.Fragment key={row.label}>
                        {i > 0 && <Separator />}
                        <div className="flex items-start justify-between gap-4">
                            <span className="text-sm text-muted-foreground shrink-0">{row.label}</span>
                            <span
                                className={`text-sm font-semibold text-foreground text-right break-all ${row.mono ? 'font-mono text-xs' : ''
                                    }`}
                            >
                                {row.value}
                            </span>
                        </div>
                    </React.Fragment>
                ))}
            </CardContent>
        </Card>
    )
}