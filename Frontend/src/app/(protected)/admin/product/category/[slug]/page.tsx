"use client"

import { useProductTypes } from '@/hooks/useProductTypes'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { ChevronsUpDown, Check, Search, LayoutGrid, Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useCategories, useSubcategories, useCategory, useCategoryActions } from '@/hooks/useCategories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CategoryTable from '@/components/admin/CategoryTable'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { useDebounce } from '@/hooks/useDebounce'

export default function CategoryListPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const { setBreadcrumbs } = useBreadcrumb()
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)
    const [selectedProductType, setSelectedProductType] = useState<string | undefined>(undefined)

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    const isRoot = slug === 'root'

    const { data: currentCategory, isLoading: isLoadingCategory } = useCategory(isRoot ? '' : slug)
    const { data: ptData } = useProductTypes({ isActive: true, limit: 100 })
    const productTypes = ptData?.productTypes || []

    useEffect(() => {
        const crumbs: { label: string; href?: string }[] = [
            { label: 'Categories', href: isRoot ? undefined : '/admin/product/category/root' }
        ]
        if (!isRoot && currentCategory) {
            crumbs.push({ label: currentCategory.name })
        }
        setBreadcrumbs(crumbs)
    }, [isRoot, currentCategory, setBreadcrumbs])

    // Using specialized hooks depending on if we are in Root or not
    const { data: rootData, isLoading: isLoadingRoot } = useCategories({
        page,
        limit: 10,
        search: debouncedSearch,
        productType: selectedProductType
    })

    const { data: subData, isLoading: isLoadingSub } = useSubcategories(
        !isRoot ? (currentCategory?._id || 'pending') : null,
        {
            page,
            limit: 10,
            search: debouncedSearch,
        }
    )

    const data = isRoot ? rootData : subData
    const isLoadingData = isRoot ? isLoadingRoot : isLoadingSub

    const { deleteCategory } = useCategoryActions()

    const handleDelete = async (id: string) => {
        await deleteCategory(id)
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {isRoot ? 'Product Categories' : `${currentCategory?.name || 'Subcategories'}`}
                    </h1>
                </div>

                <Button
                    onClick={() => router.push(`/admin/product/category/new/${slug}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl px-6"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    {isRoot ? 'New Category' : 'New Subcategory'}
                </Button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder={isRoot ? "Search categories..." : "Search subcategories..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500/20 w-full"
                    />
                </div>

                {isRoot && (
                    <div className="w-full md:w-72">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    role="combobox"
                                    className="justify-between w-full h-11 bg-slate-50 border-slate-200 rounded-xl font-medium"
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <LayoutGrid className="h-4 w-4 text-slate-400" />
                                        {selectedProductType
                                            ? productTypes.find((pt: any) => pt._id === selectedProductType)?.name
                                            : "All Product Types"}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search product types..." />
                                    <CommandList>
                                        <CommandEmpty>No product type found.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={() => {
                                                    setSelectedProductType(undefined)
                                                    setPage(1)
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", !selectedProductType ? "opacity-100" : "opacity-0")} />
                                                <span className='text-black'> All Product Types</span>
                                            </CommandItem>
                                            {productTypes.map((pt: any) => (
                                                <CommandItem
                                                    key={pt._id}
                                                    value={pt.name}
                                                    onSelect={() => {
                                                        setSelectedProductType(selectedProductType === pt._id ? undefined : pt._id)
                                                        setPage(1)
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", selectedProductType === pt._id ? "opacity-100" : "opacity-0")} />
                                                    {pt.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}
            </div>

            {isLoadingData || (isLoadingCategory && !isRoot) ? (
                <div className="h-64 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-slate-400">Loading your categories...</p>
                    </div>
                </div>
            ) : (
                <CategoryTable
                    categories={data?.categories || []}
                    total={data?.total || 0}
                    page={page}
                    limit={10}
                    onPageChange={setPage}
                    onDelete={handleDelete}
                />
            )}
        </div>
    )
}
