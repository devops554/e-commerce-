"use client"
import React, { useState } from 'react'
import {
    useDeliveryPartners,
    useUpdatePartnerStatus,
    useUpdatePartner,
    useDeletePartner
} from '@/hooks/useDeliveryPartners'
import { useWarehouses } from '@/hooks/useWarehouses'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { DeliveryPartner } from '@/services/delivery-partner.service'
import { Warehouse } from '@/services/warehouse.service'
import Link from 'next/link'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from 'sonner'
import { Badge } from "@/components/ui/badge"
import {
    Bike, Building2, Edit, ExternalLink, MoreHorizontal,
    Phone, ShieldAlert, ShieldCheck, Star, Trash2, User,
    Package, Zap, CheckCircle2
} from 'lucide-react'
import { Button } from '../ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface DeliveryPartnerTableProps {
    basePath?: string;
    warehouseId?: string;
}

const DeliveryPartnerTable = ({ basePath = "/admin/delivery-partners", warehouseId }: DeliveryPartnerTableProps) => {
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)

    const { data, isLoading } = useDeliveryPartners({
        page,
        warehouseId,
        search: debouncedSearch
    })

    // Reset to page 1 when search changes
    React.useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    const totalPages = data?.totalPages || 1
    const total = data?.total || 0

    const updateStatus = useUpdatePartnerStatus()
    const updatePartner = useUpdatePartner()
    const deletePartner = useDeletePartner()

    // Fix: useWarehouses returns { warehouses: [], total, ... } — not an array directly
    const { data: warehousesData } = useWarehouses()
    const warehouseList: Warehouse[] = (warehousesData as any)?.warehouses || (Array.isArray(warehousesData) ? warehousesData : [])

    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [assignWhPartner, setAssignWhPartner] = useState<DeliveryPartner | null>(null)
    const [selectedWhIds, setSelectedWhIds] = useState<string[]>([])

    const handleStatusUpdate = (id: string, accountStatus: string) => {
        updateStatus.mutate({ id, status: { accountStatus } }, {
            onSuccess: () => toast.success(`Status updated to ${accountStatus}`),
        })
    }

    const handleDelete = () => {
        if (!deleteId) return
        deletePartner.mutate(deleteId, {
            onSuccess: () => {
                toast.success('Partner removed')
                setDeleteId(null)
            }
        })
    }

    const handleAssignWarehouse = () => {
        if (!assignWhPartner) return
        updatePartner.mutate({
            id: assignWhPartner._id,
            data: { warehouseIds: selectedWhIds }
        }, {
            onSuccess: () => {
                toast.success('Warehouses assigned successfully')
                setAssignWhPartner(null)
            },
            onError: () => toast.error('Failed to assign warehouses')
        })
    }

    const openAssignWh = (partner: DeliveryPartner) => {
        setAssignWhPartner(partner)
        setSelectedWhIds(partner.warehouseIds?.map((wh) => typeof wh === 'string' ? wh : wh._id) || [])
    }

    const renderRatingStars = (rating: number) => {
        const r = Math.round(rating * 10) / 10
        return (
            <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-black text-slate-700">{r > 0 ? r.toFixed(1) : '—'}</span>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, phone or vehicle..."
                        className="pl-10 rounded-2xl border-slate-100 bg-white/50 backdrop-blur-sm h-11 focus:bg-white transition-all font-bold text-sm shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-[28px] border border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14 pl-6">Partner</TableHead>
                                <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14">Vehicle</TableHead>
                                <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14">Warehouses</TableHead>
                                <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14 text-center">
                                    <span className="flex items-center gap-1 justify-center"><Zap className="w-3 h-3 text-amber-500" />Active</span>
                                </TableHead>
                                <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14 text-center">
                                    <span className="flex items-center gap-1 justify-center"><Package className="w-3 h-3 text-blue-500" />Available</span>
                                </TableHead>
                                <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14 text-center">
                                    <span className="flex items-center gap-1 justify-center"><CheckCircle2 className="w-3 h-3 text-green-500" />Completed</span>
                                </TableHead>
                                <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14 text-center">
                                    <span className="flex items-center gap-1 justify-center">Earnings</span>
                                </TableHead>
                                <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14 text-center">
                                    <span className="flex items-center gap-1 justify-center"><Star className="w-3 h-3 text-amber-400" />Rating</span>
                                </TableHead>
                                <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14">Status</TableHead>
                                <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14 text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!data || data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-20 text-slate-400 font-bold">
                                        No delivery partners found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((partner) => (
                                    <TableRow key={partner._id} className="hover:bg-slate-50/50 transition-colors border-slate-100 group">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-none mb-1">{partner.name}</p>
                                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                                        <Phone className="w-3 h-3" />
                                                        {partner.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-bold rounded-lg px-2 py-0.5">
                                                    <Bike className="w-3.5 h-3.5 mr-1" />
                                                    {partner.vehicleType}
                                                </Badge>
                                                {partner.vehicleNumber && (
                                                    <span className="text-[10px] font-black text-slate-400 uppercase font-mono tracking-tighter">
                                                        {partner.vehicleNumber}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                                                {partner.warehouseIds && partner.warehouseIds.length > 0 ? (
                                                    partner.warehouseIds.map((wh, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-[10px] bg-indigo-50/50 border-indigo-100 text-indigo-600 font-bold py-0 h-5">
                                                            {typeof wh === 'object' ? wh.name : 'ID'}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unassigned</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        {/* Active Orders */}
                                        <TableCell className="text-center">
                                            <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-lg text-xs font-black ${(partner.activeOrders || 0) > 0
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {partner.activeOrders ?? 0}
                                            </span>
                                        </TableCell>
                                        {/* Available Orders */}
                                        <TableCell className="text-center">
                                            <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-lg text-xs font-black ${(partner.availableOrders || 0) > 0
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {partner.availableOrders ?? 0}
                                            </span>
                                        </TableCell>
                                        {/* Completed Orders */}
                                        <TableCell className="text-center">
                                            <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-lg text-xs font-black ${(partner.completedOrders || 0) > 0
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {partner.completedOrders ?? partner.totalDeliveries ?? 0}
                                            </span>
                                        </TableCell>
                                        {/* Total Earnings */}
                                        <TableCell className="text-center">
                                            <span className="font-black text-violet-700 bg-violet-50 px-2 py-1 rounded-lg text-xs">
                                                ₹{(partner.totalEarned || 0).toLocaleString()}
                                            </span>
                                        </TableCell>
                                        {/* Rating */}
                                        <TableCell className="text-center">
                                            {renderRatingStars(partner.rating || 0)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-md ${partner.accountStatus === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-rose-100 text-rose-700 border-rose-200'
                                                    }`}
                                                variant="outline"
                                            >
                                                {partner.accountStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
                                                        <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl w-48 p-1">
                                                    <DropdownMenuLabel className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 py-2">Management</DropdownMenuLabel>

                                                    <Link href={`${basePath}/edit/${partner._id}`}>
                                                        <DropdownMenuItem className="rounded-xl flex items-center gap-2 text-slate-600 focus:text-indigo-600 focus:bg-indigo-50 font-bold py-2.5 transition-colors cursor-pointer">
                                                            <Edit className="w-4 h-4" />
                                                            Edit Details
                                                        </DropdownMenuItem>
                                                    </Link>

                                                    <Link href={`${basePath}/${partner._id}`}>
                                                        <DropdownMenuItem className="rounded-xl flex items-center gap-2 text-slate-600 focus:text-blue-600 focus:bg-blue-50 font-bold py-2.5 transition-colors cursor-pointer">
                                                            <ExternalLink className="w-4 h-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                    </Link>

                                                    <DropdownMenuSeparator className="bg-slate-50" />

                                                    <DropdownMenuItem
                                                        onClick={() => openAssignWh(partner)}
                                                        className="rounded-xl flex items-center gap-2 text-slate-600 focus:text-indigo-600 focus:bg-indigo-50 font-bold py-2.5 transition-colors cursor-pointer"
                                                    >
                                                        <Building2 className="w-4 h-4" />
                                                        Assign Warehouse
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator className="bg-slate-50" />

                                                    {partner.accountStatus !== 'ACTIVE' ? (
                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusUpdate(partner._id, 'ACTIVE')}
                                                            className="rounded-xl flex items-center gap-2 text-green-600 focus:text-green-700 focus:bg-green-50 font-bold py-2.5 transition-colors cursor-pointer"
                                                        >
                                                            <ShieldCheck className="w-4 h-4" />
                                                            Activate Partner
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusUpdate(partner._id, 'BLOCKED')}
                                                            className="rounded-xl flex items-center gap-2 text-amber-600 focus:text-amber-700 focus:bg-amber-50 font-bold py-2.5 transition-colors cursor-pointer"
                                                        >
                                                            <ShieldAlert className="w-4 h-4" />
                                                            Block Partner
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator className="bg-slate-50" />

                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(partner._id)}
                                                        className="rounded-xl flex items-center gap-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50 font-bold py-2.5 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Remove Partner
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing {data?.data.length} of {total} partners
                        </p>
                        <Pagination className="mx-0 w-fit">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPage(p => Math.max(1, p - 1));
                                        }}
                                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={page === p}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setPage(p);
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }
                                    return null;
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPage(p => Math.min(totalPages, p + 1));
                                        }}
                                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="rounded-[32px] border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-900">Remove Partner?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-bold">
                            Are you sure you want to remove this delivery partner? This action will permanently delete their account and history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-2xl border-slate-200 font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="rounded-2xl bg-rose-600 hover:bg-rose-700 font-black"
                        >
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={!!assignWhPartner} onOpenChange={() => setAssignWhPartner(null)}>
                <DialogContent className="max-w-md rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Assign Warehouses</DialogTitle>
                        <DialogDescription className="font-bold">Select warehouses for {assignWhPartner?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <MultiSelect
                            options={warehouseList.map((w: Warehouse) => ({ label: w.name, value: w._id }))}
                            selected={selectedWhIds}
                            onChange={setSelectedWhIds}
                            placeholder="Select warehouses..."
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setAssignWhPartner(null)}
                            className="rounded-xl font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignWarehouse}
                            disabled={updatePartner.isPending}
                            className="rounded-xl bg-slate-900 hover:bg-black font-black"
                        >
                            {updatePartner.isPending ? 'Saving...' : 'Save Assignments'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default DeliveryPartnerTable
