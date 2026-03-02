"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProductVariant } from '@/services/product.service'

interface VariantManagementSectionProps {
    productId?: string;
    variants: ProductVariant[];
    onAddVariant: () => void;
    onEditVariant: (variant: ProductVariant) => void;
    onDeleteVariant: (id: string) => void;
}

export default function VariantManagementSection({
    productId,
    variants,
    onAddVariant,
    onEditVariant,
    onDeleteVariant
}: VariantManagementSectionProps) {
    if (!productId) {
        return (
            <Card className="shadow-sm rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-slate-500 font-medium mb-2">Variants can be managed after initial product creation.</p>
                    <p className="text-[10px] text-slate-400">Save the product first to enable SKU, Price and Stock variations.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Product Variants</CardTitle>
                <Button
                    type="button"
                    size="sm"
                    onClick={onAddVariant}
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                    <Plus className="h-4 w-4 mr-1" /> Add Variant
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {variants.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed rounded-2xl border-slate-100 text-slate-400 text-sm">
                            No variants added yet.
                        </div>
                    ) : (
                        variants.map((v) => (
                            <div key={v._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                                <div className="flex gap-4 items-center">
                                    <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-mono text-xs overflow-hidden">
                                        {v.images?.[0] ? (
                                            <img src={v.images[0].url} alt={v.sku} className="object-cover h-full w-full" />
                                        ) : (
                                            "v"
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            {v.discount > 0 ? (
                                                <>
                                                    <span className="font-bold text-slate-900">₹{v.discountPrice}</span>
                                                    <span className="text-[10px] text-slate-400 line-through">₹{v.price}</span>
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[9px] h-4 px-1">{v.discount}% OFF</Badge>
                                                </>
                                            ) : (
                                                <span className="font-bold text-slate-900">₹{v.price}</span>
                                            )}
                                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-mono border-slate-200 text-slate-500">{v.sku}</Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {(v.attributes || []).map((attr: any, idx: number) => (
                                                attr.value && (
                                                    <Badge key={idx} variant="secondary" className="text-[9px] h-4 px-1.5 bg-blue-50 text-blue-600 border-none font-medium capitalize">
                                                        <span className="opacity-50 mr-1 font-normal text-[8px] uppercase">{attr.name}:</span>
                                                        {attr.value}
                                                    </Badge>
                                                )
                                            ))}
                                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-dashed border-slate-200 text-slate-400 bg-transparent">
                                                Stock: {v.stock}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => onEditVariant(v)}>
                                        <Edit className="h-4 w-4 text-slate-600" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => onDeleteVariant(v._id)}>
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
