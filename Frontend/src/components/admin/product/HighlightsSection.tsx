"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useCategories } from '@/hooks/useCategories'

interface HighlightsSectionProps {
    data: any;
    onChange: (field: string, value: any) => void;
}

export default function HighlightsSection({ data, onChange }: HighlightsSectionProps) {
    const { data: categoryData } = useCategories({ limit: 100 })
    const currentCategory = categoryData?.categories.find(c => c._id === data.category)
    const categoryName = currentCategory?.name?.toLowerCase() || ''

    const handleHighlightChange = (field: string, value: string) => {
        onChange('highLight', {
            ...(data.highLight || {}),
            [field]: value
        })
    }

    const isGrocery = categoryName.includes('grocery') || categoryName.includes('food')
    const isClothing = categoryName.includes('clothing') || categoryName.includes('fashion')

    return (
        <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Product Highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Common / Fashion / General */}
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Material Type</Label>
                        <Input
                            placeholder="e.g. Cotton, Steel, Plastic"
                            value={data.highLight?.materialtype || ''}
                            onChange={(e) => handleHighlightChange('materialtype', e.target.value)}
                            className="rounded-xl h-11 border-slate-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Usage</Label>
                        <Input
                            placeholder="e.g. Indoor, Daily wear"
                            value={data.highLight?.usage || ''}
                            onChange={(e) => handleHighlightChange('usage', e.target.value)}
                            className="rounded-xl h-11 border-slate-200"
                        />
                    </div>

                    {/* Grocery / Food Specific */}
                    {isGrocery && (
                        <>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Ingredients</Label>
                                <Input
                                    placeholder="e.g. Sugar, Milk, Cocoa"
                                    value={data.highLight?.ingredients || ''}
                                    onChange={(e) => handleHighlightChange('ingredients', e.target.value)}
                                    className="rounded-xl h-11 border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Nutritional Info</Label>
                                <Input
                                    placeholder="e.g. 200kcal per 100g"
                                    value={data.highLight?.nutritionalInfo || ''}
                                    onChange={(e) => handleHighlightChange('nutritionalInfo', e.target.value)}
                                    className="rounded-xl h-11 border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Dietary Preference</Label>
                                <Input
                                    placeholder="e.g. Vegetarian, Gluten-free"
                                    value={data.highLight?.dietryPreference || ''}
                                    onChange={(e) => handleHighlightChange('dietryPreference', e.target.value)}
                                    className="rounded-xl h-11 border-slate-200"
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Storage Instructions</Label>
                        <Input
                            placeholder="e.g. Store in a cool, dry place"
                            value={data.highLight?.storage || ''}
                            onChange={(e) => handleHighlightChange('storage', e.target.value)}
                            className="rounded-xl h-11 border-slate-200"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
