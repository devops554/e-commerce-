"use client"

import React, { useEffect, useState } from 'react'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { useManagerWarehouseInventory } from '@/hooks/useInventory'
import {
    History,
    Package,
    ChevronRight,
    Search as SearchIcon
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/input'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const StockHistoryPage = () => {
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: warehouse, isLoading: isWhLoading } = useManagerWarehouse()

    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)
    const [page, setPage] = useState(1)
    const router = useRouter()
    const limit = 10

    // Instead of raw history logs, fetch the warehouse inventory (products)
    const { data: inventoryResponse, isLoading: isInventoryLoading } = useManagerWarehouseInventory({
        page,
        limit,
        search: debouncedSearch
    })

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Manager Dashboard', href: '/manager' },
            { label: 'Stock History' }
        ])
    }, [setBreadcrumbs])

    // Reset page when search changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    if (isWhLoading || isInventoryLoading) {
        return <div className="space-y-6">
            <Skeleton className="h-[100px] w-full rounded-2xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    }

    const inventory = inventoryResponse?.items || []
    const totalPages = inventoryResponse?.totalPages || 0
    const total = inventoryResponse?.total || 0

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock History</h1>
                    <p className="text-slate-500 font-bold mt-1">Select a product to view its audit trail for <span className="text-slate-900">{warehouse?.name}</span></p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search SKU or product..."
                        className="pl-10 h-10 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {inventory.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-24 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-8 animate-pulse">
                            <History className="h-12 w-12 text-slate-200" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">No Products Found</h2>
                        <p className="text-slate-400 font-bold mt-3 max-w-sm leading-relaxed">
                            {searchTerm ? "Try searching for something else." : "Once products are added to your warehouse, they will appear here to view their history."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {inventory.map((item) => (
                                <Card 
                                    key={item._id} 
                                    className="border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer rounded-3xl"
                                    onClick={() => router.push(`/manager/stock-history/${item.product?._id}`)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                                                {item.product?.thumbnail?.url ? (
                                                    <Image
                                                        src={item.product.thumbnail.url}
                                                        alt={item.product.title || 'Product Image'}
                                                        width={64}
                                                        height={64}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <Package className="h-8 w-8 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-slate-900 text-[15px] truncate">{item.product?.title || 'Unknown Product'}</h3>
                                                <div className="text-sm font-bold text-slate-500 mt-0.5 truncate flex items-center gap-2">
                                                    <span>SKU: {item.variant?.sku}</span>
                                                </div>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-none font-bold text-[10px] uppercase tracking-wider">
                                                        {item.product?.category?.name || 'Category'}
                                                    </Badge>
                                                    <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                                                        {item.quantity} In Stock
                                                    </Badge>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-slate-300 shrink-0 self-center" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 mt-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Showing {inventory.length} of {total} products
                                </p>
                                <Pagination className="mx-0 w-fit">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPage((p: number) => Math.max(1, p - 1));
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
                                                    setPage((p: number) => Math.min(totalPages, p + 1));
                                                }}
                                                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default StockHistoryPage
