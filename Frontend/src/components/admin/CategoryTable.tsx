"use client"

import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Eye, Plus, FolderTree, User } from 'lucide-react'
import Image from 'next/image'
import { Category } from '@/services/category.service'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { MdSystemUpdateAlt } from 'react-icons/md'

interface CategoryTableProps {
    categories: Category[];
    total: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onDelete: (id: string) => void;
}

export default function CategoryTable({
    categories,
    total,
    page,
    limit,
    onPageChange,
    onDelete,
}: CategoryTableProps) {
    const router = useRouter()
    const totalPages = Math.ceil(total / limit)

    return (
        <TooltipProvider>
            <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Product Type</TableHead>
                                <TableHead>Attributes</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Display Order</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category) => (
                                    <TableRow key={category._id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-100 flex items-center justify-center">
                                                {category.image ? (
                                                    <Image
                                                        src={category.image}
                                                        alt={category.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <FolderTree className="h-5 w-5 text-slate-400" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-900">
                                            {category.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                                {typeof category.productType === 'object' ? category.productType.name : 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {category.attributes && category.attributes.length > 0 ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex flex-wrap gap-1 cursor-help">
                                                            {category.attributes.slice(0, 2).map((attr, idx) => (
                                                                <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0 font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                                    {attr.name}
                                                                </Badge>
                                                            ))}
                                                            {category.attributes.length > 2 && (
                                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium bg-slate-100 text-slate-600">
                                                                    +{category.attributes.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[300px] flex flex-wrap gap-1 p-2">
                                                        {category.attributes.map((attr, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0 font-medium bg-slate-100 text-slate-700">
                                                                {attr.name}
                                                            </Badge>
                                                        ))}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            /{category.slug}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={category.isActive ? "default" : "secondary"}>
                                                {category.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {category.order}
                                        </TableCell>
                                        <TableCell
                                            className="text-slate-500 font-medium text-xs cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => {
                                                const userId = category?.createdBy?._id;
                                                if (userId) router.push(`/admin/users/${userId}`);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {/* 1. Icon First */}
                                                <div className="flex-shrink-0">
                                                    {typeof category.createdBy === 'object' ? (
                                                        <User className="h-4 w-4 text-indigo-500" />
                                                    ) : (
                                                        <MdSystemUpdateAlt className="h-4 w-4 text-slate-400" />
                                                    )}
                                                </div>

                                                {/* 2. Name then Email */}
                                                <div className="flex flex-col leading-tight">
                                                    <span className="text-slate-900 font-bold">
                                                        {category?.createdBy?.name || 'System'}
                                                    </span>

                                                    {category?.createdBy?.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/admin/product/category/${category.slug}`)}
                                                    title="View Subcategories"
                                                >
                                                    <Eye className="h-4 w-4 text-slate-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/admin/category/edit/${category.slug}`)}
                                                >
                                                    <Edit className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this category?')) {
                                                            onDelete(category._id)
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="pt-4 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} items
                        </p>
                        <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => page > 1 && onPageChange(page - 1)}
                                        className={`cursor-pointer ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                                    />
                                </PaginationItem>

                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={page === i + 1}
                                            onClick={() => onPageChange(i + 1)}
                                            className="cursor-pointer"
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => page < totalPages && onPageChange(page + 1)}
                                        className={`cursor-pointer ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}
