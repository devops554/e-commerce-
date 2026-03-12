import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import { OrderItemCard } from '@/components/order/OrderItemCard'
import { ItemActionCell } from './OrderActionComponents'

interface WarehousePackingListProps {
    warehouseItems: any[]
    confirmedCount: number
    totalCount: number
    orderStatus: string
    onConfirm: (variantId: string) => void
    isDispatching: boolean
}

export function WarehousePackingList({
    warehouseItems,
    confirmedCount,
    totalCount,
    orderStatus,
    onConfirm,
    isDispatching
}: WarehousePackingListProps) {
    return (
        <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 px-4 sm:px-6 pt-5 sm:pt-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-sm sm:text-base font-black flex items-center gap-2 text-slate-900">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    Warehouse Packing List
                </CardTitle>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Progress pill */}
                    {totalCount > 0 && (
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-2.5 py-1 shadow-sm">
                            <div className="flex gap-0.5">
                                {warehouseItems.map((item: any, idx: number) => {
                                    const st = (item.status ?? '').toLowerCase()
                                    const done = ['confirmed', 'packed', 'shipped', 'delivered'].includes(st)
                                    return (
                                        <div
                                            key={item._id ?? idx}
                                            className={`h-1.5 w-3 sm:w-4 rounded-full ${done ? 'bg-emerald-400' : 'bg-slate-200'}`}
                                        />
                                    )
                                })}
                            </div>
                            <span className="text-[10px] font-black text-slate-500">
                                {confirmedCount}/{totalCount}
                            </span>
                        </div>
                    )}
                    <Badge className="bg-white text-slate-600 border-slate-200 font-bold text-xs sm:text-sm">
                        {totalCount} Items
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 py-5 sm:py-6 space-y-5">
                {warehouseItems.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 font-medium">
                        No items in this order are assigned to your warehouse.
                    </div>
                ) : (
                    warehouseItems.map((item: any, i: number) => (
                        <div
                            key={item._id ?? i}
                            className="relative group flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-5 last:border-0 last:pb-0 gap-3 sm:gap-4"
                        >
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <OrderItemCard
                                    item={item}
                                    isLast={i === warehouseItems.length - 1}
                                />
                            </div>

                            {/* Action */}
                            <div className="sm:shrink-0 sm:self-center mt-2 sm:mt-0 w-full sm:w-auto">
                                <ItemActionCell
                                    item={item}
                                    orderStatus={orderStatus}
                                    onConfirm={onConfirm}
                                    isPending={isDispatching}
                                />
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
