"use client"
/* ─────────────────────────────────────────────────────────────
   OrderTable.tsx  —  redesigned orders table
   Features: row checkboxes, status pills, hover, empty state
───────────────────────────────────────────────────────────────*/
import React from "react"
import Link from "next/link"
import { Eye, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { getSM } from "@/types/order-constants"

interface Props {
    orders: any[]
    isLoading: boolean
    selectedIds: Set<string>
    onToggle: (id: string) => void
    detailHref: (id: string) => string   // e.g. id => `/admin/orders/${id}`
}

export function OrderTable({ orders, isLoading, selectedIds, onToggle, detailHref }: Props) {
    /* ── loading ── */
    if (isLoading) return (
        <div className="flex justify-center items-center py-24 bg-white rounded-2xl border border-slate-100">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
        </div>
    )

    /* ── empty ── */
    if (orders.length === 0) return (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-slate-400 font-semibold text-sm">No orders found</p>
        </div>
    )

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-100">
                        <TableHead className="w-10 pl-4">
                            <span className="sr-only">Select</span>
                        </TableHead>
                        <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">Order</TableHead>
                        <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">Customer</TableHead>
                        <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider hidden md:table-cell">Items</TableHead>
                        <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">Amount</TableHead>
                        <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider hidden sm:table-cell">Payment</TableHead>
                        <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">Status</TableHead>
                        <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider hidden lg:table-cell">Date</TableHead>
                        <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right pr-4">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {orders.map((order: any) => {
                        const sm = getSM(order.orderStatus)
                        const selected = selectedIds.has(order._id)
                        const isPaid = order.paymentStatus === "paid"

                        return (
                            <TableRow
                                key={order._id}
                                className={cn(
                                    "border-b border-slate-50 transition-colors group",
                                    selected ? "bg-indigo-50/60 hover:bg-indigo-50/80" : "hover:bg-slate-50/60"
                                )}
                            >
                                {/* ── checkbox ── */}
                                <TableCell className="pl-4 w-10">
                                    <Checkbox
                                        checked={selected}
                                        onCheckedChange={() => onToggle(order._id)}
                                        className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                        aria-label={`Select order ${order.orderId}`}
                                    />
                                </TableCell>

                                {/* ── order id ── */}
                                <TableCell>
                                    <code className="text-[11px] font-black text-slate-700 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                                        #{order.orderId}
                                    </code>
                                </TableCell>

                                {/* ── customer ── */}
                                <TableCell>
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-xs font-black text-indigo-600">
                                            {(order.shippingAddress?.fullName || "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">
                                                {order.shippingAddress?.fullName}
                                            </p>
                                            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                                {(order.user as any)?.email || order.shippingAddress?.phone}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* ── items ── */}
                                <TableCell className="hidden md:table-cell">
                                    <p className="text-sm font-semibold text-slate-700">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</p>
                                    <p className="text-[10px] text-slate-400 truncate max-w-[110px]">
                                        {order.items?.[0]?.title}{order.items?.length > 1 && ` +${order.items.length - 1}`}
                                    </p>
                                </TableCell>

                                {/* ── amount ── */}
                                <TableCell>
                                    <p className="text-sm font-black text-slate-900">
                                        ₹{order.totalAmount?.toLocaleString("en-IN")}
                                    </p>
                                </TableCell>

                                {/* ── payment ── */}
                                <TableCell className="hidden sm:table-cell">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-slate-600">
                                            {order.paymentMethod === "razorpay" ? "Online" : "COD"}
                                        </p>
                                        <span className={cn(
                                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                                            isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                        )}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* ── status ── */}
                                <TableCell>
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border",
                                        sm.pill
                                    )}>
                                        <span
                                            className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                                            style={{ background: sm.dot }}
                                        />
                                        {sm.short}
                                    </span>
                                </TableCell>

                                {/* ── date ── */}
                                <TableCell className="hidden lg:table-cell">
                                    <p className="text-[11px] text-slate-500 font-medium">
                                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "short", year: "numeric",
                                        })}
                                    </p>
                                    <p className="text-[10px] text-slate-300">
                                        {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                                            hour: "2-digit", minute: "2-digit",
                                        })}
                                    </p>
                                </TableCell>

                                {/* ── action ── */}
                                <TableCell className="pr-4 text-right">
                                    <Link href={detailHref(order._id)}>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-xl border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all group-hover:border-slate-300"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}