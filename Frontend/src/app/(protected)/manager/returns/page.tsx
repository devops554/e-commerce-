"use client"

import React from 'react'
import { useReturns, useManagerStats } from '@/hooks/useReturns'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
    Loader2,
    MapPin,
    Phone,
    ChevronLeft,
    ChevronRight,
    Warehouse,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { Calendar as CalendarIcon } from 'lucide-react'

interface ReturnStats {
    pending: number
    inTransit: number
    awaitingQC: number
    completed: number
    total: number
}

export default function ManagerReturnsDashboard() {
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: warehouse, isLoading: warehouseLoading } = useManagerWarehouse()

    const [page, setPage] = React.useState(1)
    const [status, setStatus] = React.useState<string>("all")
    const [search, setSearch] = React.useState("")
    const [date, setDate] = React.useState<DateRange | undefined>()


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
        warehouseId: warehouse?._id,
        startDate: date?.from?.toISOString(),
        endDate: date?.to?.toISOString(),
    }, 'manager')

    const { data: statsData, isLoading: statsLoading } = useManagerStats()

    const stats: ReturnStats = React.useMemo(() => {
        let pending = 0, inTransit = 0, awaitingQC = 0, completed = 0, total = 0
        if (statsData && Array.isArray(statsData)) {
            statsData.forEach((stat: any) => {
                total += stat.count
                if (stat._id === 'PENDING') pending += stat.count
                else if (['APPROVED', 'PICKUP_SCHEDULED', 'PICKED_UP'].includes(stat._id)) inTransit += stat.count
                else if (stat._id === 'RECEIVED_AT_WAREHOUSE') awaitingQC += stat.count
                else if (['REFUND_COMPLETED', 'CLOSED'].includes(stat._id)) completed += stat.count
            })
        }
        return { pending, inTransit, awaitingQC, completed, total }
    }, [statsData])

    const isLoading = warehouseLoading || returnsLoading || statsLoading

    const getStatusBadge = (s: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            PENDING: { label: 'Pending Review', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
            APPROVED: { label: 'Approved', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
            PICKUP_SCHEDULED: { label: 'Pickup Scheduled', cls: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
            PICKED_UP: { label: 'Picked Up', cls: 'bg-cyan-50 text-cyan-700 border border-cyan-200' },
            RECEIVED_AT_WAREHOUSE: { label: 'Awaiting QC', cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
            QC_PASSED: { label: 'QC Passed', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
            REFUND_INITIATED: { label: 'Refund Initiated', cls: 'bg-orange-50 text-orange-700 border border-orange-200' },
            REFUND_COMPLETED: { label: 'Refunded', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
            REJECTED: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border border-red-200' },
        }
        const m = map[s]
        return m
            ? <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${m.cls}`}>{m.label}</span>
            : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">{s}</span>
    }

    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-sm text-slate-400 font-medium">Loading returns…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-1">

            {/* ── Page Header ──────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                            <RotateCcw className="h-5 w-5 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Return Requests</h1>
                    </div>
                    <div className="flex items-center gap-1.5 ml-1 mt-1">
                        <Warehouse className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-sm text-slate-500 font-medium">
                            {warehouse?.name || '—'}
                        </p>
                        {stats.total > 0 && (
                            <span className="ml-1 text-xs text-slate-400">· {stats.total} total</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ───────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Pending" value={stats.pending} icon={<Clock />} color="amber" total={stats.total} subtitle="Awaiting approval" />
                <StatCard title="In Transit" value={stats.inTransit} icon={<Truck />} color="blue" total={stats.total} subtitle="Pickup in progress" />
                <StatCard title="Awaiting QC" value={stats.awaitingQC} icon={<Package />} color="purple" total={stats.total} subtitle="Ready for inspection" />
                <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 />} color="emerald" total={stats.total} subtitle="Refund processed" />
            </div>

            {/* ── Main Table Card ──────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                {/* Filters */}
                <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by Order ID, product or customer…"
                            className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-100 text-sm focus-visible:ring-blue-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400 shrink-0" />

                        {/* Date Picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[260px] h-10 rounded-xl justify-start text-left font-normal bg-slate-50 border-slate-100",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y")} -{" "}
                                                {format(date.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl border-slate-100 shadow-xl" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                                {date && (
                                    <div className="p-3 border-t border-slate-50 flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDate(undefined)}
                                            className="text-[11px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            Reset Dates
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-slate-50 border-slate-100 text-sm">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
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

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-50 bg-slate-50/60">
                                <TableHead className="pl-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-[130px]">Order ID</TableHead>
                                <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Product</TableHead>
                                <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer</TableHead>
                                <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason</TableHead>
                                <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</TableHead>
                                <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</TableHead>
                                <TableHead className="pr-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i} className="border-slate-50">
                                        <TableCell className="pl-6"><Skeleton className="h-4 w-28 rounded-lg" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-44 rounded-lg" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32 rounded-lg" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20 rounded-lg" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20 rounded-lg" /></TableCell>
                                        <TableCell className="pr-6 text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : data?.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-56 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <RotateCcw className="h-7 w-7 text-slate-300" />
                                            </div>
                                            <p className="text-slate-400 font-medium text-sm">No return requests found</p>
                                            {search && (
                                                <Button variant="link" onClick={() => setSearch("")} className="text-blue-500 text-sm h-auto p-0">
                                                    Clear search
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data.map((req: any) => {
                                    const addr = req.orderId?.shippingAddress
                                    const addressLine = [addr?.street, addr?.city, addr?.state]
                                        .filter(Boolean).join(', ')

                                    return (
                                        <TableRow
                                            key={req._id}
                                            className="hover:bg-slate-50/70 border-slate-50 group transition-colors"
                                        >
                                            {/* Order ID */}
                                            <TableCell className="pl-6">
                                                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                                    {req.orderId?.orderId
                                                        ? `#${String(req.orderId.orderId).slice(-8)}`
                                                        : 'N/A'}
                                                </span>
                                            </TableCell>

                                            {/* Product */}
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    {req.productId?.thumbnail?.url && (
                                                        <img
                                                            src={req.productId.thumbnail.url}
                                                            alt={req.productId?.title}
                                                            className="w-9 h-9 rounded-lg object-cover border border-slate-100 shrink-0"
                                                        />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800 text-sm leading-tight line-clamp-1">
                                                            {req.productId?.title || 'Unknown Product'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                            Qty: {req.quantity ?? 1}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Customer */}
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-slate-800 text-sm leading-tight">
                                                        {addr?.fullName || 'Unknown'}
                                                    </p>
                                                    {addr?.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3 text-slate-400" />
                                                            <span className="text-[11px] text-slate-400 font-mono">{addr.phone}</span>
                                                        </div>
                                                    )}
                                                    {addressLine && (
                                                        <div className="flex items-start gap-1">
                                                            <MapPin className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                                                            <span className="text-[11px] text-slate-400 leading-snug line-clamp-1">{addressLine}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Reason */}
                                            <TableCell>
                                                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg capitalize">
                                                    {req.reason?.replace('_', ' ').toLowerCase() || '—'}
                                                </span>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>{getStatusBadge(req.status)}</TableCell>

                                            {/* Date */}
                                            <TableCell>
                                                <span className="text-xs text-slate-500 font-medium">
                                                    {req.createdAt
                                                        ? format(new Date(req.createdAt), 'dd MMM yyyy')
                                                        : 'N/A'}
                                                </span>
                                            </TableCell>

                                            {/* Action */}
                                            <TableCell className="pr-6 text-right">
                                                <Link href={`/manager/returns/${req._id}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50">
                        <p className="text-xs text-slate-400 font-medium">
                            Showing {((page - 1) * data.limit) + 1}–{Math.min(page * data.limit, data.total)} of {data.total}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg border-slate-200"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-slate-500 font-semibold px-2">
                                {page} / {data.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg border-slate-200"
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= data.totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
    title: string
    value: number
    icon: React.ReactElement
    color: string
    total?: number
    subtitle?: string
}

function StatCard({ title, value, icon, color, total, subtitle }: StatCardProps) {
    const cfg: Record<string, { bg: string; icon: string; bar: string; text: string }> = {
        amber: { bg: 'bg-amber-50  border-amber-100', icon: 'bg-amber-100  text-amber-600', bar: 'bg-amber-400', text: 'text-amber-700' },
        blue: { bg: 'bg-blue-50   border-blue-100', icon: 'bg-blue-100   text-blue-600', bar: 'bg-blue-400', text: 'text-blue-700' },
        purple: { bg: 'bg-purple-50 border-purple-100', icon: 'bg-purple-100 text-purple-600', bar: 'bg-purple-400', text: 'text-purple-700' },
        emerald: { bg: 'bg-emerald-50 border-emerald-100', icon: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-400', text: 'text-emerald-700' },
    }
    const c = cfg[color]
    const pct = total && total > 0 ? Math.round((value / total) * 100) : 0

    return (
        <div className={`rounded-2xl border p-5 ${c.bg} flex flex-col gap-3`}>
            <div className="flex items-start justify-between">
                <p className={`text-[10px] font-black uppercase tracking-widest ${c.text} opacity-70`}>{title}</p>
                <div className={`p-2 rounded-xl ${c.icon}`}>
                    {React.cloneElement(icon, { className: 'h-4 w-4' } as any)}
                </div>
            </div>
            <div>
                <p className={`text-3xl font-black ${c.text}`}>{value}</p>
                {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
            </div>
            {total && total > 0 && (
                <div className="space-y-1">
                    <div className="h-1.5 w-full bg-white/70 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${c.bar} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className={`text-[10px] font-bold ${c.text} opacity-60`}>{pct}% of total</p>
                </div>
            )}
        </div>
    )
}