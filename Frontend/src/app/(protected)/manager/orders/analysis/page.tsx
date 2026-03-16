"use client"

import React, { useState, useEffect } from 'react'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { useOrderAnalytics } from '@/hooks/useOrders'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderChart } from '@/components/manager/OrderChart'
import { 
    TrendingUp, 
    ShoppingCart, 
    CheckCircle, 
    Clock, 
    Package, 
    Truck,
    IndianRupee,
    ArrowUpRight,
    Calendar
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

export default function OrderAnalysisPage() {
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: warehouse, isLoading: isWhLoading } = useManagerWarehouse()
    const [range, setRange] = useState('7d')
    const { data: stats, isLoading: isStatsLoading } = useOrderAnalytics(warehouse?._id || '', range)

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Manager Dashboard', href: '/manager' },
            { label: 'Orders', href: '/manager/orders' },
            { label: 'Analysis' }
        ])
    }, [setBreadcrumbs])

    if (isWhLoading || (isStatsLoading && !stats)) {
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
            title: "Total Orders",
            value: stats?.totalOrders || 0,
            icon: ShoppingCart,
            description: "All time filtered by range",
            color: "bg-blue-50 text-blue-600",
            trend: "+12%"
        },
        {
            title: "Completed",
            value: stats?.completedOrders || 0,
            icon: CheckCircle,
            description: "Successfully delivered",
            color: "bg-emerald-50 text-emerald-600",
            trend: "+8%"
        },
        {
            title: "Packed / Readiness",
            value: stats?.packedOrders || 0,
            icon: Package,
            description: "Waiting for dispatch",
            color: "bg-amber-50 text-amber-600"
        },
        {
            title: "Total Revenue",
            value: `₹${(stats?.totalEarnings || 0).toLocaleString()}`,
            icon: IndianRupee,
            description: "Gross delivered earnings",
            color: "bg-violet-50 text-violet-600"
        }
    ]

    // Mix and match chart data for demonstration of multiple chart types
    const statusDistribution = [
        { name: 'Pending', value: stats?.pendingOrders || 0 },
        { name: 'Assigned', value: stats?.assignedOrders || 0 },
        { name: 'Packed', value: stats?.packedOrders || 0 },
        { name: 'On Way', value: stats?.outForDeliveryOrders || 0 },
        { name: 'Delivered', value: stats?.completedOrders || 0 }
    ]

    const radarData = [
        { subject: 'Readiness', A: stats?.packedOrders || 0, fullMark: 100 },
        { subject: 'Speed', A: stats?.completedOrders || 0, fullMark: 100 },
        { subject: 'Success', A: stats?.completedOrders || 0, fullMark: 100 },
        { subject: 'Incoming', A: stats?.pendingOrders || 0, fullMark: 100 },
        { subject: 'Logistics', A: stats?.outForDeliveryOrders || 0, fullMark: 100 }
    ]

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Analytics</h1>
                    <p className="text-slate-500 font-bold mt-1">Warehouse Performance: <span className="text-slate-900">{warehouse?.name}</span></p>
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
                        title="Revenue Overview" 
                        description="Daily earnings from delivered orders"
                        type="area"
                        data={stats?.chartData || []}
                        categoryKey="date"
                        dataKey="earnings"
                        color="#8B5CF6"
                        height={350}
                    />
                </div>
                <div className="lg:col-span-1">
                    <OrderChart 
                        title="Order Status distribution" 
                        description="Breakdown of current order pipeline"
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
                    title="Order Volume" 
                    description="Daily count of incoming orders"
                    type="bar"
                    data={stats?.chartData || []}
                    categoryKey="date"
                    dataKey="orders"
                    color="#3B82F6"
                />
                <OrderChart 
                    title="Performance Radar" 
                    description="Operational efficiency metrics"
                    type="radar"
                    data={radarData}
                    categoryKey="subject"
                    dataKey="A"
                    color="#F59E0B"
                />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                <OrderChart 
                    title="Growth Trend" 
                    description="Cumulative order growth trajectory"
                    type="line"
                    data={stats?.chartData || []}
                    categoryKey="date"
                    dataKey="orders"
                    color="#10B981"
                />
            </div>
        </div>
    )
}
