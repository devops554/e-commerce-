"use client"

import React, { useEffect, useMemo } from 'react'
import { useAuth } from '@/providers/AuthContext'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { useWarehouseInventory } from '@/hooks/useInventory'
import {
    Package,
    Warehouse as WarehouseIcon,
    AlertTriangle,
    ArrowRightLeft,
    PlusCircle,
    MapPin,
    Phone,
    Mail
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

const ManagerOverview = () => {
    const { user } = useAuth()
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: warehouse, isLoading: isWarehouseLoading } = useManagerWarehouse()
    const { data: inventory, isLoading: isInventoryLoading } = useWarehouseInventory(warehouse?._id || '')

    useEffect(() => {
        setBreadcrumbs([{ label: 'Manager Dashboard' }])
    }, [setBreadcrumbs])

    const stats = useMemo(() => {
        if (!inventory) return { totalItems: 0, lowStockCount: 0 }
        const totalItems = inventory.length
        const lowStockCount = inventory.filter(item => item.quantity < 10).length
        return { totalItems, lowStockCount }
    }, [inventory])

    if (isWarehouseLoading || isInventoryLoading) {
        return <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
            </div>
        </div>
    }

    if (!warehouse) {
        return (
            <Card className="border-dashed border-2 bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-20">
                    <WarehouseIcon className="h-16 w-16 text-slate-300 mb-4" />
                    <CardTitle className="text-xl font-bold text-slate-700">No Warehouse Assigned</CardTitle>
                    <CardDescription className="text-center mt-2 max-w-sm">
                        You have not been assigned to any warehouse yet. Please contact the administrator.
                    </CardDescription>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Warehouse Details Card */}
                <Card className="lg:col-span-2 overflow-hidden border-none shadow-xl shadow-slate-200/50 group">
                    <div className="h-2 bg-slate-900" />
                    <CardHeader className="bg-white p-8">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                                        {warehouse.status}
                                    </span>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full">
                                        {warehouse.code}
                                    </span>
                                </div>
                                <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">{warehouse.name}</CardTitle>
                                <div className="flex items-center text-slate-500 gap-1.5 mt-2">
                                    <MapPin className="h-4 w-4" />
                                    <p className="text-sm font-medium">{warehouse.address.city}, {warehouse.address.state}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                <WarehouseIcon className="h-8 w-8" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="bg-slate-50/50 p-8 pt-0 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contact Information</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                        <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        {warehouse.contact.phone}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                        <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        {warehouse.contact.email}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Capacity Status</p>
                                <div className="bg-white p-4 rounded-xl border border-slate-100">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-500">Utilization</span>
                                        <span className="text-xs font-black text-slate-900">
                                            {Math.round((warehouse.capacity.usedCapacity / warehouse.capacity.totalCapacity) * 100)}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-slate-900 transition-all duration-1000"
                                            style={{ width: `${(warehouse.capacity.usedCapacity / warehouse.capacity.totalCapacity) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mt-2">
                                        {warehouse.capacity.usedCapacity} / {warehouse.capacity.totalCapacity} Units
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats & Actions */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-none shadow-xl shadow-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Inventory Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 text-blue-400" />
                                    <span className="text-sm font-bold">Total SKUs</span>
                                </div>
                                <span className="text-xl font-black">{stats.totalItems}</span>
                            </div>
                            <div className={`flex items-center justify-between p-4 rounded-xl ${stats.lowStockCount > 0 ? 'bg-rose-500/20 text-rose-100' : 'bg-white/10'}`}>
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className={`h-5 w-5 ${stats.lowStockCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
                                    <span className="text-sm font-bold">Low Stock Alerts</span>
                                </div>
                                <span className="text-xl font-black">{stats.lowStockCount}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Direct Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-3">
                            <Link href="/manager/inventory">
                                <Button className="w-full justify-start gap-3 h-12 rounded-xl bg-slate-900 hover:bg-black font-bold">
                                    <PlusCircle className="h-4 w-4" />
                                    Receive Stock
                                </Button>
                            </Link>
                            <Link href="/manager/inventory">
                                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl border-slate-200 hover:bg-slate-50 font-bold">
                                    <ArrowRightLeft className="h-4 w-4" />
                                    Internal Transfer
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Inventory Table (Summary) */}
            <Card className="border-none shadow-xl shadow-slate-200/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black">Stock Overview</CardTitle>
                        <CardDescription className="font-bold">Latest changes in your facility</CardDescription>
                    </div>
                    <Link href="/manager/inventory">
                        <Button variant="link" className="font-black text-slate-900 text-xs uppercase tracking-widest">
                            View Full Inventory
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Variant</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">In Stock</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Reserved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory?.slice(0, 5).map((item) => (
                                    <tr key={item._id} className="border-b border-slate-100 last:border-none hover:bg-white transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-sm">{item.product?.title || 'Unknown Product'}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{item.product?.brand}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-slate-600 font-mono">{item.variant?.sku}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-black ${item.quantity < 10 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-900'}`}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-slate-400">{item.reserved}</span>
                                        </td>
                                    </tr>
                                ))}
                                {(!inventory || inventory.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold text-sm">
                                            No inventory items found in this warehouse.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ManagerOverview
