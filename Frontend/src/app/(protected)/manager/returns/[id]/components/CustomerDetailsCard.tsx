import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { User } from 'lucide-react'
import { ReturnRequest } from '@/services/return.service'

interface CustomerDetailsCardProps {
    request: ReturnRequest;
}

export function CustomerDetailsCard({ request }: CustomerDetailsCardProps) {
    return (
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-6 bg-slate-900 text-white">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-400" />
                    Customer Info
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Name</p>
                    <p className="font-bold text-slate-800">{request.customerId.name}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Contact</p>
                    <p className="text-sm font-medium text-slate-600">{request.customerId.email}</p>
                    <p className="text-sm font-medium text-slate-600">{request.customerId.phone}</p>
                </div>
                <Separator className="bg-slate-50" />
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Order Ref</p>
                    <p className="font-mono text-sm font-bold text-blue-600">{request.orderId?.orderId}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Warehouse</p>
                    <p className="text-sm font-bold text-slate-700">{request.warehouseId?.name || "Pending Assignment"}</p>
                </div>
            </CardContent>
        </Card>
    )
}
