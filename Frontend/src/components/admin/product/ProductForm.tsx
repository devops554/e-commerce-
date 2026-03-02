"use client"

import React, { useState, useEffect } from 'react'
import { useCategory } from '@/hooks/useCategories'
import { Button } from '@/components/ui/button'
import BasicInfoSection from './BasicInfoSection'
import MediaSection from './MediaSection'
import CategorySelectionSection from './CategorySelectionSection'
import SpecificationsSection from './SpecificationsSection'
import HighlightsSection from './HighlightsSection'
import AdditionalSettingsSection from './AdditionalSettingsSection'
import ManufacturerSection from './ManufacturerSection'
import CustomerCareSection from './CustomerCareSection'
import VariantManagementSection from './VariantManagementSection'
import VariantDialog from './VariantDialog'
import SeoSection from './SeoSection'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useProductVariantActions } from '@/hooks/useProducts'
import { ProductVariant } from '@/services/product.service'

function resolveId(val: any): string | null {
    if (!val) return null
    if (typeof val === 'string') return val
    if (typeof val === 'object' && val._id) return String(val._id)
    return String(val)
}

interface ProductFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    title: string;
}

export default function ProductForm({ initialData, onSubmit, isLoading, title }: ProductFormProps) {
    const router = useRouter()
    const [formData, setFormData] = useState(initialData || {
        isActive: true,
        images: [],
        productType: '',
    })

    // Sync formData with initialData when it changes (important for variants)
    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        }
    }, [initialData])

    const selectedCategoryId = typeof formData.category === 'object' ? formData.category?._id : formData.category
    const selectedSubCategoryId = typeof formData.subCategory === 'object' ? formData.subCategory?._id : formData.subCategory
    const activeCategoryId = selectedSubCategoryId || selectedCategoryId

    const { data: categoryDetails } = useCategory(activeCategoryId || '')

    // Update attributes when category changes
    useEffect(() => {
        if (categoryDetails?.attributes) {
            // Check if we are actually changing to a NEW category vs just loading on start
            const isInitialLoad = initialData && (resolveId(initialData.category) === selectedCategoryId || resolveId(initialData.subCategory) === selectedSubCategoryId)

            if (!isInitialLoad || !formData.attributes?.length) {
                setFormData((prev: any) => ({
                    ...prev,
                    attributes: categoryDetails.attributes
                }))
            }
        }
    }, [categoryDetails, initialData])

    // Variant Management State
    const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
    const { createVariant, updateVariant, deleteVariant, isCreatingVariant, isUpdatingVariant } = useProductVariantActions()

    const handleFieldChange = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    // Variant Actions
    const handleSaveVariant = async (variantData: any) => {
        try {
            if (editingVariant) {
                await updateVariant({ id: editingVariant._id, data: variantData })
            } else {
                await createVariant({ ...variantData, product: formData._id })
            }
            setIsVariantDialogOpen(false)
            setEditingVariant(null)
        } catch (error) {
            console.error('Failed to save variant:', error)
        }
    }

    const handleDeleteVariant = async (variantId: string) => {
        if (confirm('Are you sure you want to delete this variant?')) {
            await deleteVariant({ id: variantId, productId: formData._id })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
            <div className="flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md py-4 border-b">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-full h-10 w-10 font-bold"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
                </div>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-700 hover:bg-green-800 text-white font-bold rounded-2xl h-11 px-6 shadow-lg shadow-green-100 min-w-[140px]"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <Save className="mr-2 h-5 w-5" />
                            Save Product
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <BasicInfoSection data={formData} onChange={handleFieldChange} />
                    <MediaSection data={formData} onChange={handleFieldChange} />
                    <HighlightsSection data={formData} onChange={handleFieldChange} />
                    <SpecificationsSection data={formData} onChange={handleFieldChange} />
                    <VariantManagementSection
                        productId={formData._id}
                        variants={formData.variants || []}
                        onAddVariant={() => {
                            setEditingVariant(null)
                            setIsVariantDialogOpen(true)
                        }}
                        onEditVariant={(v) => {
                            setEditingVariant(v)
                            setIsVariantDialogOpen(true)
                        }}
                        onDeleteVariant={handleDeleteVariant}
                    />
                </div>

                {/* Right Column - Status & Category */}
                <div className="space-y-8">
                    <CategorySelectionSection data={formData} onChange={handleFieldChange} />
                    <SeoSection data={formData} onChange={handleFieldChange} />
                    <AdditionalSettingsSection data={formData} onChange={handleFieldChange} />
                    <ManufacturerSection data={formData} onChange={handleFieldChange} />
                    <CustomerCareSection data={formData} onChange={handleFieldChange} />
                </div>
            </div>

            <VariantDialog
                isOpen={isVariantDialogOpen}
                onClose={() => {
                    setIsVariantDialogOpen(false)
                    setEditingVariant(null)
                }}
                onSave={handleSaveVariant}
                initialData={editingVariant}
                isLoading={isCreatingVariant || isUpdatingVariant}
                availableImages={[
                    ...(formData.thumbnail?.url ? [formData.thumbnail] : []),
                    ...(formData.images || [])
                ]}
                productAttributes={formData.attributes || []}
            />
        </form>
    )
}
