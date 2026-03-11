"use client";

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthContext'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { useWarehouseOrders, useDispatchItem, useBulkDispatchItem } from '@/hooks/useOrders'
import { Loader2, CheckCircle2, UserCheck, Send } from 'lucide-react'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { ConfirmOrdersTable, AssignDeliveryTable, DispatchedOrdersTable } from './_components/OrderTables'

type Tab = 'confirm' | 'assign' | 'dispatch'

const TABS: { key: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'confirm', label: 'Confirm Orders', icon: <CheckCircle2 className="h-4 w-4" />, desc: 'New orders awaiting manager confirmation' },
    { key: 'assign', label: 'Assign Delivery', icon: <UserCheck className="h-4 w-4" />, desc: 'Confirmed orders awaiting delivery partner assignment' },
    { key: 'dispatch', label: 'Dispatched', icon: <Send className="h-4 w-4" />, desc: 'Orders handed to delivery partner' },
]

const FulfilmentPage = () => {
    const { user } = useAuth()
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: warehouse, isLoading: warehouseLoading } = useManagerWarehouse()
    const { data: orders, isLoading: ordersLoading } = useWarehouseOrders(warehouse?._id || '')
    const [activeTab, setActiveTab] = useState<Tab>('confirm')

    const dispatchMutation = useDispatchItem()
    const bulkDispatchMutation = useBulkDispatchItem()

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Manager Dashboard', href: '/manager' },
            { label: 'Order Fulfillment' }
        ])
    }, [setBreadcrumbs])

    const handleConfirm = async (orderId: string, variantId: string) => {
        if (!warehouse) return
        await dispatchMutation.mutateAsync({ orderId, variantId, warehouseId: warehouse._id })
    }

    const handleBulkConfirm = async (orderId: string) => {
        if (!warehouse) return
        await bulkDispatchMutation.mutateAsync({ orderId, warehouseId: warehouse._id })
    }

    const isLoading = warehouseLoading || ordersLoading

    const isMyItem = (item: any) =>
        item.warehouse === warehouse?._id ||
        (typeof item.warehouse === 'object' && (item.warehouse as any)?._id === warehouse?._id)

    // Tab 1: Orders with any item still 'pending' (not yet confirmed by manager)
    // Exclude items already in PENDING_REASSIGNMENT
    const confirmOrders = (orders || []).filter(order =>
        order.items.some((item: any) => isMyItem(item) && item.status?.toLowerCase() === 'pending')
    )

    // Tab 2: Orders where all warehouse items are confirmed (awaiting delivery assignment)
    const assignOrders = (orders || []).filter(order =>
        order.items.filter(isMyItem).length > 0 &&
        order.items.filter(isMyItem).every((item: any) =>
            ['confirmed', 'packed', 'shipped', 'cancelled', 'pending_reassignment'].includes(item.status?.toLowerCase() || '')
        ) &&
        order.items.some((item: any) => isMyItem(item) && (item.status?.toLowerCase() === 'confirmed' || item.status?.toLowerCase() === 'packed'))
    )

    // Tab 3: All warehouse items are shipped/delivered/cancelled or reassigned
    const dispatchedOrders = (orders || []).filter(order =>
        order.items.filter(isMyItem).length > 0 &&
        order.items.filter(isMyItem).every((item: any) =>
            ['shipped', 'delivered', 'cancelled', 'pending_reassignment'].includes(item.status?.toLowerCase() || '')
        )
    )

    const tabCounts: Record<Tab, number> = {
        confirm: confirmOrders.length,
        assign: assignOrders.length,
        dispatch: dispatchedOrders.length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Fulfillment</h1>
                    <p className="text-slate-500 font-bold mt-1">Managing <span className="text-slate-900">{warehouse?.name || '...'}</span></p>
                </div>
                {/* Quick stats */}
                <div className="flex flex-wrap gap-3">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2 text-center">
                        <p className="text-2xl font-black text-blue-600">{confirmOrders.length}</p>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">To Confirm</p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2 text-center">
                        <p className="text-2xl font-black text-indigo-600">{assignOrders.length}</p>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">To Assign</p>
                    </div>
                    <div className="bg-violet-50 border border-violet-100 rounded-2xl px-4 py-2 text-center">
                        <p className="text-2xl font-black text-violet-600">{dispatchedOrders.length}</p>
                        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Dispatched</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
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
                ) : (
                    <DispatchedOrdersTable
                        orders={dispatchedOrders}
                        warehouseId={warehouse?._id}
                        isMyItem={isMyItem}
                    />
                )}
            </div>
        </div>
    )
}

export default FulfilmentPage
