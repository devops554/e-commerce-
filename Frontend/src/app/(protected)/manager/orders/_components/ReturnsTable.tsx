"use client"

import React from 'react'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, MapPin, RotateCcw, CheckCircle2, XCircle, Clock, PackageCheck } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { ReturnRequest, ReturnRequestStatus } from '@/services/return.service'
import { EmptyState } from './OrderTables'

const RETURN_STATUS_COLOR: Record<string, string> = {
    [ReturnRequestStatus.PENDING]: "bg-yellow-100 text-yellow-800",
    [ReturnRequestStatus.APPROVED]: "bg-blue-100 text-blue-800",
    [ReturnRequestStatus.REJECTED]: "bg-red-100 text-red-800",
    [ReturnRequestStatus.PICKUP_SCHEDULED]: "bg-indigo-100 text-indigo-800",
    [ReturnRequestStatus.PICKED_UP]: "bg-purple-100 text-purple-800",
    [ReturnRequestStatus.RECEIVED_AT_WAREHOUSE]: "bg-amber-100 text-amber-800",
    [ReturnRequestStatus.QC_PASSED]: "bg-green-100 text-green-800",
    [ReturnRequestStatus.QC_FAILED]: "bg-rose-100 text-rose-800",
    [ReturnRequestStatus.REFUND_INITIATED]: "bg-emerald-100 text-emerald-800",
    [ReturnRequestStatus.REFUND_COMPLETED]: "bg-emerald-600 text-white",
    [ReturnRequestStatus.CLOSED]: "bg-slate-100 text-slate-600",
}

interface ReturnsTableProps {
    returns: ReturnRequest[]
    isLoading?: boolean
}

export function ReturnsTable({ returns, isLoading }: ReturnsTableProps) {
    const router = useRouter()

    if (returns.length === 0 && !isLoading) return <EmptyState label="No Returns Found" />

    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-bold text-slate-600 w-[130px]">Return ID</TableHead>
                    <TableHead className="font-bold text-slate-600">Customer</TableHead>
                    <TableHead className="font-bold text-slate-600">Product</TableHead>
                    <TableHead className="font-bold text-slate-600">Status</TableHead>
                    <TableHead className="font-bold text-slate-600">QC Grade</TableHead>
                    <TableHead className="font-bold text-slate-600">Last Update</TableHead>
                    <TableHead className="font-bold text-slate-600 text-right pr-6">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {returns.map((req) => (
                    <TableRow key={req._id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                            <p className="font-black text-slate-900 text-xs font-mono">{req.returnId || req._id.slice(-8).toUpperCase()}</p>
                            <Badge variant="outline" className="text-[9px] mt-1 bg-slate-50">REVERSE</Badge>
                        </TableCell>
                        <TableCell>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{req.customerId?.name}</p>
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                                    <MapPin className="h-3 w-3 shrink-0" />
                                    {req.customerId?.phone}
                                </p>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                {req.productId?.images?.[0]?.url && (
                                    <img 
                                        src={req.productId.images[0].url} 
                                        alt="" 
                                        className="h-10 w-10 rounded-lg object-cover bg-slate-100"
                                    />
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">{req.productId?.title}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        {req.variantId?.attributes?.map(a => `${a.name}: ${a.value}`).join(', ')}
                                    </p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${RETURN_STATUS_COLOR[req.status] ?? 'bg-slate-100 font-bold'}`}>
                                {req.status.replace(/_/g, ' ')}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {req.warehouseQcGrade ? (
                                <Badge className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                                    req.warehouseQcGrade === 'RESELLABLE' ? 'bg-green-50 text-green-700 border-green-200' : 
                                    req.warehouseQcGrade === 'REFURBISH' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                    <PackageCheck className="h-3 w-3 mr-1" />
                                    {req.warehouseQcGrade}
                                </Badge>
                            ) : (
                                <span className="text-[10px] text-slate-400 font-bold">Pending QC</span>
                            )}
                        </TableCell>
                        <TableCell>
                            <p className="text-xs text-slate-500 font-medium">
                                {format(new Date(req.updatedAt), 'MMM dd, yyyy')}
                            </p>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                            <Button
                                variant="outline" size="icon"
                                className="rounded-xl h-8 w-8 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                                onClick={() => router.push(`/manager/returns/${req._id}`)}
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
