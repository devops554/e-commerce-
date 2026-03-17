"use client"

import React from 'react'
import { ProductCategoryRow } from './ProductCategoryRow'
import { Category } from '@/services/category.service'
import { useSubcategories } from '@/hooks/useCategories'

interface HierarchicalCategoryFlowProps {
    parentCategory: Category;
}

export const HierarchicalCategoryFlow = ({ parentCategory }: HierarchicalCategoryFlowProps) => {
    const { data: subData, isLoading } = useSubcategories(parentCategory._id, {
        isActive: true,
        limit: 10
    })

    const subcategories = subData?.categories || []

    return (
        <div className="space-y-6">
            {/* 1. Parent Category Products */}
            <div className="bg-white">
                <ProductCategoryRow category={parentCategory} />
            </div>

            {/* 2. Sub Category Products */}
            {subcategories.length > 0 && (
                <div className="space-y-0">
                    {subcategories.map((sub: Category) => (
                        <div key={sub._id} className="bg-white">
                            <ProductCategoryRow category={sub} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
