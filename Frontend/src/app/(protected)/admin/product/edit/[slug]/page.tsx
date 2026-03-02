"use client"

import React from 'react'
import ProductForm from '@/components/admin/product/ProductForm'
import { useProduct, useProductActions } from '@/hooks/useProducts'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { useBreadcrumb } from '@/providers/BreadcrumbContext'

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const slug = (params.slug as string) || ''
    const { setBreadcrumbs } = useBreadcrumb()

    const { data: product, isLoading } = useProduct(slug)
    const { updateProduct, isUpdating } = useProductActions()

    React.useEffect(() => {
        setBreadcrumbs([
            { label: 'Products', href: '/admin/product' },
            { label: product ? `Edit ${product.title}` : 'Edit Product' }
        ])
    }, [product, setBreadcrumbs])

    const handleSubmit = async (formData: any) => {
        try {
            // Remove un-updatable fields or transform them if needed
            const { _id, createdAt, updatedAt, slug: oldSlug, variants, createdBy, updatedBy, ...updateData } = formData

            // Map category, subcategory and productType back to IDs if they are objects
            if (updateData.category?._id) updateData.category = updateData.category._id
            if (updateData.subCategory?._id) updateData.subCategory = updateData.subCategory._id
            if (updateData.productType?._id) updateData.productType = updateData.productType._id

            if (!product?._id) {
                toast.error('Product ID not found')
                return
            }

            const result = await updateProduct({ id: product._id, data: updateData })
            if (result) {
                router.push('/admin/product')
            }
        } catch (error) {
            console.error('Failed to update product:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="h-[80vh] w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-slate-500 font-bold">Fetching product data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-[1200px] mx-auto p-6 lg:p-10">
            <ProductForm
                title="Edit Product"
                initialData={product}
                onSubmit={handleSubmit}
                isLoading={isUpdating}
            />
        </div>
    )
}
