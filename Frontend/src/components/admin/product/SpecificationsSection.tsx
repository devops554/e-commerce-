"use client"

import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useCategories } from '@/hooks/useCategories'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SpecificationsSectionProps {
    data: any;
    onChange: (field: string, value: any) => void;
}

export default function SpecificationsSection({ data, onChange }: SpecificationsSectionProps) {
    const { data: categoryData } = useCategories({ limit: 100 })
    const currentCategory = categoryData?.categories.find(c => c._id === data.category)

    // Ensure data.attributes is an array
    const attributes: { name: string; value: string }[] = Array.isArray(data.attributes) ? data.attributes : []

    // When the category changes, Auto-sync category-level attributes into product attributes 
    // if they don't already exist.
    useEffect(() => {
        if (currentCategory?.attributes && currentCategory.attributes.length > 0) {
            let newAttributes = [...attributes]
            let changed = false

            currentCategory.attributes.forEach((catAttr: any) => {
                if (!newAttributes.some(a => a.name.toLowerCase() === catAttr.name.toLowerCase())) {
                    newAttributes.push({ name: catAttr.name, value: '' })
                    changed = true
                }
            })

            if (changed) {
                onChange('attributes', newAttributes)
            }
        }
    }, [currentCategory, data.category])

    const handleAttributeChange = (index: number, field: 'name' | 'value', val: string) => {
        const newAttributes = [...attributes]
        newAttributes[index] = { ...newAttributes[index], [field]: val }
        onChange('attributes', newAttributes)
    }

    const removeAttribute = (index: number) => {
        onChange('attributes', attributes.filter((_, i) => i !== index))
    }

    const addAttribute = () => {
        onChange('attributes', [...attributes, { name: '', value: '' }])
    }

    return (
        <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Product Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <Label className="text-sm font-bold text-slate-700">Dynamic Attributes</Label>
                            {currentCategory?.attributes?.length ? (
                                <p className="text-xs text-green-600 mt-1">Attributes populated from <b>{currentCategory.name}</b> category.</p>
                            ) : (
                                <p className="text-xs text-slate-500 mt-1">Select a category to load predefined attributes.</p>
                            )}
                        </div>
                        <Button
                            type="button"
                            onClick={addAttribute}
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-full border-dashed"
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Custom
                        </Button>
                    </div>

                    <div className="space-y-3 mt-4">
                        {attributes.map((attr, index) => {
                            // Is this a predefined attribute from the category?
                            const isPredefined = currentCategory?.attributes?.some((ca: any) => ca.name.toLowerCase() === attr.name.toLowerCase())

                            return (
                                <div key={index} className="flex gap-3 items-start group">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Attribute Name (e.g. Size, Color)"
                                            value={attr.name}
                                            onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                                            className={`rounded-xl h-11 ${isPredefined ? 'bg-slate-50 border-transparent text-slate-600 font-semibold' : 'border-slate-200'} `}
                                            readOnly={isPredefined}
                                        />
                                    </div>
                                    <div className="flex-2">
                                        <Input
                                            placeholder={`Enter ${attr.name || 'value'}...`}
                                            value={attr.value}
                                            onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                            className="rounded-xl h-11 border-slate-200 shadow-sm focus:border-blue-400"
                                        />
                                    </div>
                                    {!isPredefined && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => removeAttribute(index)}
                                            className="mt-1 h-9 w-9 p-0 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )
                        })}

                        {attributes.length === 0 && (
                            <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-sm text-slate-400">No attributes found. Add your first attribute.</p>
                            </div>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
