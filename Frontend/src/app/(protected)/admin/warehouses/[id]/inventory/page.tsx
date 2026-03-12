"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWarehouse, useWarehouses } from '@/hooks/useWarehouses'
import { useWarehouseInventory, useAdjustStock, useTransferStock, useAdminReceiveStock } from '@/hooks/useInventory'
import { useDebounce } from '@/hooks/useDebounce'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Boxes } from 'lucide-react'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import type { InventoryItem } from '@/services/inventory.service'
import { Button } from '@/components/ui/button'

import { InventoryTable } from '@/app/(protected)/manager/inventory/_components/InventoryTable'
import { ReceiveStockDialog } from '@/app/(protected)/manager/inventory/_components/ReceiveStockDialog'
import { AdjustTransferDialog } from '@/app/(protected)/manager/inventory/_components/AdjustTransferDialog'

type ActionType = 'adjust' | 'transfer'

const AdminWarehouseInventoryPage = () => {
    const { id: warehouseId } = useParams<{ id: string }>()
    const { setBreadcrumbs } = useBreadcrumb()
    const router = useRouter()

    /* ── Data ── */
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)

    const { data: warehouse, isLoading: warehouseLoading } = useWarehouse(warehouseId)
    const { data: inventoryResponse, isLoading: inventoryLoading } = useWarehouseInventory(warehouseId, {
        page,
        limit: 10,
        search: debouncedSearch
    })
    const { data: allWarehouses } = useWarehouses()

    /* ── Mutations ── */
    const adjustMutation = useAdjustStock()
    const transferMutation = useTransferStock()
    const receiveMutation = useAdminReceiveStock(warehouseId)

    // Reset to page 1 when search changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    /* ── Receive dialog ── */
    const [receiveOpen, setReceiveOpen] = useState(false)

    /* ── Adjust / Transfer dialog ── */
    const [actionType, setActionType] = useState<ActionType | null>(null)
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
    const [amount, setAmount] = useState(0)
    const [targetWarehouseId, setTargetWarehouseId] = useState('')
    const [source, setSource] = useState('')

    /* ── Breadcrumb ── */
    useEffect(() => {
        if (warehouse) {
            setBreadcrumbs([
                { label: 'Warehouses', href: '/admin/warehouses' },
                { label: `${warehouse.name} Inventory` },
            ])
        }
    }, [setBreadcrumbs, warehouse])

    /* ── Handlers ── */
    const openAdjust = (item: InventoryItem) => {
        setSelectedItem(item)
        setActionType('adjust')
        setAmount(0)
        setSource('')
    }

    const openTransfer = (item: InventoryItem) => {
        setSelectedItem(item)
        setActionType('transfer')
        setAmount(0)
        setTargetWarehouseId('')
        setSource('')
    }

    const closeActionDialog = () => {
        setActionType(null)
        setSelectedItem(null)
        setAmount(0)
        setTargetWarehouseId('')
        setSource('')
    }

    const handleConfirmAction = async () => {
        if (!selectedItem || !warehouse || amount === 0) return
        if (actionType === 'adjust') {
            await adjustMutation.mutateAsync({
                variantId: selectedItem.variant._id,
                warehouseId: warehouse._id,
                amount,
                source: source || undefined,
            })
        } else if (actionType === 'transfer') {
            await transferMutation.mutateAsync({
                variantId: selectedItem.variant._id,
                fromWarehouseId: warehouse._id,
                toWarehouseId: targetWarehouseId,
                amount,
                source: source || undefined,
            })
        }
        closeActionDialog()
    }

    const handleReceiveConfirm = async (variantId: string, qty: number, source?: string) => {
        await receiveMutation.mutateAsync({ variantId, amount: qty, source })
    }

    /* ── Loading ── */
    if (warehouseLoading || inventoryLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
        )
    }

    /* ── No warehouse ── */
    if (!warehouse) {
        return (
            <Card className="border-dashed border-2 bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-20">
                    <Boxes className="h-16 w-16 text-slate-300 mb-4" />
                    <CardTitle className="text-xl font-bold text-slate-700">Warehouse Not Found</CardTitle>
                    <CardDescription className="text-center mt-2 max-w-sm">
                        The requested warehouse does not exist or has been deleted.
                    </CardDescription>
                    <Button onClick={() => router.push('/admin/warehouses')} className="mt-6 rounded-xl">
                        Back to Warehouses
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6 pb-10">
            <InventoryTable
                warehouse={warehouse}
                inventoryResponse={inventoryResponse}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                page={page}
                onPageChange={setPage}
            // Admin is view-only
            // onReceiveClick={() => setReceiveOpen(true)}
            // onAdjustClick={openAdjust}
            // onTransferClick={openTransfer}
            />

            {/* 
            <ReceiveStockDialog
                open={receiveOpen}
                onClose={() => setReceiveOpen(false)}
                warehouse={warehouse}
                onConfirm={handleReceiveConfirm}
                isSubmitting={receiveMutation.isPending}
            />

            <AdjustTransferDialog
                open={!!actionType}
                actionType={actionType}
                item={selectedItem}
                warehouse={warehouse}
                allWarehouses={allWarehouses}
                amount={amount}
                targetWarehouseId={targetWarehouseId}
                source={source}
                isSubmitting={adjustMutation.isPending || transferMutation.isPending}
                onAmountChange={setAmount}
                onTargetWarehouseChange={setTargetWarehouseId}
                onSourceChange={setSource}
                onConfirm={handleConfirmAction}
                onClose={closeActionDialog}
            />
            */}
        </div>
    )
}

export default AdminWarehouseInventoryPage
