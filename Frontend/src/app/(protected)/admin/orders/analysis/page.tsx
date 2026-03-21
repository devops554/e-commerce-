"use client"

import React, { useState, useEffect } from 'react'
import { useGlobalOrderAnalytics } from '@/hooks/useOrders'
import { useGlobalReturnAnalytics } from '@/hooks/useReturns'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderChart } from '@/components/manager/OrderChart'
import {
    ShoppingCart,
    CheckCircle,
    Package,
    Truck,
    IndianRupee,
    ArrowUpRight,
    Calendar,
    AlertCircle,
    XCircle,
    RotateCcw,
    Clock
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const StatCard = ({ title, value, icon: Icon, description, trend, color }: any) => (
    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", color)}>
                    <Icon className="h-6 w-6" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black">
                        <ArrowUpRight className="h-3 w-3" />
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-slate-500 font-bold text-sm tracking-tight">{title}</h3>
                <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
                {description && <p className="text-xs text-slate-400 font-medium mt-2">{description}</p>}
            </div>
        </CardContent>
    </Card>
)

export default function AdminOrderAnalysisPage() {
    const { setBreadcrumbs } = useBreadcrumb()
    const [range, setRange] = useState('7d')
    const { data: stats, isLoading } = useGlobalOrderAnalytics(range)
    const { data: returnStats, isLoading: isReturnsLoading } = useGlobalReturnAnalytics(range)

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Order Analysis' }
        ])
    }, [setBreadcrumbs])

    if ((isLoading && !stats) || (isReturnsLoading && !returnStats)) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-3xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[400px] w-full rounded-3xl" />
                    <Skeleton className="h-[400px] w-full rounded-3xl" />
                </div>
            </div>
        )
    }

    const summaryData = [
        {
            title: "Global Orders",
            value: stats?.totalOrders || 0,
            icon: ShoppingCart,
            description: "Total across all warehouses",
            color: "bg-blue-50 text-blue-600",
            trend: "+15%"
        },
        {
            title: "Total Revenue",
            value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
            icon: IndianRupee,
            description: "Delivered gross sales",
            color: "bg-violet-50 text-violet-600",
            trend: "+12%"
        },
        {
            title: "Fulfillment Rate",
            value: `${stats?.totalOrders ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%`,
            icon: CheckCircle,
            description: "Successful delivery ratio",
            color: "bg-emerald-50 text-emerald-600"
        },
        {
            title: "Active Pipeline",
            value: (stats?.pendingOrders || 0) + (stats?.confirmedOrders || 0) + (stats?.packedOrders || 0),
            icon: Package,
            description: "Orders in process",
            color: "bg-amber-50 text-amber-600"
        }
    ]

    const statusDistribution = [
        { name: 'Pending', value: stats?.pendingOrders || 0 },
        { name: 'Confirmed', value: stats?.confirmedOrders || 0 },
        { name: 'Packed', value: stats?.packedOrders || 0 },
        { name: 'On Way', value: stats?.outForDeliveryOrders || 0 },
        { name: 'Delivered', value: stats?.completedOrders || 0 },
        { name: 'Cancelled', value: stats?.cancelledOrders || 0 }
    ]

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System-wide Intelligence</h1>
                    <p className="text-slate-500 font-bold mt-1">Global performance metrics and sales synchronization</p>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-[180px] rounded-xl border-slate-200 font-bold">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Select Range" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="1m">Last 1 Month</SelectItem>
                            <SelectItem value="1y">Last 1 Year</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryData.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <OrderChart
                        title="Revenue Trajectory"
                        description="Global earnings from completed transactions"
                        type="area"
                        data={stats?.chartData || []}
                        categoryKey="date"
                        dataKey="revenue"
                        color="#8B5CF6"
                        height={350}
                    />
                </div>
                <div className="lg:col-span-1">
                    <OrderChart
                        title="Pipeline Distribution"
                        description="Global order status breakdown"
                        type="pie"
                        data={statusDistribution}
                        categoryKey="name"
                        dataKey="value"
                        height={350}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OrderChart
                    title="Volume Trends"
                    description="Daily system-wide order intake"
                    type="bar"
                    data={stats?.chartData || []}
                    categoryKey="date"
                    dataKey="orders"
                    color="#3B82F6"
                />

                <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-8">
                        <h3 className="text-lg font-black text-slate-900 mb-6">Operational Snapshots</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-slate-50">
                                        <AlertCircle className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <span className="font-bold text-slate-700">Delayed Shipments</span>
                                </div>
                                <span className="font-black text-rose-600">0</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-slate-50">
                                        <XCircle className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <span className="font-bold text-slate-700">Failed Payments</span>
                                </div>
                                <span className="font-black text-slate-900">0</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-slate-50">
                                        <Truck className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <span className="font-bold text-slate-700">In-Transit Assets</span>
                                </div>
                                <span className="font-black text-blue-600">{stats?.outForDeliveryOrders || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Return Analytics Section */}
            <div className="pt-10 mt-10 border-t border-slate-100">
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <RotateCcw className="h-6 w-6 text-rose-500" />
                        Reverse Logistics Insights
                    </h2>
                    <p className="text-slate-500 font-bold mt-1">System-wide product returns and refund metrics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title="Total Returns"
                        value={returnStats?.totalReturns || 0}
                        icon={RotateCcw}
                        color="bg-rose-50 text-rose-600"
                    />
                    <StatCard
                        title="Pending Returns"
                        value={returnStats?.pendingReturns || 0}
                        icon={Clock}
                        color="bg-amber-50 text-amber-600"
                    />
                    <StatCard
                        title="Completed Returns"
                        value={returnStats?.completedReturns || 0}
                        icon={CheckCircle}
                        color="bg-emerald-50 text-emerald-600"
                    />
                    <StatCard
                        title="Total Refunded"
                        value={`₹${(returnStats?.totalRefundedAmount || 0).toLocaleString()}`}
                        icon={IndianRupee}
                        color="bg-violet-50 text-violet-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <OrderChart
                        title="Return Volume"
                        description="Daily system-wide return requests"
                        type="bar"
                        data={returnStats?.chartData || []}
                        categoryKey="date"
                        dataKey="returns"
                        color="#F43F5E"
                    />
                    <OrderChart
                        title="Refunded Amount Trajectory"
                        description="Daily value of processed refunds"
                        type="area"
                        data={returnStats?.chartData || []}
                        categoryKey="date"
                        dataKey="refunded"
                        color="#8B5CF6"
                    />
                </div>
            </div>
        </div>
    )
}
