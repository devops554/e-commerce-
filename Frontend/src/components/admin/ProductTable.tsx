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
import { Edit, Trash2, Eye, Package, User } from 'lucide-react'
import Image from 'next/image'
import { Product } from '@/services/product.service'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { MdSystemUpdateAlt } from 'react-icons/md'

interface ProductTableProps {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onDelete: (id: string) => void;
}

export default function ProductTable({
    products,
    total,
    page,
    limit,
    onPageChange,
    onDelete,
}: ProductTableProps) {
    const router = useRouter()
    const totalPages = Math.ceil(total / limit)

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Display Order</TableHead>
                            <TableHead>Created By</TableHead>

                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product._id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-100 flex items-center justify-center">
                                            {product.thumbnail?.url ? (
                                                <Image
                                                    src={product.thumbnail.url}
                                                    alt={product.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <Package className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-900">
                                        <div className="flex flex-col">
                                            <span>{product.title}</span>
                                            <span className="text-xs text-slate-500 font-normal">/{product.slug}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{product.category?.name || 'N/A'}</span>
                                            {product.subCategory && (
                                                <span className="text-xs text-slate-500">{product.subCategory.name}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{product.brand}</TableCell>
                                    <TableCell className="text-slate-500 font-mono text-xs">{product.baseSku}</TableCell>
                                    <TableCell className="text-slate-500 font-mono text-xs">{product.order}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.isActive ? "default" : "secondary"}>
                                            {product.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell
                                        className="text-slate-500 font-medium text-xs cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => {
                                            const userId = product?.createdBy?._id;
                                            if (userId) router.push(`/admin/users/${userId}`);
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {/* 1. Icon First */}
                                            <div className="flex-shrink-0">
                                                {typeof product.createdBy === 'object' ? (
                                                    <User className="h-4 w-4 text-indigo-500" />
                                                ) : (
                                                    <MdSystemUpdateAlt className="h-4 w-4 text-slate-400" />
                                                )}
                                            </div>

                                            {/* 2. Name then Email */}
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-slate-900 font-bold">
                                                    {product?.createdBy?.name || 'System'}
                                                </span>

                                                {product?.createdBy?.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/admin/product/${product.slug}`)}
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4 text-slate-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/admin/product/edit/${product.slug}`)}
                                            >
                                                <Edit className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this product?')) {
                                                        onDelete(product._id)
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

                            {/* Simple pagination logic for brevity */}
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
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

                            {totalPages > 5 && <span className="px-2">...</span>}
                            {totalPages > 5 && (
                                <PaginationItem>
                                    <PaginationLink
                                        isActive={page === totalPages}
                                        onClick={() => onPageChange(totalPages)}
                                        className="cursor-pointer"
                                    >
                                        {totalPages}
                                    </PaginationLink>
                                </PaginationItem>
                            )}

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
    )
}
