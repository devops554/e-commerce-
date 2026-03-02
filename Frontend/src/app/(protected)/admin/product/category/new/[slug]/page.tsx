"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCategory, useCategoryActions } from '@/hooks/useCategories'
import CategoryForm from '@/components/admin/CategoryForm'
import SubcategoryForm from '@/components/admin/SubcategoryForm'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'

export default function NewCategoryPage() {
    const params = useParams()
    const router = useRouter()
    const parentSlug = params.slug as string
    const isRoot = parentSlug === 'root'
    const { setBreadcrumbs } = useBreadcrumb()

    const { data: parentCategory, isLoading: isLoadingParent } = useCategory(isRoot ? '' : parentSlug)
    const { createCategory, isCreating } = useCategoryActions()

    React.useEffect(() => {
        const crumbs: { label: string; href?: string }[] = [
            { label: 'Categories', href: '/admin/product/category/root' }
        ]
        if (!isRoot && parentCategory) {
            crumbs.push({ label: parentCategory.name, href: `/admin/product/category/${parentSlug}` })
        }
        crumbs.push({ label: `New ${isRoot ? 'Category' : 'Subcategory'}` })
        setBreadcrumbs(crumbs)
    }, [isRoot, parentCategory, parentSlug, setBreadcrumbs])

    const handleSubmit = async (data: any) => {
        const payload = {
            ...data,
            parentId: isRoot ? null : parentCategory?._id
        }
        await createCategory(payload)
        router.push(`/admin/product/category/${parentSlug}`)
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
                        Create {isRoot ? 'New Category' : `Subcategory for ${parentCategory?.name}`}
                    </h1>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/20">
                {!isRoot && parentCategory ? (
                    <SubcategoryForm
                        onSubmit={handleSubmit}
                        isLoading={isCreating}
                        parentCategory={parentCategory}
                    />
                ) : (
                    <CategoryForm
                        onSubmit={handleSubmit}
                        isLoading={isCreating}
                        parentSlug={isRoot ? null : parentSlug}
                    />
                )}
            </div>
        </div>
    )
}
