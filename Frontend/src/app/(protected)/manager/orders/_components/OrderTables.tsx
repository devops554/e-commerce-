"use client"

import React, { useState } from 'react'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Check, MapPin, ShoppingCart, UserCheck, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { AssignPartnerDialog } from './AssignPartnerDialog'

const STATUS_COLOR: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    packed: "bg-indigo-100 text-indigo-800",
    shipped: "bg-violet-100 text-violet-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-600",
    pending_reassignment: "bg-amber-100 text-amber-700 border-amber-200",
}

export function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                <ShoppingCart className="h-8 w-8 text-slate-300" />
            </div>
            <h2 className="text-xl font-black text-slate-900">{label}</h2>
            <p className="text-slate-400 font-bold">Nothing to show here right now.</p>
        </div>
    )
}

// ─── Table Props ─────────────────────────────────────────────────────────────

interface OrderTableProps {
    orders: any[]
    warehouseId: string | undefined
    isMyItem: (item: any) => boolean
}

interface ConfirmOrdersTableProps extends OrderTableProps {
    onConfirm: (orderId: string, variantId: string) => void
    onBulkConfirm: (orderId: string) => void
    isConfirming: boolean
}

// ─── Confirm Orders Table ────────────────────────────────────────────────────

export function ConfirmOrdersTable({ orders, isMyItem, onConfirm, onBulkConfirm, isConfirming }: ConfirmOrdersTableProps) {
    const router = useRouter()
    const [packingSlipOrderId, setPackingSlipOrderId] = useState<string | null>(null)

    if (orders.length === 0) return <EmptyState label="No Orders to Confirm" />

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-bold text-slate-600 w-[130px]">Order ID</TableHead>
                        <TableHead className="font-bold text-slate-600">Customer &amp; Destination</TableHead>
                        <TableHead className="font-bold text-slate-600">Items</TableHead>
                        <TableHead className="font-bold text-slate-600">Date</TableHead>
                        <TableHead className="font-bold text-slate-600 text-right pr-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order: any) => {
                        const warehouseItems = order.items.filter(isMyItem)
                        return (
                            <TableRow key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                    <p className="font-black text-slate-900 text-xs font-mono">{order.orderId}</p>
                                    {order.invoiceNumber && (
                                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1 inline-block">{order.invoiceNumber}</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{(order.user as any)?.name || order.shippingAddress?.fullName}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1.5">
                                        {warehouseItems.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">{item.title}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                        <p className="text-[10px] text-slate-500 font-medium">SKU: {item.variant?.sku} · Qty: {item.quantity}</p>
                                                        {item.hsnCode && <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">HSN {item.hsnCode}</span>}
                                                        {item.gstRate !== undefined && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">{item.gstRate}% GST</span>}
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_COLOR[item.status?.toLowerCase()] ?? 'bg-slate-100 text-slate-700'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {format(new Date(order.createdAt), 'MMM dd, yyyy hh:mm a')}
                                    </p>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                variant="outline" size="icon"
                                                className="rounded-xl h-8 w-8 border-slate-200"
                                                onClick={() => router.push(`/manager/orders/${order._id}`)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline" size="icon"
                                                className="rounded-xl h-8 w-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                title="Print Packing Slip"
                                                onClick={() => router.push(`/manager/orders/${order._id}/invoice`)}
                                            >
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {warehouseItems.some((i: any) => i.status?.toLowerCase() === 'pending') ? (
                                            <Button
                                                size="sm"
                                                onClick={() => onBulkConfirm(order._id)}
                                                className="h-7 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 rounded-lg shadow-sm"
                                                disabled={isConfirming}
                                            >
                                                <Check className="h-3 w-3 mr-1" /> Confirm Items
                                            </Button>
                                        ) : (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-black px-2 py-1 text-[10px]">
                                                <Check className="h-3 w-3 mr-1" /> All Confirmed
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>


        </>
    )
}

// ─── Assign Delivery Table ───────────────────────────────────────────────────

export function AssignDeliveryTable({ orders, warehouseId, isMyItem }: OrderTableProps) {
    const router = useRouter()
    const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null)
    const [packingSlipOrderId, setPackingSlipOrderId] = useState<string | null>(null)

    if (orders.length === 0) return <EmptyState label="No Orders Awaiting Assignment" />

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-bold text-slate-600 w-[130px]">Order ID</TableHead>
                        <TableHead className="font-bold text-slate-600">Customer & Destination</TableHead>
                        <TableHead className="font-bold text-slate-600">Packed Items</TableHead>
                        <TableHead className="font-bold text-slate-600">Date</TableHead>
                        <TableHead className="font-bold text-slate-600 text-right pr-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order: any) => {
                        const warehouseItems = order.items.filter(isMyItem)
                        return (
                            <TableRow key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                    <p className="font-black text-slate-900 text-xs font-mono">{order.orderId}</p>
                                    {order.invoiceNumber && (
                                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1 inline-block">{order.invoiceNumber}</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{(order.user as any)?.name || order.shippingAddress?.fullName}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1.5">
                                        {warehouseItems.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">{item.title}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                        <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity}</p>
                                                        {item.hsnCode && <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">HSN {item.hsnCode}</span>}
                                                        {item.gstRate !== undefined && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">{item.gstRate}% GST</span>}
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_COLOR[item.status?.toLowerCase()] ?? 'bg-slate-100 text-slate-700'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {format(new Date(order.createdAt), 'MMM dd, yyyy hh:mm a')}
                                    </p>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                variant="outline" size="icon"
                                                className="rounded-xl h-8 w-8 border-slate-200"
                                                onClick={() => router.push(`/manager/orders/${order._id}`)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline" size="icon"
                                                className="rounded-xl h-8 w-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                title="Print Packing Slip"
                                                onClick={() => router.push(`/manager/orders/${order._id}/invoice`)}
                                            >
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => setAssigningOrderId(order._id)}
                                            className="h-7 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] px-3 rounded-lg shadow-sm shadow-indigo-200"
                                        >
                                            <UserCheck className="h-3 w-3 mr-1" /> Assign Partner
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            {assigningOrderId && warehouseId && (
                <AssignPartnerDialog
                    open={!!assigningOrderId}
                    onClose={() => setAssigningOrderId(null)}
                    orderId={assigningOrderId}
                    warehouseId={warehouseId}
                />
            )}

        </>
    )
}

// ─── Dispatched Orders Table ─────────────────────────────────────────────────

export function DispatchedOrdersTable({ orders, isMyItem }: OrderTableProps) {
    const router = useRouter()
    const [packingSlipOrderId, setPackingSlipOrderId] = useState<string | null>(null)
    if (orders.length === 0) return <EmptyState label="No Dispatched Orders" />

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-bold text-slate-600 w-[130px]">Order ID</TableHead>
                        <TableHead className="font-bold text-slate-600">Customer &amp; Destination</TableHead>
                        <TableHead className="font-bold text-slate-600">Items</TableHead>
                        <TableHead className="font-bold text-slate-600">Date</TableHead>
                        <TableHead className="font-bold text-slate-600 text-right pr-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order: any) => {
                        const warehouseItems = order.items.filter(isMyItem)
                        return (
                            <TableRow key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                    <p className="font-black text-slate-900 text-xs font-mono">{order.orderId}</p>
                                    {order.invoiceNumber && (
                                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1 inline-block">{order.invoiceNumber}</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{(order.user as any)?.name || order.shippingAddress?.fullName}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1.5">
                                        {warehouseItems.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">{item.title}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                        <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity}</p>
                                                        {item.hsnCode && <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">HSN {item.hsnCode}</span>}
                                                        {item.gstRate !== undefined && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">{item.gstRate}% GST</span>}
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_COLOR[item.status?.toLowerCase()] ?? 'bg-slate-100 text-slate-700'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {format(new Date(order.createdAt), 'MMM dd, yyyy hh:mm a')}
                                    </p>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <Button
                                            variant="outline" size="icon"
                                            className="rounded-xl h-8 w-8 border-slate-200"
                                            onClick={() => router.push(`/manager/orders/${order._id}`)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline" size="icon"
                                            className="rounded-xl h-8 w-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                            title="Print Packing Slip"
                                            onClick={() => router.push(`/manager/orders/${order._id}/invoice`)}
                                        >
                                            <FileText className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>


        </>
    )
}
