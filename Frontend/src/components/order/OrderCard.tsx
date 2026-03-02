"use client"

import { useState } from "react"
import {
    ChevronDown,
    ChevronUp,
    MapPin,
    Wallet,
    Package,
    Truck,
    Eye,
    Phone,
    Home,
    XCircle,
} from "lucide-react"
import { Order, OrderStatus, orderService } from "@/services/order.service"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CancelOrderDialog } from "./CancelOrderDialog"

const STATUS_CONFIG: Record<
    OrderStatus,
    { label: string; dot: string; pill: string }
> = {
    created: {
        label: "Order Placed",
        dot: "bg-slate-400",
        pill: "bg-slate-100 text-slate-600 border border-slate-200",
    },
    pending: {
        label: "Pending",
        dot: "bg-amber-400",
        pill: "bg-amber-50 text-amber-700 border border-amber-200",
    },
    confirmed: {
        label: "Confirmed",
        dot: "bg-sky-400",
        pill: "bg-sky-50 text-sky-700 border border-sky-200",
    },
    shipped: {
        label: "Shipped",
        dot: "bg-violet-400",
        pill: "bg-violet-50 text-violet-700 border border-violet-200",
    },
    delivered: {
        label: "Delivered",
        dot: "bg-emerald-400",
        pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
    failed: {
        label: "Failed",
        dot: "bg-rose-400",
        pill: "bg-rose-50 text-rose-700 border border-rose-200",
    },
    cancelled: {
        label: "Cancelled",
        dot: "bg-gray-300",
        pill: "bg-gray-100 text-gray-500 border border-gray-200",
    },
}

function getNetVolume(
    attributes: { name: string; value: string }[] = []
): string | null {
    return attributes.find((a) => a.name === "Net Volume")?.value ?? null
}

export function OrderCard({ order }: { order: Order }) {
    const [itemsExpanded, setItemsExpanded] = useState(false)
    const [addressExpanded, setAddressExpanded] = useState(false)
    const [isCancelOpen, setIsCancelOpen] = useState(false)
    const queryClient = useQueryClient()

    const cancelMutation = useMutation({
        mutationFn: (reason: string) => orderService.cancelOrder(order._id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            toast.success("Order cancelled successfully")
            setIsCancelOpen(false)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to cancel order")
        }
    })

    const status =
        STATUS_CONFIG[order.orderStatus] ?? {
            label: order.orderStatus,
            dot: "bg-slate-400",
            pill: "bg-slate-100 text-slate-600 border border-slate-200",
        }

    const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })

    const visibleItems = itemsExpanded ? order.items : order.items.slice(0, 2)
    const hiddenCount = order.items.length - 2
    const addr = order.shippingAddress

    return (
        <article className="group relative bg-white rounded-3xl border border-[#ede8e0] shadow-[0_2px_16px_0_rgba(120,100,60,0.07)] hover:shadow-[0_6px_32px_0_rgba(120,100,60,0.13)] transition-shadow duration-300 overflow-hidden">

            {/* Left accent bar */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${status.dot}`} />

            {/* ── Header ── */}
            <div className="flex items-start justify-between pl-7 pr-5 pt-5 pb-4">
                <div>
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#b5a48a] mb-0.5">
                        Order
                    </p>
                    <p className="text-sm font-bold text-[#3b2e1e] font-mono tracking-tight">
                        {order.orderId}
                    </p>
                    <p className="text-xs text-[#a09070] mt-0.5">{date}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full ${status.pill}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                    </span>
                    <p className="text-lg font-black text-[#3b2e1e] tracking-tight">
                        &#8377;{order.totalAmount?.toLocaleString("en-IN")}
                    </p>
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="mx-5 border-t border-dashed border-[#e8e0d0]" />

            {/* ── Items ── */}
            <div className="pl-7 pr-5 py-4 space-y-3">
                {visibleItems.map((item, i) => {
                    const variantImg = item.variant?.images?.[0]?.url
                    const productImg = item.product?.images?.[0]?.url
                    const imgSrc = variantImg || productImg
                    const netVolume = getNetVolume(item.variant?.attributes)

                    return (
                        <div key={item._id ?? i} className="flex items-center gap-3.5">
                            <div className="relative w-[52px] h-[52px] rounded-2xl overflow-hidden bg-[#f5f0e8] border border-[#ede8e0] flex-shrink-0">
                                {imgSrc ? (
                                    <img
                                        src={imgSrc}
                                        alt={item.title || "Product"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const el = e.target as HTMLImageElement
                                            el.style.display = "none"
                                            el.nextElementSibling?.classList.remove("hidden")
                                        }}
                                    />
                                ) : null}
                                <div className={`${imgSrc ? "hidden" : ""} absolute inset-0 flex items-center justify-center`}>
                                    <Package className="w-5 h-5 text-[#c5b99a]" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#3b2e1e] truncate leading-snug">
                                    {item.title || "Product"}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {netVolume && (
                                        <span className="inline-block text-[10px] font-bold bg-[#f0ebe0] text-[#8a7055] border border-[#ddd5c0] px-2 py-0.5 rounded-full tracking-wide">
                                            {netVolume}
                                        </span>
                                    )}
                                    <span className="text-[11px] text-[#b5a48a] font-medium">
                                        Qty: {item.quantity}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm font-bold text-[#3b2e1e] flex-shrink-0">
                                &#8377;{item.price?.toLocaleString("en-IN")}
                            </p>
                        </div>
                    )
                })}

                {order.items.length > 2 && (
                    <button
                        onClick={() => setItemsExpanded((e) => !e)}
                        className="flex items-center gap-1 text-xs font-bold text-[#9b7f52] hover:text-[#3b2e1e] transition-colors mt-1"
                    >
                        {itemsExpanded ? (
                            <><ChevronUp className="w-3.5 h-3.5" />Show less</>
                        ) : (
                            <><ChevronDown className="w-3.5 h-3.5" />+{hiddenCount} more {hiddenCount === 1 ? "item" : "items"}</>
                        )}
                    </button>
                )}
            </div>

            {/* ── Divider ── */}
            <div className="mx-5 border-t border-dashed border-[#e8e0d0]" />

            {/* ── Shipping Address ── */}
            <div className="pl-7 pr-5 py-3.5">
                <button
                    onClick={() => setAddressExpanded((e) => !e)}
                    className="flex items-center gap-2 w-full"
                >
                    <MapPin className="w-3.5 h-3.5 text-[#c5b48a] flex-shrink-0" />
                    <span className="flex-1 text-left text-xs font-semibold text-[#6b5740] truncate">
                        {addr?.fullName}
                        <span className="font-normal text-[#a09070]">
                            {" · "}{addr?.city}, {addr?.state}
                        </span>
                    </span>
                    <span className="text-[10px] font-bold text-[#9b7f52] flex items-center gap-0.5 flex-shrink-0">
                        {addressExpanded ? (
                            <>Hide <ChevronUp className="w-3 h-3" /></>
                        ) : (
                            <>Full address <ChevronDown className="w-3 h-3" /></>
                        )}
                    </span>
                </button>

                {addressExpanded && addr && (
                    <div className="mt-3 ml-5 bg-[#faf7f2] border border-[#ede8e0] rounded-2xl p-3.5 space-y-2.5">
                        <div className="flex items-start gap-2.5">
                            <Home className="w-3.5 h-3.5 text-[#c5b48a] mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-[#5a4535] leading-relaxed space-y-0.5">
                                <p className="font-bold text-[#3b2e1e]">{addr.fullName}</p>
                                <p>{addr.street}</p>
                                {addr.landmark && (
                                    <p className="text-[#a09070] italic">Near: {addr.landmark}</p>
                                )}
                                <p>
                                    {addr.city}, {addr.state} &ndash; <span className="font-semibold">{addr.postalCode}</span>
                                </p>
                                <p className="text-[#a09070]">{addr.country}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 border-t border-[#ede8e0] pt-2.5">
                            <Phone className="w-3.5 h-3.5 text-[#c5b48a] flex-shrink-0" />
                            <p className="text-xs font-bold text-[#5a4535] font-mono tracking-wider">
                                {addr.phone}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Divider ── */}
            <div className="mx-5 border-t border-dashed border-[#e8e0d0]" />

            {/* ── Payment info ── */}
            <div className="pl-7 pr-5 py-3 flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-[#c5b48a]" />
                <span className="text-xs text-[#a09070]">
                    {order.paymentMethod === "razorpay" ? "Online Payment" : "Cash on Delivery"}
                </span>
                <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${order.paymentStatus === "paid"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                >
                    {order.paymentStatus}
                </span>
            </div>

            {/* ── Divider ── */}
            <div className="mx-5 border-t border-dashed border-[#e8e0d0]" />

            {/* ── Action Buttons ── */}
            <div className="pl-7 pr-5 py-4 flex items-center gap-3">
                {/* Cancel button - only for pending/created */}
                {(order.orderStatus === 'created' || order.orderStatus === 'pending') && (
                    <button
                        onClick={() => setIsCancelOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-rose-50 text-rose-500 text-xs font-bold py-2.5 px-4 rounded-2xl border border-rose-100 transition-all duration-200"
                    >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel Order
                    </button>
                )}

                <Link
                    href={`/my-orders/${order._id}/track`}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#3b2e1e] hover:bg-[#2a2010] text-[#f5f0e8] text-xs font-bold py-2.5 px-4 rounded-2xl transition-all duration-200 group/trace hover:gap-2.5"
                >
                    <Truck className="w-3.5 h-3.5" />
                    Track Order
                </Link>

                <Link
                    href={`/my-orders/${order._id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#f0ebe0] hover:bg-[#e8e0d0] text-[#5a4535] text-xs font-bold py-2.5 px-4 rounded-2xl border border-[#ddd5c0] transition-all duration-200 group/view hover:gap-2.5"
                >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                </Link>
            </div>

            <CancelOrderDialog
                isOpen={isCancelOpen}
                onClose={() => setIsCancelOpen(false)}
                isPending={cancelMutation.isPending}
                onConfirm={(reason) => cancelMutation.mutate(reason)}
            />
        </article>
    )
}