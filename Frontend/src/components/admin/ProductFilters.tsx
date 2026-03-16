"use client"

import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter, X, Check, ChevronsUpDown } from "lucide-react"
import { useCategories, useSubcategories } from '@/hooks/useCategories'
import { useProductTypes } from '@/hooks/useProductTypes'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface ProductFiltersProps {
    filters: {
        productType?: string;
        category?: string;
        subCategory?: string;
        brand?: string;
        isActive?: string;
    };
    onFilterChange: (filters: any) => void;
}

export default function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
    const { data: ptData } = useProductTypes({ limit: 100 })
    const { data: catData } = useCategories({ limit: 100 })
    const { data: subData } = useSubcategories(filters.category, { limit: 100 })

    const productTypes = ptData?.productTypes || []
    const categories = catData?.categories || []
    const subCategories = subData?.categories || []

    const resetFilters = () => {
        onFilterChange({
            productType: undefined,
            category: undefined,
            subCategory: undefined,
            brand: undefined,
            isActive: undefined,
        })
    }

    const activeCount = Object.values(filters).filter(v => v !== undefined).length

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 relative">
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeCount > 0 && (
                        <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                            {activeCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-xl font-bold">Filters</SheetTitle>
                        {activeCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-red-500 h-8 px-2 hover:text-red-600 hover:bg-red-50">
                                <X className="h-4 w-4 mr-1" />
                                Clear All
                            </Button>
                        )}
                    </div>
                    <SheetDescription>
                        Narrow down your product search
                    </SheetDescription>
                </SheetHeader>

                <div className="px-6 py-6 space-y-6">
                    {/* Product Type */}
                    <div className="space-y-3 flex flex-col">
                        <Label className="text-sm font-bold text-slate-700">Product Type</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="justify-between w-full h-11 bg-white border-slate-200">
                                    {filters.productType
                                        ? productTypes.find((pt: any) => pt._id === filters.productType)?.name
                                        : "Select product type..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search product types..." />
                                    <CommandList>
                                        <CommandEmpty>No product type found.</CommandEmpty>
                                        <CommandGroup>
                                            {productTypes.map((pt: any) => (
                                                <CommandItem
                                                    key={pt._id}
                                                    value={pt.name}
                                                    onSelect={() => {
                                                        onFilterChange({
                                                            ...filters,
                                                            productType: filters.productType === pt._id ? undefined : pt._id,
                                                            category: undefined, // Reset child filters
                                                            subCategory: undefined
                                                        })
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", filters.productType === pt._id ? "opacity-100" : "opacity-0")} />
                                                    {pt.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Category */}
                    <div className="space-y-3 flex flex-col">
                        <Label className="text-sm font-bold text-slate-700">Category</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="justify-between w-full h-11 bg-white border-slate-200" disabled={!filters.productType}>
                                    {filters.category
                                        ? categories.find((c: any) => c._id === filters.category)?.name
                                        : "Select category..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search category..." />
                                    <CommandList>
                                        <CommandEmpty>No category found.</CommandEmpty>
                                        <CommandGroup>
                                            {categories.filter((c: any) => c.productType === filters.productType || (typeof c.productType === 'object' && c.productType._id === filters.productType)).map((cat: any) => (
                                                <CommandItem
                                                    key={cat._id}
                                                    value={cat.name}
                                                    onSelect={() => {
                                                        onFilterChange({
                                                            ...filters,
                                                            category: filters.category === cat._id ? undefined : cat._id,
                                                            subCategory: undefined // Reset sub filter
                                                        })
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", filters.category === cat._id ? "opacity-100" : "opacity-0")} />
                                                    {cat.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Subcategory */}
                    <div className="space-y-3 flex flex-col">
                        <Label className="text-sm font-bold text-slate-700">Subcategory</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="justify-between w-full h-11 bg-white border-slate-200" disabled={!filters.category}>
                                    {filters.subCategory
                                        ? subCategories.find((c: any) => c._id === filters.subCategory)?.name
                                        : "Select subcategory..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search subcategory..." />
                                    <CommandList>
                                        <CommandEmpty>No subcategory found.</CommandEmpty>
                                        <CommandGroup>
                                            {subCategories.map((sub: any) => (
                                                <CommandItem
                                                    key={sub._id}
                                                    value={sub.name}
                                                    onSelect={() => {
                                                        onFilterChange({ ...filters, subCategory: filters.subCategory === sub._id ? undefined : sub._id })
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", filters.subCategory === sub._id ? "opacity-100" : "opacity-0")} />
                                                    {sub.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-700">Status</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={filters.isActive === 'true' ? "default" : "outline"}
                                size="sm"
                                className="flex-1 rounded-xl"
                                onClick={() => onFilterChange({ ...filters, isActive: filters.isActive === 'true' ? undefined : 'true' })}
                            >
                                Active
                            </Button>
                            <Button
                                variant={filters.isActive === 'false' ? "default" : "outline"}
                                size="sm"
                                className="flex-1 rounded-xl"
                                onClick={() => onFilterChange({ ...filters, isActive: filters.isActive === 'false' ? undefined : 'false' })}
                            >
                                Inactive
                            </Button>
                        </div>
                    </div>

                    {/* Brand */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-700 text-left block">Brand</Label>
                        <Input
                            placeholder="Enter brand name..."
                            value={filters.brand || ''}
                            onChange={(e) => onFilterChange({ ...filters, brand: e.target.value || undefined })}
                            className="rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-slate-50/50">
                    <Button className="w-full rounded-2xl h-12 text-md font-bold" onClick={() => (document.querySelector('[data-radix-collection-item]') as any)?.click()}>
                        Apply Filters
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
