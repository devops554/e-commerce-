"use client";

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthContext'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { useWarehouseOrders, useDispatchItem, useBulkDispatchItem } from '@/hooks/useOrders'
import { Search, ChevronLeft, ChevronRight, Loader2, CheckCircle2, UserCheck, Send, MapPin } from 'lucide-react'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { ConfirmOrdersTable, AssignDeliveryTable, DispatchedOrdersTable, OrderTrackerView, CompletedOrdersView } from './_components/OrderTables'
import { ReturnsTable } from './_components/ReturnsTable'
import { useReturns } from '@/hooks/useReturns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/useDebounce'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { RotateCcw } from 'lucide-react'


type Tab = 'confirm' | 'assign' | 'dispatch' | 'tracker' | 'returns' | 'completed'

const TABS: { key: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'confirm', label: 'Confirm Orders', icon: <CheckCircle2 className="h-4 w-4" />, desc: 'New orders awaiting manager confirmation' },
    { key: 'assign', label: 'Assign Delivery', icon: <UserCheck className="h-4 w-4" />, desc: 'Confirmed orders awaiting delivery partner assignment' },
    { key: 'dispatch', label: 'Dispatched', icon: <Send className="h-4 w-4" />, desc: 'Orders handed to delivery partner' },
    { key: 'tracker', label: 'Order Tracker', icon: <MapPin className="h-4 w-4" />, desc: 'Live tracking of active deliveries' },
    { key: 'returns', label: 'Returns', icon: <RotateCcw className="h-4 w-4" />, desc: 'Returned items arriving at warehouse' },
    { key: 'completed', label: 'Completed Orders', icon: <CheckCircle2 className="h-4 w-4" />, desc: 'History of delivered orders' },
]

