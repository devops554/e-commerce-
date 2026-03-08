"use client"

import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import {
    Search, Plus, MoreHorizontal, Pencil, Trash2,
    MapPin, Phone, Mail, Building2, Package, CheckCircle2,
    AlertCircle, Hammer, Boxes
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { useWarehouses, useWarehouseActions, Warehouse } from '@/hooks/useWarehouses'
import { WarehouseDialog } from './WarehouseDialog'
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

export default function WarehouseList() {
    const router = useRouter()
    const { data: warehouses = [], isLoading } = useWarehouses()
    const { deleteWarehouse, setDefaultWarehouse } = useWarehouseActions()
    const [searchTerm, setSearchTerm] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const filteredWarehouses = warehouses.filter((wh: Warehouse) =>
        wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wh.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wh.address.city.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <CheckCircle2 className="w-3 h-3 mr-1" />
            case 'INACTIVE': return <AlertCircle className="w-3 h-3 mr-1" />
            case 'MAINTENANCE': return <Hammer className="w-3 h-3 mr-1" />
            default: return null
        }
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'INACTIVE': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'MAINTENANCE': return 'bg-blue-50 text-blue-600 border-blue-100'
            default: return 'bg-gray-50 text-gray-600 border-gray-100'
        }
    }

    const handleEdit = (wh: Warehouse) => {
        setEditingWarehouse(wh)
        setDialogOpen(true)
    }

    const handleAdd = () => {
        router.push('/admin/warehouses/add')
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Warehouses</h1>
                    <p className="text-gray-500 font-medium">Manage storage facilities and fulfillment centers</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search warehouse..."
                            className="pl-10 h-11 rounded-xl border-none shadow-sm ring-1 ring-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="h-11 rounded-xl bg-pink-600 hover:bg-pink-700 font-black text-white px-6 shadow-lg shadow-pink-100 gap-2"
                    >
                        <Plus className="w-5 h-5" /> Add New
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="font-bold text-gray-700 py-5 pl-8 w-[30%]">Warehouse Details</TableHead>
                            <TableHead className="font-bold text-gray-700">Manager & Contact</TableHead>
                            <TableHead className="font-bold text-gray-700">Capacity</TableHead>
                            <TableHead className="font-bold text-gray-700">Status</TableHead>
                            <TableHead className="font-bold text-gray-700 pr-8 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse border-slate-50">
                                    <TableCell className="pl-8 py-5">
                                        <div className="space-y-2">
                                            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                            <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                                        </div>
                                    </TableCell>
                                    <TableCell><div className="h-4 bg-slate-100 rounded w-1/2"></div></TableCell>
                                    <TableCell><div className="h-4 bg-slate-100 rounded w-1/3"></div></TableCell>
                                    <TableCell><div className="h-6 bg-slate-100 rounded-full w-20"></div></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            ))
                        ) : filteredWarehouses.length === 0 ? (
                            <TableRow className="border-none">
                                <TableCell colSpan={5} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="bg-slate-50 p-6 rounded-full ring-8 ring-slate-50/50">
                                            <Building2 className="h-10 w-10 text-slate-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-gray-900 font-black text-lg">No Warehouses Found</p>
                                            <p className="text-gray-400 max-w-[240px] mx-auto text-sm">Start by adding your first warehouse facility to manage inventory.</p>
                                        </div>
                                        <Button
                                            onClick={handleAdd}
                                            variant="outline"
                                            className="mt-2 rounded-xl font-bold border-slate-200"
                                        >
                                            Create Warehouse
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredWarehouses.map((wh: Warehouse) => (
                                <TableRow key={wh._id} className="hover:bg-slate-50/30 border-slate-50 transition-colors">
                                    <TableCell className="py-6 pl-8">
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 p-2 rounded-xl ring-4 ring-opacity-10 ${wh.isDefaultWarehouse ? 'bg-rose-50 ring-rose-50 text-rose-600' : 'bg-slate-50 ring-slate-50 text-slate-400'}`}>
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-black text-slate-900">{wh.name}</p>
                                                    {wh.isDefaultWarehouse && (
                                                        <Badge variant="secondary" className="bg-rose-100 text-rose-600 text-[9px] font-black uppercase tracking-tighter px-2 h-4 border-none">Primary</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-xs font-bold text-slate-400 gap-3">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase">{wh.code}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {wh.address.city}, {wh.address.state}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="text-sm font-bold text-slate-700">{wh.contact.contactPerson}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 text-[11px] font-medium text-slate-400 ml-5">
                                                <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {wh.contact.phone}</span>
                                                <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {wh.contact.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 w-32">
                                                <span>Utilized</span>
                                                <span className="text-slate-900">{Math.round((wh.capacity.usedCapacity / wh.capacity.totalCapacity) * 100)}%</span>
                                            </div>
                                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                                                <div
                                                    className={`h-full transition-all duration-500 ${(wh.capacity.usedCapacity / wh.capacity.totalCapacity) > 0.9 ? 'bg-rose-500' :
                                                        (wh.capacity.usedCapacity / wh.capacity.totalCapacity) > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${(wh.capacity.usedCapacity / wh.capacity.totalCapacity) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400">{wh.capacity.usedCapacity.toLocaleString()} / {wh.capacity.totalCapacity.toLocaleString()} Units</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-wider border transition-all ${getStatusStyle(wh.status)}`}>
                                            {getStatusIcon(wh.status)}
                                            {wh.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="pr-8 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 transition-colors">
                                                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-2xl border-slate-100 p-2 shadow-xl">
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/admin/warehouses/${wh._id}/inventory`)}
                                                    className="rounded-xl font-bold cursor-pointer focus:bg-indigo-50 focus:text-indigo-600 gap-2 p-2.5"
                                                >
                                                    <Boxes className="w-4 h-4" /> View Inventory
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleEdit(wh)}
                                                    className="rounded-xl font-bold cursor-pointer focus:bg-pink-50 focus:text-pink-600 gap-2 p-2.5"
                                                >
                                                    <Pencil className="w-4 h-4" /> Edit Warehouse
                                                </DropdownMenuItem>
                                                {!wh.isDefaultWarehouse && (
                                                    <DropdownMenuItem
                                                        onClick={() => setDefaultWarehouse(wh._id)}
                                                        className="rounded-xl font-bold cursor-pointer focus:bg-rose-50 focus:text-rose-600 gap-2 p-2.5"
                                                    >
                                                        <Package className="w-4 h-4" /> Set as Primary
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteId(wh._id)}
                                                    className="rounded-xl font-bold cursor-pointer text-rose-500 focus:bg-rose-50 focus:text-rose-600 gap-2 p-2.5"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete Facility
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

            <WarehouseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                warehouse={editingWarehouse}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="rounded-[32px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-900">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="font-medium text-slate-500">
                            This will permanently delete the warehouse facility. This action cannot be undone and may affect active inventory.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (deleteId) {
                                    await deleteWarehouse(deleteId)
                                    setDeleteId(null)
                                }
                            }}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 font-bold"
                        >
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
