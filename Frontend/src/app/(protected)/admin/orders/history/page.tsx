"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrders } from '@/hooks/useOrders'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { format } from 'date-fns'
import {
    Search as SearchIcon,
    ChevronRight,
    ShoppingCart,
    User,
    Package
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ReusablePagination } from '@/components/ReusablePagination'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
        case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
        case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100'
        case 'PACKED': return 'bg-amber-50 text-amber-600 border-amber-100'
        case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-100'
        default: return 'bg-slate-50 text-slate-600 border-slate-100'
    }
}

export default function AdminOrderHistoryPage() {
    const router = useRouter()
    const { setBreadcrumbs } = useBreadcrumb()

    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)
    const [page, setPage] = useState(1)
    const limit = 10

    const { data: response, isLoading } = useOrders({
        page,
        limit,
        search: debouncedSearch
    })

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Order History' }
        ])
    }, [setBreadcrumbs])

    const orders = response?.orders || []
    const totalPages = response?.totalPages || 0
    const total = response?.total || 0

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order History</h1>
                    <p className="text-slate-500 font-bold mt-1">Audit trail of all orders across all warehouses</p>
                </div>

                <div className="relative w-full md:w-80">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search Order ID, Name..."
                        className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-3xl" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-[40px] p-24 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-8">
                        <ShoppingCart className="h-12 w-12 text-slate-200" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">No History Found</h2>
                    <p className="text-slate-400 font-bold mt-3 max-w-sm leading-relaxed">
                        No order activities have been recorded in the system yet.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map((order: any) => (
                                    <tr
                                        key={order._id}
                                        onClick={() => router.push(`/admin/orders/history/${order._id}`)}
                                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-black text-slate-900">#{order.orderId}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                                                <span className="text-xs text-slate-400 font-medium">{format(new Date(order.createdAt), 'hh:mm a')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{order.user?.name}</span>
                                                    <span className="text-xs text-slate-400">{order.user?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Package className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm font-bold text-slate-600">{order.items?.length} items</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="outline" className={cn("text-[10px] uppercase font-black px-2 py-0.5 rounded-lg", getStatusColor(order.orderStatus))}>
                                                {order.orderStatus?.replace(/_/g, ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center ml-auto group-hover:bg-blue-50 transition-colors">
                                                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {totalPages > 1 && (
                <ReusablePagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={total}
                    itemsPerPage={limit}
                    onPageChange={setPage}
                    itemsLabel="orders"
                />
            )}
        </div>
    )
}
