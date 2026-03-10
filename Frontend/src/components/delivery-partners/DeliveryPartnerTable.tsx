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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Shield, Trash2, MapPin, Bike, Phone, User, ExternalLink, ShieldAlert, ShieldCheck, Building2, Edit } from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeliveryPartnerTableProps {
    basePath?: string;
    warehouseId?: string;
}

const DeliveryPartnerTable = ({ basePath = "/admin/delivery-partners", warehouseId }: DeliveryPartnerTableProps) => {
    const [page, setPage] = useState(1)
    const { data, isLoading } = useDeliveryPartners({ page, warehouseId })
    const updateStatus = useUpdatePartnerStatus()
    const updatePartner = useUpdatePartner()
    const deletePartner = useDeletePartner()
    const { data: warehouses } = useWarehouses()

    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [assignWhPartner, setAssignWhPartner] = useState<any | null>(null)
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

    const openAssignWh = (partner: any) => {
        setAssignWhPartner(partner)
        setSelectedWhIds(partner.warehouseIds?.map((wh: any) => typeof wh === 'string' ? wh : wh._id) || [])
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-[28px] border border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14 pl-6">Partner</TableHead>
                            <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14">Vehicle</TableHead>
                            <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14">Warehouses</TableHead>
                            <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14">Status</TableHead>
                            <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] h-14 text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-bold">
                                    No delivery partners found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((partner) => (
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
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {partner.warehouseIds && partner.warehouseIds.length > 0 ? (
                                                partner.warehouseIds.map((wh: any, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-[10px] bg-indigo-50/50 border-indigo-100 text-indigo-600 font-bold py-0 h-5">
                                                        {typeof wh === 'object' ? wh.name : 'ID'}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unassigned</span>
                                            )}
                                        </div>
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
                            options={warehouses?.map((w: any) => ({ label: w.name, value: w._id })) || []}
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
