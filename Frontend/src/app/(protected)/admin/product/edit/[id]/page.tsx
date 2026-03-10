"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProduct, useProductActions } from '@/hooks/useProducts'
import ProductForm from '@/components/admin/product/ProductForm'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'

export default function EditProductPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const { setBreadcrumbs } = useBreadcrumb()
    const { updateProduct, isUpdating } = useProductActions()

    const { data: product, isLoading, isError } = useProduct(id)

    React.useEffect(() => {
        if (product) {
            setBreadcrumbs([
                { label: 'Products', href: '/admin/product' },
                { label: product.title, href: `/admin/product/${product._id}` },
                { label: 'Edit' }
            ])
        }
    }, [product, setBreadcrumbs])

    const handleSubmit = async (formData: any) => {

        try {
            await updateProduct({ id: formData._id, data: formData })
            router.push(`/admin/product/${id}`)
        } catch (error) {
            console.error('Failed to update product:', error)
        }
    }

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh] py-20">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="text-sm text-slate-500 font-medium">Loading product data…</p>
            </div>
        </div>
    )

    if (isError || !product) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 gap-4">
            <AlertCircle className="h-14 w-14 text-rose-300" />
            <p className="text-slate-600 font-bold text-lg">Product not found</p>
            <p className="text-slate-400 text-sm -mt-2">The product you're trying to edit doesn't exist.</p>
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl px-8 mt-2">Go Back</Button>
        </div>
    )

    return (
        <div className="max-w-[1200px] mx-auto p-4 lg:p-10">
            <ProductForm
                initialData={product}
                onSubmit={handleSubmit}
                isLoading={isUpdating}
                title="Edit Product"
            />
        </div>
    )
}
