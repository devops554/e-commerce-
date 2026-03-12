"use client";

import { useState, useEffect } from "react"
import { useOrders } from "@/hooks/useOrders"
import { orderService, Order, OrderStatus } from "@/services/order.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Loader2, Search, Package, ChevronLeft, ChevronRight, Eye, CheckCircle2, Truck } from "lucide-react"

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    created: { label: "Placed", variant: "secondary" },
    pending: { label: "Pending", variant: "outline" },
    confirmed: { label: "Confirmed", variant: "default" },
    packed: { label: "Packed", variant: "default" },
    shipped: { label: "Shipped", variant: "default" },
    out_for_delivery: { label: "Out For Delivery", variant: "default" },
    delivered: { label: "Delivered", variant: "default" },
    failed: { label: "Failed", variant: "destructive" },
    cancelled: { label: "Cancelled", variant: "destructive" },
    returned: { label: "Returned", variant: "outline" },
    failed_delivery: { label: "Delivery Failed", variant: "destructive" },
    PENDING_REASSIGNMENT: { label: "Reassignment Req.", variant: "outline" },
}

const STATUS_COLOR: Record<string, string> = {
    created: "bg-slate-100 text-slate-700",
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    packed: "bg-indigo-100 text-indigo-800",
    shipped: "bg-violet-100 text-violet-800",
    out_for_delivery: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-600",
    returned: "bg-stone-100 text-stone-600",
    failed_delivery: "bg-red-50 text-red-600",
    PENDING_REASSIGNMENT: "bg-amber-100 text-amber-800",
}

const ALL_STATUSES: OrderStatus[] = ["created", "pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "failed", "cancelled", "returned", "failed_delivery", "PENDING_REASSIGNMENT"]

import { useBreadcrumb } from "@/providers/BreadcrumbContext"

import { useDebounce } from "@/hooks/useDebounce"
import { useSearchParams } from "next/navigation"

export default function AdminOrdersPage() {
    const queryClient = useQueryClient()
    const { setBreadcrumbs } = useBreadcrumb()
    const [page, setPage] = useState(1)
    const [rawSearch, setRawSearch] = useState("")
    const search = useDebounce(rawSearch, 400)
    const [status, setStatus] = useState<string>("all")
    const params = useSearchParams()

    useEffect(() => {
        const status = params.get("status")
        if (status) {
            setStatus(status)
        }
        setBreadcrumbs([{ label: "Orders", href: "/admin/orders" }])
    }, [setBreadcrumbs])

    const { data, isLoading } = useOrders({
        page,
        limit: 15,
        status: status === "all" ? undefined : status,
        search: search || undefined,
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
            orderService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', 'all'] })
            toast.success("Order status updated")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update status")
        },
    })

    const orders = data?.orders || []

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Orders</h1>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                        {data?.total ?? 0} total orders
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by order ID, name, phone..."
                        className="pl-9 rounded-xl border-slate-200"
                        value={rawSearch}
                        onChange={e => { setRawSearch(e.target.value); setPage(1) }}
                    />
                </div>
                <Select value={status} onValueChange={s => { setStatus(s); setPage(1) }}>
                    <SelectTrigger className="w-[160px] rounded-xl border-slate-200">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {ALL_STATUSES.map(s => (
                            <SelectItem key={s} value={s} className="capitalize">{STATUS_CONFIG[s]?.label ?? s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <Package className="h-12 w-12 text-slate-200" />
                        <p className="text-slate-400 font-semibold">No orders found</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="font-bold text-slate-600">Order ID</TableHead>
                                <TableHead className="font-bold text-slate-600">Customer</TableHead>
                                <TableHead className="font-bold text-slate-600">Items</TableHead>
                                <TableHead className="font-bold text-slate-600">Amount</TableHead>
                                <TableHead className="font-bold text-slate-600">Payment</TableHead>
                                <TableHead className="font-bold text-slate-600">Status</TableHead>
                                <TableHead className="font-bold text-slate-600">Date</TableHead>
                                <TableHead className="font-bold text-slate-600">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order: any) => (
                                <TableRow key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <p className="font-black text-slate-900 text-xs">{order.orderId}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{order.shippingAddress?.fullName}</p>
                                            <p className="text-xs text-slate-400">{(order.user as any)?.email || order.shippingAddress?.phone}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-semibold text-slate-700">{order.items?.length} item(s)</p>
                                        <p className="text-xs text-slate-400 truncate max-w-[120px]">
                                            {order.items?.[0]?.title}
                                            {order.items?.length > 1 && ` +${order.items.length - 1}`}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-black text-slate-900">₹{order.totalAmount?.toLocaleString("en-IN")}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-600 capitalize">{order.paymentMethod === 'razorpay' ? 'Online' : 'COD'}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit capitalize ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.orderStatus] ?? 'bg-slate-100 text-slate-700'}`}>
                                            {STATUS_CONFIG[order.orderStatus]?.label ?? order.orderStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/orders/${order._id}`}>
                                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200">
                                                    <Eye className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </Link>

                                            {/* {order.orderStatus === 'created' && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-[10px] font-black uppercase tracking-wider"
                                                    onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'confirmed' })}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Confirm
                                                </Button>
                                            )}
                                            {order.orderStatus === 'confirmed' && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-[10px] font-black uppercase tracking-wider"
                                                    onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'packed' })}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    <Package className="w-3 h-3 mr-1" />
                                                    Pack
                                                </Button>
                                            )}
                                            {order.orderStatus === 'packed' && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 rounded-lg bg-violet-500 hover:bg-violet-600 text-[10px] font-black uppercase tracking-wider"
                                                    onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'shipped' })}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    <Truck className="w-3 h-3 mr-1" />
                                                    Ship
                                                </Button>
                                            )}
                                            {order.orderStatus === 'shipped' && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-[10px] font-black uppercase tracking-wider"
                                                    onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'out_for_delivery' })}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    <Truck className="w-3 h-3 mr-1" />
                                                    Deliver
                                                </Button>
                                            )}
                                            {order.orderStatus === 'out_for_delivery' && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[10px] font-black uppercase tracking-wider"
                                                    onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'delivered' })}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Complete
                                                </Button>
                                            )}

                                            <Select
                                                value={order.orderStatus}
                                                onValueChange={s => updateStatusMutation.mutate({ id: order._id, status: s as OrderStatus })}
                                                disabled={updateStatusMutation.isPending}
                                            >
                                                <SelectTrigger className="h-8 w-[110px] rounded-lg text-xs border-slate-200 bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ALL_STATUSES.map(s => (
                                                        <SelectItem key={s} value={s} className="text-xs capitalize">
                                                            {STATUS_CONFIG[s]?.label ?? s}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select> */}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-8 py-6 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {orders.length} of {data.total} orders
                    </p>
                    <Pagination className="mx-0 w-fit">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage(Math.max(1, page - 1));
                                    }}
                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => {
                                if (
                                    p === 1 ||
                                    p === data.totalPages ||
                                    (p >= page - 1 && p <= page + 1)
                                ) {
                                    return (
                                        <PaginationItem key={p}>
                                            <PaginationLink
                                                href="#"
                                                isActive={page === p}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPage(p);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                {p}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                } else if (p === page - 2 || p === page + 2) {
                                    return (
                                        <PaginationItem key={p}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }
                                return null;
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage(Math.min(data.totalPages, page + 1));
                                    }}
                                    className={page === data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}
