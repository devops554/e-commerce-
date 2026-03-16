"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { useStockHistory } from '@/hooks/useInventory'
import {
    History,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/input'
import { Search as SearchIcon } from 'lucide-react'
import { ReusablePagination } from '@/components/ReusablePagination'
import { StockHistoryTable } from '@/components/inventory/StockHistoryTable'
import { useStockHistoryStats } from '@/hooks/useInventory'
import { ExcelExportButton } from '@/components/ExcelExportButton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

const StockHistoryPage = () => {
    const { id: productId } = useParams() as { id: string }
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: warehouse, isLoading: isWhLoading } = useManagerWarehouse()

    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)
    const [page, setPage] = useState(1)
    const limit = 10

    const { data: response, isLoading: isHistoryLoading } = useStockHistory(warehouse?._id || '', {
        page,
        limit,
        search: debouncedSearch,
        productId
    })

    const [range, setRange] = useState('1m')
    const { data: statsResponse, isLoading: isStatsLoading } = useStockHistoryStats(warehouse?._id || '', {
        range,
        productId
    })

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Manager Dashboard', href: '/manager' },
            { label: 'Stock History', href: '/manager/stock-history' },
            { label: 'Product Analytics' }
        ])
    }, [setBreadcrumbs])

    // Reset page when search changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    // Replaced getActionConfig with localized one inside StockHistoryTable

    if (isWhLoading) {
        return <div className="space-y-6">
            <Skeleton className="h-[100px] w-full rounded-2xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    }

    const history = response?.data || []
    const totalPages = response?.totalPages || 0
    const total = response?.total || 0

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock History</h1>
                    <p className="text-slate-500 font-bold mt-1">Audit trail for <span className="text-slate-900">{warehouse?.name}</span></p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search SKU or product..."
                            className="pl-10 h-10 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Export Button */}
                    <ExcelExportButton
                        data={history.map((h: any) => ({
                            Date: format(new Date(h.createdAt), 'MMM dd, yyyy hh:mm a'),
                            Product: h.product?.title || 'Unknown Product',
                            SKU: h.variant?.sku,
                            Type: h.type,
                            Change: h.amount,
                            Source: h.source || 'N/A',
                            Notes: h.notes || 'N/A',
                            User: h.user?.name || 'Manual Action'
                        }))}
                        filename={`Stock_History_${warehouse?.name}_${format(new Date(), 'yyyyMMdd')}`}
                        className="w-full md:w-auto h-10"
                    />
                </div>
            </div>

            {/* Analytics Stats Summary Section */}
            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden mb-8">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                    <div>
                        <CardTitle className="text-lg font-black text-slate-900">Aggregate Analytics</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">History of received, dispatched, and transferred units.</CardDescription>
                    </div>
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-[180px] rounded-xl border-slate-200 font-bold">
                            <SelectValue placeholder="Select Range" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="1d">Last 24 Hours</SelectItem>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="1m">Last 1 Month</SelectItem>
                            <SelectItem value="1y">Last 1 Year</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="pt-4">
                    {isStatsLoading ? (
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : statsResponse && statsResponse.length > 0 ? (
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statsResponse} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F1F5F9' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600, fontSize: '13px' }} />
                                    <Bar dataKey="received" name="Received" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="dispatched" name="Dispatched" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="transferred" name="Transferred" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[200px] w-full flex flex-col items-center justify-center text-slate-400">
                            <BarChart className="h-10 w-10 text-slate-200 mb-2" />
                            <p className="font-bold">No analytics data available for this range.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
                {isHistoryLoading ? (
                    Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-3xl" />
                    ))
                ) : history.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-24 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-8 animate-pulse">
                            <History className="h-12 w-12 text-slate-200" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">No History Found</h2>
                        <p className="text-slate-400 font-bold mt-3 max-w-sm leading-relaxed">
                            {searchTerm ? "Try searching for something else." : "Once stock movements occur in your warehouse, a detailed audit trail will appear here automatically."}
                        </p>
                    </div>
                ) : (
                    <>
                        <StockHistoryTable history={history} />

                        {totalPages > 1 && (
                    <ReusablePagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={total}
                        itemsPerPage={limit}
                        onPageChange={setPage}
                        itemsLabel="records"
                    />
                )}
            </>
                )}
        </div>
        </div>
    )
}

export default StockHistoryPage
