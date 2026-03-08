"use client"

import React from 'react'
import { Plus, Minus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import type { InventoryItem } from '@/services/inventory.service'
import type { Warehouse } from '@/services/warehouse.service'

type ActionType = 'adjust' | 'transfer'

interface AdjustTransferDialogProps {
    open: boolean
    actionType: ActionType | null
    item: InventoryItem | null
    warehouse: Warehouse | null
    allWarehouses: Warehouse[] | undefined
    amount: number
    targetWarehouseId: string
    source: string
    isSubmitting: boolean
    onAmountChange: (val: number) => void
    onTargetWarehouseChange: (id: string) => void
    onSourceChange: (val: string) => void
    onConfirm: () => void
    onClose: () => void
}

export const AdjustTransferDialog = ({
    open,
    actionType,
    item,
    warehouse,
    allWarehouses,
    amount,
    targetWarehouseId,
    source,
    isSubmitting,
    onAmountChange,
    onTargetWarehouseChange,
    onSourceChange,
    onConfirm,
    onClose,
}: AdjustTransferDialogProps) => {
    const resultingStock = (item?.quantity || 0) + amount
    const isTransferInvalid = actionType === 'transfer' && !targetWarehouseId
    const isConfirmDisabled = amount === 0 || isTransferInvalid || resultingStock < 0 || isSubmitting

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight">
                        {actionType === 'adjust' ? 'Adjust Stock' : 'Transfer Stock'}
                    </DialogTitle>
                    <DialogDescription className="font-bold text-slate-500">
                        {item?.product?.title}{' '}
                        · <span className="font-mono text-xs">{item?.variant?.sku}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Current stock + amount selector */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Stock</span>
                            <span className="text-xl font-black text-slate-900">{item?.quantity} Units</span>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                {actionType === 'adjust' ? 'Adjustment Amount' : 'Transfer Amount'}
                            </label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-lg h-11 w-11"
                                    onClick={() => onAmountChange(amount - 1)}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    type="number"
                                    className="h-11 text-center font-black text-lg rounded-lg"
                                    value={amount}
                                    onChange={(e) => onAmountChange(parseInt(e.target.value) || 0)}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-lg h-11 w-11"
                                    onClick={() => onAmountChange(amount + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {actionType === 'adjust' && (
                                <p className="text-[10px] font-bold text-slate-400">
                                    Use positive to add, negative to reduce.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Source / Vendor */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                            Source / Notes (Optional)
                        </label>
                        <Input
                            type="text"
                            placeholder="e.g. Returned by customer, Audited, Vendor X"
                            className="h-11 rounded-lg font-bold text-sm"
                            value={source}
                            onChange={(e) => onSourceChange(e.target.value)}
                        />
                    </div>

                    {/* Destination selector (transfer only) */}
                    {actionType === 'transfer' && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                Destination Facility
                            </label>
                            <select
                                className="w-full h-11 px-4 rounded-xl border border-slate-100 bg-slate-50 font-bold text-sm focus:bg-white outline-none ring-slate-900 focus:ring-1"
                                value={targetWarehouseId}
                                onChange={(e) => onTargetWarehouseChange(e.target.value)}
                            >
                                <option value="">Select destination...</option>
                                {allWarehouses
                                    ?.filter((w) => w._id !== warehouse?._id)
                                    .map((w) => (
                                        <option key={w._id} value={w._id}>
                                            {w.name} ({w.code})
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {/* Resulting stock preview */}
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="flex justify-between items-center text-blue-900">
                            <span className="text-xs font-bold uppercase tracking-widest">Resulting Stock</span>
                            <span className={`text-xl font-black ${resultingStock < 0 ? 'text-rose-600' : ''}`}>
                                {resultingStock}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" className="font-bold rounded-xl" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-slate-900 hover:bg-black text-white font-black px-8 rounded-xl h-11 shadow-lg shadow-slate-200 flex items-center gap-2"
                        onClick={onConfirm}
                        disabled={isConfirmDisabled}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                        ) : (
                            'Confirm Action'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
