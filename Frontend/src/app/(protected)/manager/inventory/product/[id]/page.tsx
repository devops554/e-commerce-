"use client"

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProduct } from '@/hooks/useProducts'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { useManagerWarehouseInventory, useStockHistory } from '@/hooks/useInventory'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket } from '@/hooks/useSocket'
import {
    ChevronLeft,
    Package,
    Layers,
    MapPin,
    BarChart3,
    History,
    AlertTriangle,
    Boxes,
    Info,
    ArrowRight,
    TrendingUp,
    Warehouse,
    Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const ProductDetailPage = () => {
    const { id } = useParams() as { id: string }
    const router = useRouter()
    const { setBreadcrumbs } = useBreadcrumb()

    const { data: product, isLoading: productLoading } = useProduct(id)
    const { data: warehouse, isLoading: warehouseLoading } = useManagerWarehouse()
    const { data: inventory, isLoading: inventoryLoading } = useManagerWarehouseInventory()
    const { data: history, isLoading: historyLoading } = useStockHistory(warehouse?._id)
    const queryClient = useQueryClient()

    useSocket('stock.updated', (data) => {
        if (data.productId === id || data.warehouseId === warehouse?._id) {
            queryClient.invalidateQueries({ queryKey: ['manager-warehouse-inventory'] })
            queryClient.invalidateQueries({ queryKey: ['manager-warehouse'] })
            queryClient.invalidateQueries({ queryKey: ['stock-history', warehouse?._id] })
        }
    })

    useEffect(() => {
        if (product) {
            setBreadcrumbs([
                { label: 'Manager Dashboard', href: '/manager' },
                { label: 'Inventory', href: '/manager/inventory' },
                { label: product.title },
            ])
        }
    }, [product, setBreadcrumbs])

    if (productLoading || warehouseLoading || inventoryLoading) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48 rounded-lg" />
                        <Skeleton className="h-4 w-32 rounded-lg" />
                    </div>
                </div>
                {/* Top stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
                {/* Main content */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Skeleton className="xl:col-span-2 h-[500px] rounded-2xl" />
                    <Skeleton className="h-[500px] rounded-2xl" />
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center">
                    <Package className="h-10 w-10 text-slate-300" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Product Not Found</h2>
                <Button variant="outline" onClick={() => router.back()} className="rounded-xl">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Go Back
                </Button>
            </div>
        )
    }

    const productInventory = inventory?.filter(item =>
        String(item.product?._id || item.product) === String(product._id)
    ) || []

    const variantsWithInventory = product.variants?.map((variant: any) => {
        const invItem = productInventory.find(item =>
            String(item.variant?._id || item.variant) === String(variant._id)
        )
        return {
            ...variant,
            localQuantity: invItem?.quantity || 0,
            localReserved: invItem?.reserved || 0
        }
    })

    const totalLocalStock = variantsWithInventory?.reduce((sum: number, v: any) => sum + v.localQuantity, 0) || 0
    const totalReserved = variantsWithInventory?.reduce((sum: number, v: any) => sum + v.localReserved, 0) || 0
    const lowStockCount = variantsWithInventory?.filter((v: any) => v.localQuantity < 5).length || 0
    const utilizationPct = warehouse?.capacity
        ? Math.round((warehouse.capacity.usedCapacity / warehouse.capacity.totalCapacity) * 100)
        : 0

    const filteredHistory = history?.filter((h: any) =>
        String(h.product?._id || h.product) === String(product._id)
    ) || []

    return (
        <div className="space-y-6 pb-20">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl border-slate-200 shrink-0"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate">{product.title}</h1>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-black uppercase text-[10px]">
                                {product.brand}
                            </Badge>
                            <span className="text-slate-300 text-xs">•</span>
                            <span className="text-sm text-slate-500">{product.category?.name}</span>
                            <span className="text-slate-300 text-xs">•</span>
                            <span className="font-mono text-xs text-slate-400">{product.baseSku}</span>
                        </div>
                    </div>
                </div>
                <Badge className={`${totalLocalStock > 0 ? 'bg-emerald-500' : 'bg-rose-500'} self-start sm:self-center text-white border-none px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider shrink-0`}>
                    {totalLocalStock > 0 ? 'In Stock' : 'Out of Stock'}
                </Badge>
            </div>

            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    {
                        icon: <Boxes className="h-5 w-5 text-emerald-600" />,
                        bg: 'bg-emerald-50',
                        label: 'Available Units',
                        value: totalLocalStock,
                        sub: 'In this facility',
                        pulse: true,
                        pulseColor: 'bg-emerald-400'
                    },
                    {
                        icon: <History className="h-5 w-5 text-blue-600" />,
                        bg: 'bg-blue-50',
                        label: 'Received',
                        value: inventory?.filter(inv => String(inv.product?._id || inv.product) === String(product._id))
                            .reduce((sum, inv) => sum + (inv.totalReceived || 0), 0) || 0,
                        sub: 'Life-time total',
                    },
                    {
                        icon: <ArrowRight className="h-5 w-5 text-purple-600" />,
                        bg: 'bg-purple-50',
                        label: 'Dispatched',
                        value: inventory?.filter(inv => String(inv.product?._id || inv.product) === String(product._id))
                            .reduce((sum, inv) => sum + (inv.totalDispatched || 0), 0) || 0,
                        sub: 'Life-time total',
                    },
                    {
                        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
                        bg: 'bg-amber-50',
                        label: 'Reserved',
                        value: totalReserved,
                        sub: 'Pending orders',
                    },
                    {
                        icon: <Activity className="h-5 w-5 text-rose-500" />,
                        bg: 'bg-rose-50',
                        label: 'Low Stock',
                        value: lowStockCount,
                        sub: 'Variants under 5 units',
                    },
                    {
                        icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
                        bg: 'bg-blue-50',
                        label: 'Utilization',
                        value: `${utilizationPct}%`,
                        sub: 'Warehouse capacity',
                    },
                ].map((kpi, i) => (
                    <Card key={i} className="border border-slate-100 shadow-sm bg-white">
                        <CardContent className="p-4 md:p-5">
                            <div className="flex items-center justify-between mb-3 text-center">
                                <div className={`h-9 w-9 rounded-xl ${kpi.bg} flex items-center justify-center mx-auto sm:mx-0`}>
                                    {kpi.icon}
                                </div>
                                {kpi.pulse && (
                                    <div className={`h-2 w-2 rounded-full ${kpi.pulseColor} animate-pulse hidden sm:block`} />
                                )}
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                                <p className="text-2xl md:text-3xl font-black text-slate-900 mt-0.5 leading-none">{kpi.value}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-1">{kpi.sub}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── Main 3-col grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* LEFT + CENTRE: col-span-2 */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Product hero card */}
                    <Card className="border-none shadow-lg shadow-slate-100 overflow-hidden bg-white">
                        <div className="flex flex-col sm:flex-row">
                            {/* Image */}
                            <div className="sm:w-52 md:w-64 shrink-0 aspect-square sm:aspect-auto relative bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                                {product.thumbnail?.url ? (
                                    <Image
                                        src={product.thumbnail.url}
                                        alt={product.title}
                                        fill
                                        className="object-contain p-6"
                                    />
                                ) : (
                                    <Package className="h-20 w-20 text-slate-200" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-4 border-t sm:border-t-0 sm:border-l border-slate-100">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">
                                        <Info className="h-3 w-3" /> Description
                                    </div>
                                    <p className="text-slate-600 font-medium leading-relaxed text-sm">
                                        {product.shortDescription || 'No description available for this product.'}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Product ID</span>
                                        <span className="font-mono text-xs font-bold text-slate-700 break-all">{product._id}</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Type</span>
                                        <span className="text-sm font-bold text-slate-700">{product.productType?.name || 'Standard'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Tabs: Variants + History */}
                    <Tabs defaultValue="variants" className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <TabsList className="bg-slate-100/60 p-1 rounded-xl border border-slate-200 h-auto">
                                <TabsTrigger value="variants" className="rounded-lg font-black text-xs uppercase tracking-widest px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Layers className="h-3.5 w-3.5 mr-1.5" /> Variants
                                </TabsTrigger>
                                <TabsTrigger value="history" className="rounded-lg font-black text-xs uppercase tracking-widest px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <History className="h-3.5 w-3.5 mr-1.5" /> Stock History
                                </TabsTrigger>
                            </TabsList>
                            <span className="text-xs font-bold text-slate-400">
                                <span className="text-slate-900">{variantsWithInventory?.length || 0}</span> Configurations
                            </span>
                        </div>

                        {/* Variants grid */}
                        <TabsContent value="variants" className="mt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {variantsWithInventory?.map((variant: any) => {
                                    const primaryAttr = variant.attributes?.find((a: any) =>
                                        ['net volume', 'net weight', 'pack size', 'volume', 'weight', 'size'].includes(a.name.toLowerCase())
                                    )
                                    const isLow = variant.localQuantity < 5
                                    const isOut = variant.localQuantity === 0

                                    return (
                                        <div
                                            key={variant._id}
                                            className="group relative bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-200 overflow-hidden cursor-pointer"
                                        >
                                            {/* Stock status accent bar */}
                                            <div className={`absolute top-0 left-0 right-0 h-0.5 ${isOut ? 'bg-rose-400' : isLow ? 'bg-amber-400' : 'bg-emerald-400'}`} />

                                            {/* Top section */}
                                            <div className="p-4 pb-3">
                                                {/* SKU row */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[11px] font-black text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg tracking-wider">
                                                            {variant.sku}
                                                        </span>
                                                        {primaryAttr && (
                                                            <span className="text-[11px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                                                                {primaryAttr.value}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isOut ? (
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">Out of Stock</span>
                                                    ) : isLow ? (
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Low Stock</span>
                                                    ) : null}
                                                </div>

                                                {/* Image + attributes */}
                                                <div className="flex gap-3">
                                                    {/* Product image */}
                                                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 shrink-0 relative overflow-hidden">
                                                        {variant.images?.[0]?.url ? (
                                                            <Image src={variant.images[0].url} alt={variant.sku} fill className="object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <Package className="h-7 w-7 text-slate-300" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Attributes grid */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap gap-1">
                                                            {variant.attributes?.map((attr: any, i: number) => (
                                                                <span key={i} className="inline-flex items-baseline gap-1 text-[10px] bg-slate-50 border border-slate-100 rounded-md px-2 py-0.5">
                                                                    <span className="font-bold text-slate-400">{attr.name}:</span>
                                                                    <span className="font-black text-slate-700">{attr.value}</span>
                                                                </span>
                                                            ))}
                                                        </div>

                                                        {/* Price */}
                                                        <div className="mt-2 flex items-baseline gap-2">
                                                            <span className="text-xl font-black text-slate-900 tracking-tight">
                                                                ₹{variant.discountPrice || variant.price}
                                                            </span>
                                                            {variant.discountPrice && (
                                                                <span className="text-xs text-slate-400 line-through font-medium">
                                                                    ₹{variant.price}
                                                                </span>
                                                            )}
                                                            {variant.discountPrice && (
                                                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                                                    {Math.round((1 - variant.discountPrice / variant.price) * 100)}% OFF
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom stock bar */}
                                            <div className="mx-4 h-px bg-slate-100" />
                                            <div className="px-4 py-3 flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <div className="flex flex-col">
                                                        <span className={`text-2xl font-black leading-none ${isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-slate-900'}`}>
                                                            {variant.localQuantity}
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Available</span>
                                                    </div>
                                                    <div className="w-px h-7 bg-slate-100" />
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-black text-slate-400 leading-none">{variant.localReserved}</span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Reserved</span>
                                                    </div>
                                                </div>
                                                <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-200 shrink-0">
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </TabsContent>

                        {/* History table */}
                        <TabsContent value="history" className="mt-0">
                            <Card className="border-none shadow-lg shadow-slate-100 overflow-hidden bg-white">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[560px]">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    {['Action', 'Variant / SKU', 'Change', 'Source', 'Date', 'Notes'].map(h => (
                                                        <th key={h} className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap last:hidden sm:last:table-cell">
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {filteredHistory.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium text-sm">
                                                            No stock history found for this product.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredHistory.map((h: any) => (
                                                        <tr key={h._id} className="hover:bg-slate-50/60 transition-colors group">
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                <Badge className={`${h.type === 'ADJUSTMENT' && h.amount > 0 ? 'bg-emerald-50 text-emerald-600' :
                                                                    h.type === 'ADJUSTMENT' ? 'bg-rose-50 text-rose-600' :
                                                                        h.type === 'RESERVATION' ? 'bg-amber-50 text-amber-600' :
                                                                            'bg-blue-50 text-blue-600'
                                                                    } border-none text-[10px] font-black uppercase`}>
                                                                    {h.type === 'ADJUSTMENT' && h.amount > 0 ? 'Received' : h.type}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <p className="text-xs font-black text-slate-900 uppercase">{h.variant?.sku}</p>
                                                                <p className="text-[10px] font-bold text-slate-400">{h.variant?.attributes?.[0]?.value || 'Default'}</p>
                                                            </td>
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                <span className={`text-sm font-black ${h.amount > 0 ? 'text-emerald-500' : h.amount < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                                                                    {h.amount > 0 ? `+${h.amount}` : h.amount}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                {h.source ? (
                                                                    <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg uppercase tracking-wide">
                                                                        {h.source}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-slate-300">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                <span className="text-xs font-bold text-slate-700 block">
                                                                    {new Date(h.createdAt).toLocaleDateString()}
                                                                </span>
                                                                <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">
                                                                    {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3.5 hidden sm:table-cell">
                                                                <p className="text-xs font-medium text-slate-500 max-w-[180px] truncate group-hover:whitespace-normal transition-all cursor-default">
                                                                    {h.notes || '—'}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* RIGHT sidebar */}
                <div className="space-y-5">

                    {/* Warehouse card */}
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white overflow-hidden">
                        <CardHeader className="p-6 pb-3 relative">
                            <div className="absolute right-6 top-6 opacity-[0.07]">
                                <Warehouse className="h-20 w-20" />
                            </div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">Active Facility</p>
                            <h2 className="text-xl font-black text-white leading-tight">{warehouse?.name}</h2>
                            <p className="text-white/50 font-mono text-xs mt-1">{warehouse?.code}</p>
                        </CardHeader>
                        <CardContent className="p-6 pt-3 space-y-5">
                            <Separator className="bg-white/10" />

                            {/* Address */}
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-wider block">Address</span>
                                    <p className="text-sm font-medium text-white/80 leading-snug mt-0.5">
                                        {warehouse?.address
                                            ? `${warehouse.address.city}, ${warehouse.address.state} ${warehouse.address.pincode}`
                                            : 'Not available'}
                                    </p>
                                </div>
                            </div>

                            {/* Utilisation bar */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-blue-400" />
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Utilization</span>
                                    </div>
                                    <span className="text-xs font-black text-white">{utilizationPct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 rounded-full"
                                        style={{ width: `${utilizationPct}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-[10px] text-white/30 font-bold">{warehouse?.capacity?.usedCapacity ?? 0} used</span>
                                    <span className="text-[10px] text-white/30 font-bold">{warehouse?.capacity?.totalCapacity ?? 0} total</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory status */}
                    <Card className="border border-slate-100 shadow-sm bg-white">
                        <CardHeader className="p-5 pb-3">
                            <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                                <Boxes className="h-4 w-4 text-indigo-500" />
                                Inventory Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-2 space-y-3">
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-700/60 uppercase tracking-widest">Available</p>
                                    <p className="text-3xl font-black text-emerald-700 leading-none mt-0.5">{totalLocalStock}</p>
                                    <p className="text-[11px] font-bold text-emerald-600/60 mt-1">Units in this facility</p>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            </div>

                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                                <p className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest">Reserved</p>
                                <p className="text-3xl font-black text-amber-700 leading-none mt-0.5">{totalReserved}</p>
                                <p className="text-[11px] font-bold text-amber-600/60 mt-1">Held for pending orders</p>
                            </div>

                            <Separator className="my-1" />

                            <Button
                                className="w-full bg-slate-900 hover:bg-black text-white font-black h-11 rounded-xl"
                                onClick={() => router.push('/manager/inventory')}
                            >
                                Manage Inventory Table
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ProductDetailPage