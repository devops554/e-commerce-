"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Search, Edit2, Trash2, MoreHorizontal, LayoutGrid, List, User } from 'lucide-react'
import { useProductTypes, useProductTypeActions } from '@/hooks/useProductTypes'
import ProductTypeForm from '@/components/admin/ProductTypeForm'
import { ProductType } from '@/services/productType.service'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { ProductTypeScroller } from '@/components/product-type/ProductTypeScroller'

import { useBreadcrumb } from '@/providers/BreadcrumbContext'

import { useDebounce } from '@/hooks/useDebounce'
import { MdSystemUpdateAlt } from 'react-icons/md'
import { useRouter } from 'next/navigation'

export default function ProductTypePage() {
    const { setBreadcrumbs } = useBreadcrumb()
    const router = useRouter()

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Products', href: '/admin/product' },
            { label: 'Product Types' }
        ])
    }, [setBreadcrumbs])

    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 500)
    const [page, setPage] = useState(1)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingType, setEditingType] = useState<ProductType | null>(null)

    useEffect(() => {
        // Reset page to 1 when debounced search term changes
        setPage(1)
    }, [debouncedSearch])

    const { data, isLoading } = useProductTypes({ page, limit: 10, search: debouncedSearch })
    const { createProductType, updateProductType, deleteProductType, isCreating, isUpdating, isDeleting } = useProductTypeActions()

    const handleCreate = async (formData: any) => {
        await createProductType(formData)
        setIsCreateOpen(false)
    }

    const handleUpdate = async (formData: any) => {
        if (!editingType) return
        const { createdBy, updatedBy, ...updateData } = formData
        await updateProductType({ id: editingType._id, data: updateData })
        setEditingType(null)
    }

    const handleDelete = async (id: string) => {
        await deleteProductType(id)
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                <ProductTypeScroller />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Product Types</h1>
                    <p className="text-slate-500 mt-1 text-sm">Manage high-level product classifications for your store.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 shadow-md shadow-blue-100 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> Add Product Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Product Type</DialogTitle>
                        </DialogHeader>
                        <ProductTypeForm onSubmit={handleCreate} isLoading={isCreating} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50 p-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search product types..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 rounded-xl"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-none">
                                <TableHead className="py-4 pl-6 font-bold text-slate-700 uppercase text-[10px] tracking-widest">Image</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest">Name</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest">Slug</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest">Status</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest">Display Order</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest">Created By</TableHead>
                                <TableHead className="py-4 pr-6 text-right font-bold text-slate-700 uppercase text-[10px] tracking-widest">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600/20 border-t-blue-600" />
                                            <span className="text-sm text-slate-500 font-medium">Loading types...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : data?.productTypes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-slate-50 rounded-2xl">
                                                <LayoutGrid className="h-6 w-6 text-slate-300" />
                                            </div>
                                            <span className="text-sm text-slate-500 font-medium">No product types found</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.productTypes.map((type) => (
                                    <TableRow key={type._id} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            {type.image ? (
                                                <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                                    <Image src={type.image} alt={type.name} fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <LayoutGrid className="h-5 w-5" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4 font-bold text-slate-900">{type.name}</TableCell>
                                        <TableCell className="py-4 font-mono text-xs text-slate-500">/{type.slug}</TableCell>

                                        <TableCell className="py-4">
                                            {type.isActive ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 rounded-lg px-2.5 py-0.5 font-bold uppercase text-[9px] tracking-wider">Active</Badge>
                                            ) : (
                                                <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-slate-200 rounded-lg px-2.5 py-0.5 font-bold uppercase text-[9px] tracking-wider">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-500 font-mono">{type.order}</TableCell>
                                        <TableCell
                                            className="text-slate-500 font-medium text-xs cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => type?.createdBy?._id && router.push(`/admin/users/${type.createdBy._id}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {/* 1. Icon First */}
                                                <div className="flex-shrink-0">
                                                    {typeof type.createdBy === 'object' ? (
                                                        <User className="h-4 w-4 text-indigo-500" />
                                                    ) : (
                                                        <MdSystemUpdateAlt className="h-4 w-4 text-slate-400" />
                                                    )}
                                                </div>

                                                {/* 2. Name then Email */}
                                                <div className="flex flex-col leading-tight">
                                                    <span className="text-slate-900 font-bold">
                                                        {type?.createdBy?.name}
                                                    </span>

                                                    {type?.createdBy?.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    onClick={() => setEditingType(type)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-2xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the <span className="font-bold text-slate-900">{type.name}</span> product type. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="rounded-xl bg-red-600 hover:bg-red-700"
                                                                onClick={() => handleDelete(type._id)}
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                {data && data.totalPages > 1 && (
                    <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-sm text-slate-500 font-medium">
                            Showing <span className="text-slate-900">{(page - 1) * 10 + 1}-{Math.min(page * 10, data.total)}</span> of <span className="text-slate-900">{data.total}</span> types
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="rounded-lg border-slate-200"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === data.totalPages}
                                onClick={() => setPage(page + 1)}
                                className="rounded-lg border-slate-200"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <Dialog open={!!editingType} onOpenChange={(open) => !open && setEditingType(null)}>
                <DialogContent className="sm:max-w-[600px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Product Type</DialogTitle>
                    </DialogHeader>
                    {editingType && (
                        <ProductTypeForm
                            initialData={editingType}
                            onSubmit={handleUpdate}
                            isLoading={isUpdating}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
