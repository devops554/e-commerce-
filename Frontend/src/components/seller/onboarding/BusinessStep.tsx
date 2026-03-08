import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { StepProps } from './types'
import { BUSINESS_TYPES } from './constants'
import { useProductTypes } from '@/hooks/useProductTypes'
import { useCategories } from '@/hooks/useCategories'

export const BusinessStep = ({ formData, updateFormData }: StepProps) => {
    const { data: productTypesData, isLoading: loadingTypes } = useProductTypes({ isActive: true, limit: 100 })
    const { data: categoriesData, isLoading: loadingCats } = useCategories({ isActive: true, limit: 100 })

    const productTypeOptions = productTypesData?.productTypes.map(pt => pt.name) || []
    const categoryOptions = categoriesData?.categories.map(cat => cat.name) || []

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Business Type *</Label>
                    <Select
                        value={formData.businessType}
                        onValueChange={(v) => updateFormData('businessType', v)}
                    >
                        <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50">
                            <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[24px] border-slate-100 p-2 shadow-xl">
                            {BUSINESS_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value} className="rounded-xl focus:bg-pink-50 focus:text-pink-600 font-medium">
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Store Name *</Label>
                    <Input
                        placeholder="e.g. Mithila Handloom"
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                        value={formData.storeName}
                        onChange={(e) => updateFormData('storeName', e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="font-bold text-slate-700">Product Types (Multiple) *</Label>
                <MultiSelect
                    options={productTypeOptions}
                    selected={formData.productTypes}
                    onChange={(val) => updateFormData('productTypes', val)}
                    placeholder={loadingTypes ? "Loading product types..." : "Search and select product types..."}
                />
            </div>

            <div className="space-y-2">
                <Label className="font-bold text-slate-700">Product Categories (Multiple) *</Label>
                <MultiSelect
                    options={categoryOptions}
                    selected={formData.productCategories}
                    onChange={(val) => updateFormData('productCategories', val)}
                    placeholder={loadingCats ? "Loading categories..." : "Search and select categories..."}
                />
            </div>

            <div className="space-y-2">
                <Label className="font-bold text-slate-700">Top Categories you sell in (Upto 10) *</Label>
                <MultiSelect
                    options={categoryOptions}
                    selected={formData.topCategories}
                    onChange={(val) => updateFormData('topCategories', val.slice(0, 10))}
                    placeholder={loadingCats ? "Loading categories..." : "Search and select top categories..."}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700">PAN Number *</Label>
                    <Input
                        placeholder="ABCDE1234F"
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 uppercase"
                        value={formData.panNumber}
                        onChange={(e) => updateFormData('panNumber', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700">GST Number *</Label>
                    <Input
                        placeholder="22AAAAA0000A1Z5"
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 uppercase"
                        value={formData.gstNumber}
                        onChange={(e) => updateFormData('gstNumber', e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
}
