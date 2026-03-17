"use client"

import React from 'react'
import { useReturns } from '@/hooks/useReturns'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Search,
    Filter,
    RotateCcw,
    Eye,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

// Types for return request stats
interface ReturnStats {
    pending: number;
    inTransit: number;
    awaitingQC: number;
    completed: number;
    total: number;
}

export default function ManagerReturnsDashboard() {
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: warehouse, isLoading: warehouseLoading } = useManagerWarehouse()

    const [page, setPage] = React.useState(1)
    const [status, setStatus] = React.useState<string>("all")
    const [search, setSearch] = React.useState("")

    React.useEffect(() => {
        setBreadcrumbs([
            { label: 'Manager Dashboard', href: '/manager' },
            { label: 'Return Requests' }
        ])
    }, [setBreadcrumbs])

    const { data, isLoading: returnsLoading } = useReturns({
        page,
        status: status === "all" ? undefined : status,
        search: search || undefined,
        warehouseId: warehouse?._id
    })

    // Calculate real stats from the data
    const stats: ReturnStats = React.useMemo(() => {
        if (!data?.data) {
            return {
                pending: 0,
                inTransit: 0,
                awaitingQC: 0,
                completed: 0,
                total: 0
            }
        }

        const returns = data.data
        return {
            pending: returns.filter((r: any) => r.status === 'PENDING').length,
            inTransit: returns.filter((r: any) =>
                ['APPROVED', 'PICKUP_SCHEDULED', 'PICKED_UP'].includes(r.status)
            ).length,
            awaitingQC: returns.filter((r: any) =>
                r.status === 'RECEIVED_AT_WAREHOUSE'
            ).length,
            completed: returns.filter((r: any) =>
                ['REFUND_COMPLETED', 'CLOSED'].includes(r.status)
            ).length,
            total: data.total || 0
        }
    }, [data])

    const isLoading = warehouseLoading || returnsLoading

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'PENDING': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending Review</Badge>
            case 'APPROVED': return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Approved</Badge>
            case 'PICKUP_SCHEDULED': return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Pickup Scheduled</Badge>
            case 'PICKED_UP': return <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">Picked Up</Badge>
            case 'RECEIVED_AT_WAREHOUSE': return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Awaiting QC</Badge>
            case 'QC_PASSED': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">QC Passed</Badge>
            case 'REFUND_INITIATED': return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Refund Initiated</Badge>
            case 'REFUND_COMPLETED': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Refunded</Badge>
            case 'REJECTED': return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>
            default: return <Badge variant="outline">{s}</Badge>
        }
    }

    // Loading state for stats
    if (isLoading && !data) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <RotateCcw className="h-8 w-8 text-blue-600" />
                        Return Requests
                    </h1>
                    <p className="text-slate-500 font-bold mt-1">
                        Managing <span className="text-slate-900">{warehouse?.name || '...'}</span>
                        {data && (
                            <span className="ml-2 text-xs font-normal text-slate-400">
                                • {stats.total} total requests
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Quick Stats with Real Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Pending Review"
                    value={stats.pending}
                    icon={<Clock className="text-amber-500" />}
                    color="amber"
                    total={stats.total}
                    subtitle="Awaiting approval"
                />
                <StatCard
                    title="In Transit"
                    value={stats.inTransit}
                    icon={<Truck className="text-blue-500" />}
                    color="blue"
                    total={stats.total}
                    subtitle="Pickup in progress"
                />
                <StatCard
                    title="Awaiting QC"
                    value={stats.awaitingQC}
                    icon={<Package className="text-purple-500" />}
                    color="purple"
                    total={stats.total}
                    subtitle="Ready for inspection"
                />
                <StatCard
                    title="Completed"
                    value={stats.completed}
                    icon={<CheckCircle2 className="text-emerald-500" />}
                    color="emerald"
                    total={stats.total}
                    subtitle="Refund processed"
                />
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-50 p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by Order ID, Product, or Customer..."
                                className="pl-10 rounded-2xl bg-slate-50 border-none h-11 focus-visible:ring-blue-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter className="h-4 w-4 text-slate-400" />
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[180px] rounded-2xl bg-slate-50 border-none h-11">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    <SelectItem value="all">All Status ({stats.total})</SelectItem>
                                    <SelectItem value="PENDING">Pending ({stats.pending})</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="PICKUP_SCHEDULED">Pickup Scheduled</SelectItem>
                                    <SelectItem value="RECEIVED_AT_WAREHOUSE">Awaiting QC ({stats.awaitingQC})</SelectItem>
                                    <SelectItem value="REFUND_COMPLETED">Completed ({stats.completed})</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="font-bold text-slate-500 py-4 pl-6 uppercase text-[10px] tracking-widest text-center">Order ID</TableHead>
                                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Product & Variant</TableHead>
                                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Customer</TableHead>
                                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Status</TableHead>
                                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Date</TableHead>
                                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest text-right pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="pl-6"><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell className="pr-6 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : data?.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="p-4 rounded-full bg-slate-50">
                                                    <RotateCcw className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 font-medium">No return requests found</p>
                                                {search && (
                                                    <Button
                                                        variant="link"
                                                        onClick={() => setSearch("")}
                                                        className="text-blue-600"
                                                    >
                                                        Clear search
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.data.map((req: any) => (
                                        <TableRow key={req._id} className="hover:bg-slate-50/50 group border-slate-50">
                                            <TableCell className="pl-6 font-mono text-xs font-bold text-blue-600 text-center">{req.orderId?.orderId || 'N/A'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 line-clamp-1">{req.productId?.title || 'Unknown Product'}</span>
                                                    <span className="text-[10px] text-slate-500 font-mono">{req.variantId?.sku || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-700">{req.customerId?.name || 'Unknown Customer'}</TableCell>
                                            <TableCell>{getStatusBadge(req.status)}</TableCell>
                                            <TableCell className="text-slate-500 text-xs">
                                                {req.createdAt ? format(new Date(req.createdAt), 'dd MMM yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <Link href={`/manager/returns/${req._id}`}>
                                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white hover:shadow-md transition-all">
                                                        <Eye className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-between p-6 border-t border-slate-50">
                            <p className="text-sm text-slate-500">
                                Showing {((page - 1) * data.limit) + 1} to {Math.min(page * data.limit, data.total)} of {data.total} results
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-xl"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= data.totalPages}
                                    className="rounded-xl"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactElement<{ className?: string }>;
    color: string;
    total?: number;
    subtitle?: string;
}

function StatCard({ title, value, icon, color, total, subtitle }: StatCardProps) {
    const colorClasses: Record<string, string> = {
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    }

    const percentage = total ? Math.round((value / total) * 100) : 0

    return (
        <Card className={`border-none shadow-sm rounded-3xl overflow-hidden p-6 ${colorClasses[color]}`}>
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">{title}</p>
                        <h3 className="text-3xl font-black">{value}</h3>
                    </div>

                    {/* Subtitle and percentage */}
                    {(subtitle || total) && (
                        <div className="space-y-1">
                            {subtitle && (
                                <p className="text-xs font-medium opacity-60">{subtitle}</p>
                            )}
                            {total && total > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-1.5 bg-white/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-current opacity-80 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold opacity-70">{percentage}%</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-3 bg-white/50 rounded-2xl shadow-sm">
                    {React.cloneElement(icon, { className: 'h-5 w-5' })}
                </div>
            </div>
        </Card>
    )
}