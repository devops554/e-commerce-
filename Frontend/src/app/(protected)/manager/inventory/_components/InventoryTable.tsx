import { ChevronLeft, ChevronRight, PackagePlus, Search, Package, BarChart3, Plus, ArrowRightLeft, AlertTriangle } from 'lucide-react'
import type { PaginatedInventory, InventoryItem } from '@/services/inventory.service'
import type { Warehouse } from '@/services/warehouse.service'
import { useAuth } from '@/providers/AuthContext'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import Image from 'next/image'
import { UserRole } from '@/services/user.service'

interface InventoryTableProps {
    warehouse: Warehouse
    inventoryResponse: PaginatedInventory | undefined
    searchTerm: string
    onSearchChange: (term: string) => void
    page: number
    onPageChange: (page: number) => void
    onReceiveClick?: () => void
    onAdjustClick?: (item: InventoryItem) => void
    onTransferClick?: (item: InventoryItem) => void
}

export const InventoryTable = ({
    warehouse,
    inventoryResponse,
    searchTerm,
    onSearchChange,
    page,
    onPageChange,
    onReceiveClick,
    onAdjustClick,
    onTransferClick,
}: InventoryTableProps) => {
    const inventory = inventoryResponse?.items || []
    const totalPages = inventoryResponse?.totalPages || 0
    const totalItems = inventoryResponse?.total || 0



    const { user } = useAuth()

    return (
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                            Inventory Management
                        </CardTitle>
                    </div>
                    <CardDescription className="font-bold text-slate-500 pl-12">
                        Facility: <span className="text-slate-900">{warehouse.name} ({warehouse.code})</span>
                    </CardDescription>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {onReceiveClick && (
                        <Button
                            className="bg-slate-900 hover:bg-black text-white font-black px-5 h-11 rounded-xl shadow-md shadow-slate-200 flex items-center gap-2"
                            onClick={onReceiveClick}
                        >
                            <PackagePlus className="h-4 w-4" />
                            Receive Stock
                        </Button>
                    )}

                    <div className="relative w-full md:w-[260px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search SKU or Product..."
                            className="pl-10 rounded-xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="border-t border-slate-50 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Product</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider">SKU</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Available</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Received</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Dispatched</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Reserved</th>
                                {(onAdjustClick || onTransferClick) && (
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((item) => (
                                <tr key={item._id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <Link href={user?.role === UserRole.ADMIN || user?.role === UserRole.SUB_ADMIN ? `/admin/warehouses/${warehouse._id}/inventory/stock-history/${item.variant._id}` : `/manager/inventory/product/${item.product?._id}`} className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-white transition-colors shrink-0 overflow-hidden">
                                                {item.product?.thumbnail?.url ? (
                                                    <Image
                                                        src={item.product.thumbnail.url}
                                                        alt={item.product.title}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-lg object-cover h-10 w-10"
                                                    />
                                                ) : (
                                                    <Package className="h-6 w-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                                )}
                                            </Link>
                                            <div className="flex flex-col">
                                                <Link href={user?.role === UserRole.ADMIN || user?.role === UserRole.SUB_ADMIN ? `/admin/warehouses/${warehouse._id}/inventory/stock-history/${item.variant._id}` : `/manager/inventory/product/${item.product?._id}`} className="font-bold text-slate-900 text-sm leading-snug hover:text-blue-600 transition-colors">
                                                    {item.product?.title || 'Unknown Product'}
                                                </Link>
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight mt-0.5 flex items-center gap-1.5 flex-wrap">
                                                    {item.product?.brand}
                                                    <span className="text-slate-200">/</span>
                                                    {item.product?.category?.name || 'Item'}
                                                    {(() => {
                                                        const primaryAttr = item.variant?.attributes?.find((a: any) =>
                                                            ['net volume', 'net weight', 'pack size', 'volume', 'weight', 'size'].includes(a.name.toLowerCase())
                                                        );
                                                        return primaryAttr ? (
                                                            <>
                                                                <span className="text-slate-200">/</span>
                                                                <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded leading-none">
                                                                    {primaryAttr.value}
                                                                </span>
                                                            </>
                                                        ) : null;
                                                    })()}
                                                    {(item.variant?.weightKg || item.variant?.dimensionsCm) && (
                                                        <>
                                                            <span className="text-slate-200">/</span>
                                                            <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded leading-none border border-amber-100/50">
                                                                {item.variant.weightKg ? `${item.variant.weightKg}kg` : ''}
                                                                {item.variant.weightKg && item.variant.dimensionsCm ? ' · ' : ''}
                                                                {item.variant.dimensionsCm ? `${item.variant.dimensionsCm.length}x${item.variant.dimensionsCm.width}x${item.variant.dimensionsCm.height}cm` : ''}
                                                            </span>
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-black text-slate-600 px-2 py-1 bg-slate-100 rounded-lg group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all font-mono">
                                            {item.variant?.sku}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`text-xl font-black ${item.quantity < 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                                                {item.quantity}
                                            </span>
                                            {item.quantity < 10 && (
                                                <span className="text-[9px] font-bold text-rose-400 uppercase flex items-center gap-0.5 mt-0.5">
                                                    <AlertTriangle className="h-2.5 w-2.5" /> Low
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-sm font-bold text-slate-600">{item.totalReceived || 0}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-sm font-bold text-slate-600">{item.totalDispatched || 0}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-sm font-bold text-slate-400">{item.reserved}</span>
                                    </td>
                                    {(onAdjustClick || onTransferClick) && (
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {onAdjustClick && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 px-3 rounded-lg font-bold text-emerald-600 hover:bg-emerald-50"
                                                        onClick={() => onAdjustClick(item)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Adjust
                                                    </Button>
                                                )}
                                                {onTransferClick && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 px-3 rounded-lg font-bold text-blue-600 hover:bg-blue-50"
                                                        onClick={() => onTransferClick(item)}
                                                    >
                                                        <ArrowRightLeft className="h-4 w-4 mr-1" />
                                                        Transfer
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {inventory.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <Package className="h-12 w-12 mb-4" />
                                            <p className="font-bold text-slate-900">No inventory found</p>
                                            <p className="text-sm font-medium mt-1">
                                                {searchTerm ? 'Try a different search term' : 'Click "Receive Stock" to add your first item'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-8 py-6 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing {inventory.length} of {totalItems} items
                        </p>
                        <Pagination className="mx-0 w-fit">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onPageChange(Math.max(1, page - 1));
                                        }}
                                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                    if (
                                        p === 1 ||
                                        p === totalPages ||
                                        (p >= page - 1 && p <= page + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={page === p}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        onPageChange(p);
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
                                            onPageChange(Math.min(totalPages, page + 1));
                                        }}
                                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
