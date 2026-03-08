"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { WarehouseForm } from '../_components/WarehouseForm'
import { useWarehouseActions } from '@/hooks/useWarehouses'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function AddWarehousePage() {
    const router = useRouter()
    const { createWarehouse, isCreating } = useWarehouseActions()

    const handleSubmit = async (values: any) => {
        console.log(values)
        try {
            await createWarehouse(values)
            toast.success("Warehouse created successfully")
            router.push('/admin/warehouses')
        } catch (error) {
            // Error is handled in hook
            toast.error("Failed to create warehouse")
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Add New Warehouse</h1>
                    <p className="text-gray-500 font-medium">Create a new storage facility in your network</p>
                </div>
            </div>

            <Card className="rounded-[40px] border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardContent className="p-8 sm:p-10">
                    <WarehouseForm
                        onSubmit={handleSubmit}
                        isLoading={isCreating}
                        buttonText="Create Warehouse"
                    />
                </CardContent>
            </Card>
        </div>
    )
}
