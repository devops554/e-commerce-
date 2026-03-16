"use client"

import React from 'react'
import { useQuery } from '@tanstack/react-query'
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
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

export default function ManagerReturnsDashboard() {
    const [page, setPage] = React.useState(1)
    const [status, setStatus] = React.useState<string>("all")
    const [search, setSearch] = React.useState("")

    // In a real app, this would fetch from /return-requests
    // We'll use a placeholder for now to build the UI
    const { data, isLoading } = useQuery({
        queryKey: ['manager-returns', page, status, search],
        queryFn: async () => {
            // Mocking the API response
            return {
                data: [
                    {
                        _id: '1',
                        orderId: { orderId: 'ORD-12345' },
                        productId: { title: 'Smartphone Pro Max' },
                        variantId: { sku: 'SP-PM-128-BLK' },
                        customerId: { name: 'Rahul Sharma' },
                        status: 'PENDING',
                        reason: 'DAMAGED',
                        createdAt: new Date().toISOString(),
                    },
                    {
                        _id: '2',
                        orderId: { orderId: 'ORD-67890' },
                        productId: { title: 'Wireless Earbuds' },
                        variantId: { sku: 'WE-WHT' },
                        customerId: { name: 'Priya Patel' },
                        status: 'APPROVED',
                        reason: 'WRONG_ITEM',
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                    }
                ],
                totalPages: 1,
                total: 2
            }
        }
    })

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'PENDING': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending Review</Badge>
            case 'APPROVED': return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Approved</Badge>
            case 'RECEIVED_AT_WAREHOUSE': return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Received</Badge>
            case 'REFUND_COMPLETED': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Refunded</Badge>
            case 'REJECTED': return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>
            default: return <Badge variant="outline">{s}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <RotateCcw className="h-8 w-8 text-blue-600" />
                        Return Requests
                    </h1>
                    <p className="text-slate-500 font-medium">Manage customer returns and QC processing for your warehouse.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Pending" value="12" icon={<Clock className="text-amber-500" />} color="amber" />
                <StatCard title="In Transit" value="8" icon={<Truck className="text-blue-500" />} color="blue" />
                <StatCard title="Awaiting QC" value="5" icon={<Package className="text-purple-500" />} color="purple" />
                <StatCard title="Completed" value="145" icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" />
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
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="RECEIVED">Received</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
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
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.data.map((req: any) => (
                                        <TableRow key={req._id} className="hover:bg-slate-50/50 group border-slate-50">
                                            <TableCell className="pl-6 font-mono text-xs font-bold text-blue-600 text-center">{req.orderId.orderId}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 line-clamp-1">{req.productId.title}</span>
                                                    <span className="text-[10px] text-slate-500 font-mono">{req.variantId.sku}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-700">{req.customerId.name}</TableCell>
                                            <TableCell>{getStatusBadge(req.status)}</TableCell>
                                            <TableCell className="text-slate-500 text-xs">{format(new Date(req.createdAt), 'dd MMM yyyy')}</TableCell>
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
                </CardContent>
            </Card>
        </div>
    )
}

function StatCard({ title, value, icon, color }: any) {
    const colorClasses: any = {
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    }
    return (
        <Card className={`border-none shadow-sm rounded-3xl overflow-hidden p-6 ${colorClasses[color]}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">{title}</p>
                    <h3 className="text-3xl font-black">{value}</h3>
                </div>
                <div className="p-3 bg-white/50 rounded-2xl shadow-sm">
                    {React.cloneElement(icon, { className: 'h-5 w-5' })}
                </div>
            </div>
        </Card>
    )
}
