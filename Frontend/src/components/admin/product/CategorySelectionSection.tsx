"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useCategories, useSubcategories } from '@/hooks/useCategories'
import { ChevronDown, Search, Check, X } from 'lucide-react'

interface CategorySelectionSectionProps {
    data: any;
    onChange: (field: string, value: any) => void;
}

import { SearchableSelect } from '@/components/SearchableSelect'
import { useProductTypes } from '@/hooks/useProductTypes'

/** Extracts a plain string ID from whatever form the value is in:
 *  - already a string → return as-is
 *  - populated object with _id → return _id string
 *  - null / undefined → return null
 */
function resolveId(val: any): string | null {
    if (!val) return null
    if (typeof val === 'string') return val
    if (typeof val === 'object' && val._id) return String(val._id)
    return String(val)
}

export default function CategorySelectionSection({ data, onChange }: CategorySelectionSectionProps) {
    // 1. Fetch Parent Categories (top-level)
    const { data: categoryData, isLoading: isLoadingCats } = useCategories({ limit: 100 })
    const { data: productTypesData, isLoading: isLoadingTypes } = useProductTypes({ limit: 100 })

    const allParentCategories = categoryData?.categories || []
    const productTypeItems = productTypesData?.productTypes || []

    const isLoading = isLoadingCats || isLoadingTypes

    // Normalize values
    const selectedProductType = resolveId(data.productType)
    const selectedCategoryId = resolveId(data.category)
    const selectedSubCategoryId = resolveId(data.subCategory)

    // 2. Fetch Subcategories for the selected parent category
    const { data: subCategoryData, isLoading: isLoadingSubs } = useSubcategories(
        selectedCategoryId,
        { limit: 100 }
    )

    const mainCategories = allParentCategories.filter((c: any) => resolveId(c.productType) === selectedProductType)

    const subCategories = subCategoryData?.categories || []

    const handleProductTypeSelect = (id: string | null) => {
        onChange('productType', id)
        onChange('category', null)
        onChange('subCategory', null)
    }

    const handleCategorySelect = (id: string | null) => {
        onChange('category', id)
        onChange('subCategory', null)  // always reset sub when category changes
    }

    const selectedCategoryName = mainCategories.find(c => c._id === selectedCategoryId)?.name
    const selectedSubCategoryName = subCategories.find(c => c._id === selectedSubCategoryId)?.name

    return (
        <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Category Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

                <SearchableSelect
                    label="Product Type"
                    placeholder={isLoading ? "Loading..." : "Select product type..."}
                    items={productTypeItems}
                    selectedId={selectedProductType}
                    onSelect={handleProductTypeSelect}
                    emptyMessage="No product types found."
                />

                <SearchableSelect
                    label={`Primary Category${!selectedProductType ? ' (Select product type first)' : mainCategories.length === 0 ? ' (None available)' : ''}`}
                    placeholder={!selectedProductType ? "Select product type first..." : isLoading ? "Loading categories..." : "Select a category..."}
                    items={mainCategories}
                    selectedId={selectedCategoryId}
                    onSelect={handleCategorySelect}
                    disabled={!selectedProductType || mainCategories.length === 0}
                    emptyMessage="No categories found for this type."
                />

                <SearchableSelect
                    label={`Sub-Category${!selectedCategoryId ? ' (Select primary first)' : subCategories.length === 0 ? ' (None available)' : ' (Optional)'}`}
                    placeholder={!selectedCategoryId ? "Select primary category first..." : "Select a sub-category..."}
                    items={subCategories}
                    selectedId={selectedSubCategoryId}
                    onSelect={(id) => onChange('subCategory', id)}
                    disabled={!selectedCategoryId || subCategories.length === 0}
                    emptyMessage="No sub-categories found."
                />

                {/* Selection summary */}
                {(selectedCategoryId || selectedSubCategoryId) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {selectedCategoryName && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {selectedCategoryName}
                            </span>
                        )}
                        {selectedSubCategoryName && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {selectedSubCategoryName}
                            </span>
                        )}
                    </div>
                )}

            </CardContent>
        </Card>
    )
}