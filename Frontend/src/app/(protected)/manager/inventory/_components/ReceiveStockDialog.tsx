"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { productService, type Product, type ProductVariant } from '@/services/product.service'
import {
    Package,
    Search,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    X,
    Plus,
    Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogHeader,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import type { Warehouse } from '@/services/warehouse.service'

type ReceiveStep = 'search' | 'variant' | 'confirm'

interface ReceiveStockDialogProps {
    open: boolean
    onClose: () => void
    warehouse: Warehouse
    onConfirm: (variantId: string, amount: number, source?: string) => Promise<void>
    isSubmitting: boolean
}

export const ReceiveStockDialog = ({
    open,
    onClose,
    warehouse,
    onConfirm,
    isSubmitting,
}: ReceiveStockDialogProps) => {
    const [step, setStep] = useState<ReceiveStep>('search')

    const [productSearch, setProductSearch] = useState('')
    const [productResults, setProductResults] = useState<Product[]>([])
    const [productSearchLoading, setProductSearchLoading] = useState(false)

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [variants, setVariants] = useState<ProductVariant[]>([])
    const [variantsLoading, setVariantsLoading] = useState(false)
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

    const [amount, setAmount] = useState<number>(1)
    const [source, setSource] = useState('')

    /* ── Reset on close ── */
    const handleClose = () => {
        setStep('search')
        setProductSearch('')
        setProductResults([])
        setSelectedProduct(null)
        setSelectedVariant(null)
        setVariants([])
        setAmount(1)
        setSource('')
        onClose()
    }

    /* ── Product search (debounced 400ms) ── */
    const searchProducts = useCallback(async (q: string) => {
        if (!q.trim()) { setProductResults([]); return }
        setProductSearchLoading(true)
        try {
            const res = await productService.getAll({ search: q, limit: 8, isActive: true })
            setProductResults(res.products)
        } catch {
            setProductResults([])
        } finally {
            setProductSearchLoading(false)
        }
    }, [])

    useEffect(() => {
        const id = setTimeout(() => searchProducts(productSearch), 400)
        return () => clearTimeout(id)
    }, [productSearch, searchProducts])

    /* ── Load variants on product select ── */
    const handleSelectProduct = async (product: Product) => {
        setSelectedProduct(product)
        setSelectedVariant(null)
        setVariants([])
        setVariantsLoading(true)
        setStep('variant')
        try {
            const v = await productService.getVariants(product._id)
            setVariants(v)
        } catch {
            setVariants([])
        } finally {
            setVariantsLoading(false)
        }
    }

    const handleConfirm = async () => {
        if (!selectedVariant || amount < 1) return
        await onConfirm(selectedVariant._id, amount, source)
        handleClose()
    }

    const STEPS: ReceiveStep[] = ['search', 'variant', 'confirm']
    const currentIdx = STEPS.indexOf(step)

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
            <DialogContent className="sm:max-w-[560px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">

                {/* ── Step Bar ── */}
                <div className="flex items-center border-b border-slate-100 bg-slate-50/50 px-8 py-5">
                    {STEPS.map((s, i) => {
                        const done = i < currentIdx
                        const active = i === currentIdx
                        return (
                            <React.Fragment key={s}>
                                <div className={`flex items-center gap-2 ${active ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-300'}`}>
                                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all
                                        ${active ? 'border-slate-900 bg-slate-900 text-white' : done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-300'}`}>
                                        {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider hidden sm:block">
                                        {s === 'search' ? 'Find Product' : s === 'variant' ? 'Select Variant' : 'Confirm Qty'}
                                    </span>
                                </div>
                                {i < 2 && <ChevronRight className="h-4 w-4 text-slate-200 mx-2" />}
                            </React.Fragment>
                        )
                    })}
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 rounded-lg" onClick={handleClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* ── Step 1: Search ── */}
                {step === 'search' && (
                    <div className="p-8 space-y-5">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black tracking-tight">Find Product</DialogTitle>
                            <DialogDescription className="font-medium text-slate-500">
                                Search for the product you are receiving into{' '}
                                <span className="font-bold text-slate-700">{warehouse.name}</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                autoFocus
                                placeholder="Search by product name or SKU..."
                                className="pl-10 h-12 rounded-xl border-slate-200 font-bold text-sm"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                            {productSearchLoading && (
                                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
                            )}
                        </div>

                        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                            {productResults.map((product) => (
                                <button
                                    key={product._id}
                                    onClick={() => handleSelectProduct(product)}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-900 hover:bg-slate-50 transition-all text-left group"
                                >
                                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                        {product.thumbnail?.url ? (
                                            <Image src={product.thumbnail.url} alt={product.title} width={48} height={48} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Package className="h-5 w-5 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-slate-900 truncate">{product.title}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{product.brand} • {product.baseSku}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-900 shrink-0" />
                                </button>
                            ))}
                            {!productSearchLoading && productSearch.trim() && productResults.length === 0 && (
                                <div className="text-center py-10 text-slate-400">
                                    <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="font-bold text-sm">No products found</p>
                                </div>
                            )}
                            {!productSearch.trim() && (
                                <div className="text-center py-10 text-slate-400">
                                    <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p className="font-bold text-sm">Start typing to search products</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Step 2: Variant ── */}
                {step === 'variant' && selectedProduct && (
                    <div className="p-8 space-y-5">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0" onClick={() => setStep('search')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <DialogTitle className="text-xl font-black tracking-tight">Select Variant</DialogTitle>
                                <DialogDescription className="font-medium text-slate-500 text-xs mt-0.5 truncate max-w-[380px]">
                                    {selectedProduct.title}
                                </DialogDescription>
                            </div>
                        </div>

                        {variantsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                                {variants.map((variant) => (
                                    <button
                                        key={variant._id}
                                        onClick={() => { setSelectedVariant(variant); setStep('confirm') }}
                                        className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all text-left
                                            ${selectedVariant?._id === variant._id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-black text-sm text-slate-900 font-mono">{variant.sku}</span>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {variant.attributes?.map((attr, i) => (
                                                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                                                        {attr.name}: {attr.value}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0">
                                            <span className="text-sm font-black text-slate-900">₹{variant.discountPrice || variant.price}</span>
                                            <Badge variant="outline" className="text-[9px] font-bold mt-1">
                                                Stock: {variant.stock}
                                            </Badge>
                                        </div>
                                    </button>
                                ))}
                                {variants.length === 0 && (
                                    <div className="text-center py-10 text-slate-400">
                                        <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                        <p className="font-bold text-sm">No variants found for this product</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Step 3: Confirm ── */}
                {step === 'confirm' && selectedProduct && selectedVariant && (
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0" onClick={() => setStep('variant')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <DialogTitle className="text-xl font-black tracking-tight">Confirm Receipt</DialogTitle>
                                <DialogDescription className="font-medium text-slate-500 text-xs mt-0.5">
                                    Enter the quantity you are receiving
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Summary card */}
                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                                    {selectedProduct.thumbnail?.url ? (
                                        <Image src={selectedProduct.thumbnail.url} alt={selectedProduct.title} width={48} height={48} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center"><Package className="h-5 w-5 text-slate-300" /></div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-slate-900 truncate">{selectedProduct.title}</p>
                                    <p className="font-black text-xs text-slate-500 font-mono mt-0.5">{selectedVariant.sku}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {selectedVariant.attributes?.map((attr, i) => (
                                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-full">
                                        {attr.name}: {attr.value}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Destination</span>
                                <span className="text-xs font-black text-slate-900">{warehouse.name} ({warehouse.code})</span>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Quantity to Receive</label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="rounded-xl h-12 w-12 border-slate-200"
                                        onClick={() => setAmount(prev => Math.max(1, prev - 1))}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        type="number"
                                        min={1}
                                        className="h-12 text-center font-black text-2xl rounded-xl flex-1 border-slate-200"
                                        value={amount}
                                        onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="rounded-xl h-12 w-12 border-slate-200"
                                        onClick={() => setAmount(prev => prev + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Source / Vendor</label>
                                <Input
                                    placeholder="e.g. MegaCorp Distribution"
                                    className="h-12 rounded-xl border-slate-200 font-bold"
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex gap-3 pt-2">
                            <Button variant="ghost" className="font-bold rounded-xl flex-1 h-12" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-slate-900 hover:bg-black text-white font-black px-8 rounded-xl h-12 shadow-lg shadow-slate-200 flex-1 flex items-center justify-center gap-2"
                                onClick={handleConfirm}
                                disabled={isSubmitting || amount < 1}
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                                ) : (
                                    <><Check className="h-4 w-4" /> Confirm Receipt</>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