const FulfilmentPage = () => {
    const { user } = useAuth()
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: warehouse, isLoading: warehouseLoading } = useManagerWarehouse()

    /* ── Search & Pagination State ── */
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)
    const [page, setPage] = useState(1)
    const limit = 10

    const { data: response, isLoading: ordersLoading } = useWarehouseOrders(warehouse?._id || '', {
        page,
        limit,
        search: debouncedSearch
    })

    const { data: returnsResponse, isLoading: returnsLoading } = useReturns({
        page: 1,
        limit: 10,
        search: debouncedSearch
    }, 'manager')

    const [activeTab, setActiveTab] = useState<Tab>('confirm')

    const dispatchMutation = useDispatchItem()
    const bulkDispatchMutation = useBulkDispatchItem()

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Manager Dashboard', href: '/manager' },
            { label: 'Order Fulfillment' }
        ])
    }, [setBreadcrumbs])

    // Reset page when search changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    const handleConfirm = async (orderId: string, variantId: string) => {
        if (!warehouse) return
        await dispatchMutation.mutateAsync({ orderId, variantId, warehouseId: warehouse._id })
    }

    const handleBulkConfirm = async (orderId: string) => {
        if (!warehouse) return
        await bulkDispatchMutation.mutateAsync({ orderId, warehouseId: warehouse._id })
    }

    const isLoading = warehouseLoading || ordersLoading || returnsLoading
    const orders = response?.orders || []
    const returnsList = returnsResponse?.data || []

    const isMyItem = (item: any) =>
        item.warehouse === warehouse?._id ||
        (typeof item.warehouse === 'object' && (item.warehouse as any)?._id === warehouse?._id)

    // Tab filtering (still client-side for now, but on the paginated subset)
    const confirmOrders = orders.filter(order =>
        order.items.some((item: any) => isMyItem(item) && item.status?.toLowerCase() === 'pending')
    )

    const assignOrders = orders.filter(order =>
        order.items.filter(isMyItem).length > 0 &&
        order.items.filter(isMyItem).every((item: any) =>
            ['confirmed', 'packed', 'shipped', 'cancelled', 'pending_reassignment'].includes(item.status?.toLowerCase() || '')
        ) &&
        order.items.some((item: any) => isMyItem(item) && (item.status?.toLowerCase() === 'confirmed' || item.status?.toLowerCase() === 'packed'))
    )

    const dispatchedOrders = orders.filter(order =>
        order.items.filter(isMyItem).length > 0 &&
        order.items.filter(isMyItem).every((item: any) =>
            ['shipped', 'out_for_delivery', 'delivered', 'cancelled', 'pending_reassignment'].includes(item.status?.toLowerCase() || '')
        ) &&
        order.items.some((item: any) => isMyItem(item) && (item.status?.toLowerCase() === 'shipped' || item.status?.toLowerCase() === 'out_for_delivery'))
    )

    // For the UI logic, we define the arrays for new tabs simply based on tracking status.
    const activeTrackingOrders = orders.filter(order =>
        order.items.some((item: any) => isMyItem(item) && (item.status?.toLowerCase() === 'shipped' || item.status?.toLowerCase() === 'out_for_delivery')) &&
        !order.items.every((item: any) => !isMyItem(item) || item.status?.toLowerCase() === 'delivered' || item.status?.toLowerCase() === 'cancelled')
    )

    const completedHistoryOrders = orders.filter(order =>
        order.items.every((item: any) => !isMyItem(item) || item.status?.toLowerCase() === 'delivered' || item.status?.toLowerCase() === 'cancelled') &&
        order.items.some((item: any) => isMyItem(item) && (item.status?.toLowerCase() === 'delivered' || item.status?.toLowerCase() === 'cancelled'))
    )

    const tabCounts: Record<Tab, number> = {
        confirm: confirmOrders.length,
        assign: assignOrders.length,
        dispatch: dispatchedOrders.length,
        tracker: activeTrackingOrders.length,
        returns: returnsResponse?.total || 0,
        completed: completedHistoryOrders.length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Fulfillment</h1>
                    <p className="text-slate-500 font-bold mt-1">Managing <span className="text-slate-900">{warehouse?.name || '...'}</span></p>
                </div>
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search order ID, customer..."
                        className="pl-10 h-10 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs & Pagination Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === tab.key
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {tabCounts[tab.key] > 0 && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {tabCounts[tab.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {response && response.totalPages > 1 && (
                    <Pagination className="mx-0 w-fit">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage(p => Math.max(1, p - 1));
                                    }}
                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {Array.from({ length: response.totalPages }, (_, i) => i + 1).map((p) => {
                                // Simple logic to show current, first, last and 1 near current
                                if (
                                    p === 1 ||
                                    p === response.totalPages ||
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
                                        setPage(p => Math.min(response.totalPages, p + 1));
                                    }}
                                    className={page === response.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            <p className="text-sm text-slate-500 font-medium -mt-2">
                {TABS.find(t => t.key === activeTab)?.desc}
            </p>

            {/* Table Content */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : activeTab === 'confirm' ? (
                    <ConfirmOrdersTable
                        orders={confirmOrders}
                        warehouseId={warehouse?._id}
                        isMyItem={isMyItem}
                        onConfirm={handleConfirm}
                        onBulkConfirm={handleBulkConfirm}
                        isConfirming={dispatchMutation.isPending || bulkDispatchMutation.isPending}
                    />
                ) : activeTab === 'assign' ? (
                    <AssignDeliveryTable
                        orders={assignOrders}
                        warehouseId={warehouse?._id}
                        isMyItem={isMyItem}
                    />
                ) : activeTab === 'dispatch' ? (
                    <DispatchedOrdersTable
                        orders={dispatchedOrders}
                        warehouseId={warehouse?._id}
                        isMyItem={isMyItem}
                    />
                ) : activeTab === 'tracker' ? (
                    <OrderTrackerView
                        orders={activeTrackingOrders}
                        warehouseId={warehouse?._id}
                        isMyItem={isMyItem}
                    />
                ) : activeTab === 'returns' ? (
                    <ReturnsTable
                        returns={returnsList}
                        isLoading={returnsLoading}
                    />
                ) : (
                    <CompletedOrdersView
                        orders={completedHistoryOrders}
                        warehouseId={warehouse?._id}
                        isMyItem={isMyItem}
                    />
                )}
            </div>

            {/* Total Count Footer */}
            {response && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Showing {orders.length} of {response.total} total relevant orders
                </p>
            )}
        </div>
    )
}

export default FulfilmentPage


