"use client"

import React from 'react'
import { Search, ChevronDown, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSubcategories } from '@/hooks/useCategories'

interface Brand {
    name: string;
    logo?: string;
}

interface SubCategoryFilterBarProps {
    parentId: string;
    search: string;
    setSearch: (s: string) => void;
    selectedBrands: string[];
    setSelectedBrands: (brands: string[]) => void;
    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;
    availableBrands: Brand[];
}

export const SubCategoryFilterBar = ({
    parentId,
    search,
    setSearch,
    selectedBrands,
    setSelectedBrands,
    priceRange,
    setPriceRange,
    availableBrands
}: SubCategoryFilterBarProps) => {
    const params = useParams()
    const currentSlug = params.slug as string
    const [tempPriceMin, setTempPriceMin] = React.useState(priceRange[0])
    const [tempPriceMax, setTempPriceMax] = React.useState(priceRange[1])

    // Fetch sibling subcategories
    const { data: subData } = useSubcategories(parentId, {
        isActive: true,
        limit: 50
    })
    const siblings = subData?.categories || []

    const toggleBrand = (brandName: string) => {
        if (selectedBrands.includes(brandName)) {
            setSelectedBrands(selectedBrands.filter(b => b !== brandName))
        } else {
            setSelectedBrands([...selectedBrands, brandName])
        }
    }

    const scrollRef = React.useRef<HTMLDivElement>(null)
    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return
        const amount = dir === 'left' ? -200 : 200
        scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }

    return (
        <div className="flex flex-col gap-6 mb-8">
            {/* Sibling Subcategory Scroller */}
            {siblings.length > 1 && (
                <div className="relative group/siblings">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Related Categories</h3>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => scroll('left')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => scroll('right')}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div 
                        ref={scrollRef}
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
                    >
                        {siblings.map((sibling) => {
                            const isActive = currentSlug === sibling.slug
                            const displayImage = sibling.image || sibling.productType?.image
                            return (
                                <Link
                                    key={sibling._id}
                                    href={`/subcategory/${sibling.slug}`}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl shrink-0 border transition-all duration-200 ${
                                        isActive 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="relative h-6 w-6 rounded-md overflow-hidden bg-slate-50">
                                        {displayImage ? (
                                            <Image src={displayImage} alt={sibling.name} fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-[10px] font-bold uppercase">
                                                {sibling.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold whitespace-nowrap">{sibling.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Main Filter Bar */}
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="rounded-xl border-slate-200 h-10 w-10 shrink-0">
                    <SlidersHorizontal className="h-4 w-4 text-slate-600" />
                </Button>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-xl border-slate-200 h-10 gap-2 shrink-0 font-bold text-slate-700">
                            Brand <ChevronDown className="h-4 w-4 text-slate-400" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-[32px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Select Brands</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[300px] mt-4 pr-4">
                            <div className="space-y-4">
                                {availableBrands.map((brand) => (
                                    <div key={brand.name} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg border border-slate-100 p-1 flex items-center justify-center bg-white">
                                                {brand.logo ? (
                                                    <Image src={brand.logo} alt={brand.name} width={32} height={32} className="object-contain" />
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-400">{brand.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <span className="font-bold text-slate-700">{brand.name}</span>
                                        </div>
                                        <Checkbox
                                            checked={selectedBrands.includes(brand.name)}
                                            onCheckedChange={() => toggleBrand(brand.name)}
                                            className="h-5 w-5 rounded-md"
                                        />
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>

                <div className="flex-1 hidden md:flex overflow-hidden relative group/scroller">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                        {availableBrands.map((brand) => (
                            <Button
                                key={brand.name}
                                variant="outline"
                                onClick={() => toggleBrand(brand.name)}
                                className={`rounded-xl h-10 gap-2 shrink-0 font-bold transition-all border-slate-200 ${selectedBrands.includes(brand.name)
                                    ? 'bg-indigo-600/5 border-indigo-600 text-indigo-600'
                                    : 'bg-white hover:bg-slate-50 text-slate-700'
                                    }`}
                            >
                                {brand.name}
                            </Button>
                        ))}
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-xl border-slate-200 h-10 gap-2 shrink-0 font-bold text-slate-700">
                            Price <ChevronDown className="h-4 w-4 text-slate-400" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[320px] rounded-[32px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Price Range</DialogTitle>
                        </DialogHeader>
                        <div className="py-6 space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Min</label>
                                    <Input
                                        type="number"
                                        value={tempPriceMin}
                                        onChange={(e) => setTempPriceMin(Number(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Max</label>
                                    <Input
                                        type="number"
                                        value={tempPriceMax}
                                        onChange={(e) => setTempPriceMax(Number(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                            <Button
                                className="w-full rounded-2xl font-bold py-4 bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => setPriceRange([tempPriceMin, tempPriceMax])}
                            >
                                Apply Price
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Active Filters */}
            {(selectedBrands.length > 0 || search || priceRange[0] > 0 || priceRange[1] < 100000) && (
                <div className="flex flex-wrap gap-2">
                    {selectedBrands.map(b => (
                        <div key={b} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                            {b}
                            <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => toggleBrand(b)} />
                        </div>
                    ))}
                    {search && (
                        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                            Q: {search}
                            <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSearch('')} />
                        </div>
                    )}
                    {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                            ₹{priceRange[0]} - ₹{priceRange[1]}
                            <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setPriceRange([0, 100000])} />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
