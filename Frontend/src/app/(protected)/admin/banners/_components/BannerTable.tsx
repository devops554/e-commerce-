"use client"
import React, { useState, useCallback } from 'react'
import { useBanners, useDeleteBanner, useUpdateBanner } from '@/hooks/useBanner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    ChevronLeft,
    ChevronRight,
    Search,
    MoreHorizontal,
    RefreshCw,
    Plus,
    Edit,
    Trash2,
} from 'lucide-react'
import { BannerStatus, BANNER_TYPE } from '@/services/banner.service'
import { useDebounce } from '@/hooks/useDebounce'
import Image from 'next/image'

const STATUSES = ['all', ...Object.values(BannerStatus)]
const PAGES = ['all', ...Object.values(BANNER_TYPE)]
const LIMITS = ['10', '20', '50']

interface BannerTableProps {
    onEdit: (id: string) => void
    onCreate: () => void
}

const BannerTable = ({ onEdit, onCreate }: BannerTableProps) => {
    const [page, setPage] = useState('1')
    const [limit, setLimit] = useState('10')
    const [status, setStatus] = useState('all')
    const [pageFilter, setPageFilter] = useState('all')
    const [searchInput, setSearchInput] = useState('')

    const search = useDebounce(searchInput, 400)

    const { data, isLoading, isFetching } = useBanners({
        page,
        limit,
        status: status === 'all' ? undefined : status as BannerStatus,
        pages: pageFilter === 'all' ? undefined : pageFilter,
    })

    const { mutate: deleteBanner } = useDeleteBanner()
    const { mutate: updateBanner } = useUpdateBanner()

    const banners = data?.banners ?? []
    const total = data?.total ?? 0
    const totalPages = data?.totalPages ?? 1

    const handlePageChange = useCallback(
        (newPage: number) => {
            if (newPage < 1 || newPage > totalPages) return
            setPage(String(newPage))
        },
        [totalPages],
    )

    const handleFilterChange = useCallback(
        (setter: React.Dispatch<React.SetStateAction<string>>) =>
            (value: string) => {
                setter(value)
                setPage('1')
            },
        [],
    )

    const statusVariant = (s: string) => {
        return s === BannerStatus.ACTIVE ? 'default' : 'secondary'
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Button onClick={onCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Banner
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Select value={status} onValueChange={handleFilterChange(setStatus)}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="capitalize">
                                    {s.toLowerCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={pageFilter} onValueChange={handleFilterChange(setPageFilter)}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Page" />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGES.map((p) => (
                                <SelectItem key={p} value={p} className="capitalize">
                                    {p.toLowerCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={limit} onValueChange={handleFilterChange(setLimit)}>
                        <SelectTrigger className="w-24">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LIMITS.map((l) => (
                                <SelectItem key={l} value={l}>
                                    {l} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {isFetching && (
                        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Pages</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: Number(limit) }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 6 }).map((__, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : banners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                    No banners found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            banners.map((banner: any) => (
                                <TableRow key={banner._id}>
                                    <TableCell>
                                        <div className="relative h-12 w-20 overflow-hidden rounded-md border bg-muted">
                                            {banner.backgroundImage ? (
                                                <Image
                                                    src={banner.backgroundImage}
                                                    alt={banner.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div>
                                            {banner.title}
                                            {banner.subtitle && (
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {banner.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {banner.pages.map((p: string) => (
                                                <Badge key={p} variant="outline" className="text-[10px] capitalize">
                                                    {p.toLowerCase()}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant(banner.status)} className="capitalize">
                                            {banner.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {banner.createdBy?.name || 'Unknown'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(banner._id)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            updateBanner({
                                                                id: banner._id,
                                                                data: {
                                                                    status:
                                                                        banner.status === BannerStatus.ACTIVE
                                                                            ? BannerStatus.INACTIVE
                                                                            : BannerStatus.ACTIVE,
                                                                },
                                                            })
                                                        }
                                                    >
                                                        {banner.status === BannerStatus.ACTIVE
                                                            ? 'Deactivate'
                                                            : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this banner?')) {
                                                                deleteBanner(banner._id)
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    {total > 0
                        ? `Showing ${(Number(page) - 1) * Number(limit) + 1}–${Math.min(
                            Number(page) * Number(limit),
                            total,
                        )} of ${total} banners`
                        : 'No results'}
                </span>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(Number(page) - 1)}
                        disabled={page === '1' || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center px-4 font-medium text-foreground">
                        Page {page} of {totalPages}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(Number(page) + 1)}
                        disabled={page === String(totalPages) || isLoading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default BannerTable
