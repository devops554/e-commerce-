import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PackageSearch } from 'lucide-react'
import { ReturnRequest } from '@/services/return.service'

interface ReturnItemCardProps {
    request: ReturnRequest;
}

export function ReturnItemCard({ request }: ReturnItemCardProps) {
    return (
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-6 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <PackageSearch className="h-5 w-5 text-blue-600" />
                    Item Details
                </CardTitle>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold uppercase text-[10px] tracking-widest">
                    {request.status}
                </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="flex gap-4">
                    <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img src={request.productId?.images?.[0]?.url || ''} alt={request.productId?.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 leading-snug">{request.productId?.title}</h3>
                        <p className="text-[10px] font-mono text-slate-500">SKU: {request.variantId?.sku}</p>
                        <div className="flex gap-2 flex-wrap mt-1">
                            {request.variantId?.attributes?.map((a: any, i: number) => (
                                <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600">
                                    {a.name}: {a.value}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-1">Quantity returning: {request.quantity}</p>

                        {(request.variantId as any)?.weightKg !== undefined || (request.variantId as any)?.dimensionsCm ? (
                            <div className="flex flex-col gap-1 mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 italic">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Expected Specifications</p>
                                <div className="flex gap-4">
                                    {(request.variantId as any)?.weightKg !== undefined && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-slate-500 font-bold">Weight:</span>
                                            <span className="text-xs font-black text-slate-700">{(request.variantId as any).weightKg} kg</span>
                                        </div>
                                    )}
                                    {(request.variantId as any)?.dimensionsCm && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-slate-500 font-bold">Dimensions:</span>
                                            <span className="text-xs font-black text-slate-700">
                                                {(request.variantId as any).dimensionsCm.length}x{(request.variantId as any).dimensionsCm.width}x{(request.variantId as any).dimensionsCm.height} cm
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
