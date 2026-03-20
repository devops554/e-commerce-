"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import ProductTable from '@/components/admin/ProductTable'
import ProductFilters from '@/components/admin/ProductFilters'
import { useProducts, useProductActions } from '@/hooks/useProducts'

import { useBreadcrumb } from '@/providers/BreadcrumbContext'

import { useDebounce } from '@/hooks/useDebounce'

export default function ProductsPage() {
    const router = useRouter()
    const { setBreadcrumbs } = useBreadcrumb()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 500)
    const [filters, setFilters] = useState<any>({})

    useEffect(() => {
        setBreadcrumbs([{ label: 'Products' }])
    }, [setBreadcrumbs])

    const limit = 10

    const { data, isLoading } = useProducts({
    page,
    limit,
    search: debouncedSearch,
    sort: '-createdAt',
    ...filters
    })

    const { deleteProduct } = useProductActions()

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
    }

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters)
        setPage(1)
    }

    const handleDelete = async (id: string) => {
        await deleteProduct(id)
    }

    return (
        <div className="space-y-8 p-6 lg:p-10 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Products</h1>
                    <p className="text-slate-500 font-medium">Manage your product inventory and variants</p>
                </div>
                <Button
                    onClick={() => router.push('/admin/product/new')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-12 px-6 shadow-lg shadow-blue-100"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Add New Product
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search products by title, slug or SKU..."
                        value={search}
                        onChange={handleSearch}
                        className="pl-10 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                </div>
                <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>

            {isLoading ? (
                <div className="h-[400px] w-full bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-bold">Loading products...</p>
                    </div>
                </div>
            ) : (
                <ProductTable
                    products={data?.products || []}
                    total={data?.total || 0}
                    page={page}
                    limit={limit}
                    onPageChange={setPage}
                    onDelete={handleDelete}
                />
            )}
        </div>
    )
}
