"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCategory, useCategoryActions } from '@/hooks/useCategories'
import CategoryForm from '@/components/admin/CategoryForm'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'

export default function EditCategoryPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const { setBreadcrumbs } = useBreadcrumb()

    const { data: category, isLoading: isLoadingCategory } = useCategory(slug)
    const { updateCategory, isUpdating } = useCategoryActions()

    React.useEffect(() => {
        setBreadcrumbs([
            { label: 'Categories', href: '/admin/product/category/root' },
            { label: `Edit ${category?.name || 'Category'}` }
        ])
    }, [category, setBreadcrumbs])

    const handleSubmit = async (formData: any) => {
        if (!category?._id) return
        const { _id, createdAt, updatedAt, createdBy, updatedBy, ...updateData } = formData
        await updateCategory({ id: category._id, data: updateData })
        router.push('/admin/product/category/root')
    }

    if (isLoadingCategory) {
        return <div className="p-10 text-center">Loading...</div>
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full h-10 w-10 border border-slate-100 hover:bg-slate-50"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Edit Category: {category?.name}
                    </h1>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/20">
                <CategoryForm
                    initialData={category}
                    onSubmit={handleSubmit}
                    isLoading={isUpdating}
                />
            </div>
        </div>
    )
}
