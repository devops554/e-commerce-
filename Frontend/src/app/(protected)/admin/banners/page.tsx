"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Layout } from 'lucide-react'
import BannerTable from './_components/BannerTable'
import BannerForm from './_components/BannerForm'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'

export default function BannersPage() {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | undefined>()
    const { setBreadcrumbs } = useBreadcrumb()

    useEffect(() => {
        setBreadcrumbs([{ label: 'Banners' }])
    }, [setBreadcrumbs])

    const handleCreate = () => {
        setEditingId(undefined)
        setIsFormOpen(true)
    }

    const handleEdit = (id: string) => {
        setEditingId(id)
        setIsFormOpen(true)
    }

    const handleSuccess = () => {
        setIsFormOpen(false)
        setEditingId(undefined)
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Layout className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Banner Management</h1>
                        <p className="text-sm text-muted-foreground">
                            Create and manage marketing banners for different pages.
                        </p>
                    </div>
                </div>
            </div>

            <BannerTable onCreate={handleCreate} onEdit={handleEdit} />

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Edit Banner' : 'Create New Banner'}
                        </DialogTitle>
                    </DialogHeader>
                    <BannerForm
                        id={editingId}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
