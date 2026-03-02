"use client"

import React from 'react'
import ProductForm from '@/components/admin/product/ProductForm'
import { useProductActions } from '@/hooks/useProducts'
import { useRouter } from 'next/navigation'

import { useBreadcrumb } from '@/providers/BreadcrumbContext'

export default function NewProductPage() {
    const router = useRouter()
    const { setBreadcrumbs } = useBreadcrumb()
    const { createProduct, isCreating } = useProductActions()

    React.useEffect(() => {
        setBreadcrumbs([
            { label: 'Products', href: '/admin/product' },
            { label: 'New Product' }
        ])
    }, [setBreadcrumbs])

    const handleSubmit = async (data: any) => {
        try {
            const result = await createProduct(data)
            if (result) {
                router.push('/admin/product')
            }
        } catch (error) {
            console.error('Failed to create product:', error)
        }
    }

    return (
        <div className="max-w-[1200px] mx-auto p-6 lg:p-10">
            <ProductForm
                title="Create New Product"
                onSubmit={handleSubmit}
                isLoading={isCreating}
            />
        </div>
    )
}
