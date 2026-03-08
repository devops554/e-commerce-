import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Warehouse, useWarehouseActions } from '@/hooks/useWarehouses'
import { WarehouseForm } from './WarehouseForm'

interface WarehouseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    warehouse?: Warehouse | null
}

export function WarehouseDialog({ open, onOpenChange, warehouse }: WarehouseDialogProps) {
    const { updateWarehouse, isUpdating } = useWarehouseActions()

    const handleSubmit = async (values: any) => {
        try {
            if (warehouse) {
                await updateWarehouse({ id: warehouse._id, data: values })
            }
            onOpenChange(false)
        } catch (error) {
            // Error is handled in hook
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] p-0">
                <div className="p-8">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-black text-slate-900 italic">
                            Edit Warehouse
                        </DialogTitle>
                    </DialogHeader>

                    <WarehouseForm
                        initialData={warehouse}
                        onSubmit={handleSubmit}
                        isLoading={isUpdating}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
