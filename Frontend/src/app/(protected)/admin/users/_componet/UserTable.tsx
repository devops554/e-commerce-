"use client"
import React, { useState, useCallback } from 'react'
import { useAllUsers, useUpdateStatus } from '@/hooks/useUser' // adjust import path
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
    UserPlus,
} from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce' // adjust or inline debounce
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/providers/AuthContext'
import { UserRole } from '@/services/user.service'


const STATUSES = ['all', 'active', 'inactive', 'banned']
const LIMITS = ['10', '20', '50']

const UserTable = ({ role }: { role?: string }) => {
    const { user } = useAuth()
    const [page, setPage] = useState('1')
    const [limit, setLimit] = useState('10')
    const [status, setStatus] = useState('all')
    const [searchInput, setSearchInput] = useState('')
    const path = usePathname()

    const search = useDebounce(searchInput, 400)

    const { data, isLoading, isFetching } = useAllUsers(
        page,
        limit,
        role === 'all' ? undefined : role,
        status === 'all' ? undefined : status,
        search || undefined,
    )

    const { mutate: updateStatus, isPending: isUpdating } = useUpdateStatus()

    const users = data?.users ?? []
    const total = data?.total ?? 0
    const totalPages = Math.ceil(total / Number(limit)) || 1

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
        const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            inactive: 'secondary',
            banned: 'destructive',
        }
        return map[s] ?? 'outline'
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value)
                            setPage('1')
                        }}
                        className="pl-9"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">


                    {/* Status filter */}
                    <Select value={status} onValueChange={handleFilterChange(setStatus)}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Rows per page */}
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
                    {(path === '/admin/subadmin' && user?.role === UserRole.ADMIN) && (
                        <Link href="/admin/subadmin/register">
                            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-10 px-4">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Sub-admin
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
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
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user: any) => (
                                <TableRow key={user._id ?? user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant(user.status)} className="capitalize">
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString()
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={isUpdating}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/users/${user._id ?? user.id}`} className="cursor-pointer">
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                {STATUSES.filter((s) => s !== 'all' && s !== user.status).map(
                                                    (s) => (
                                                        <DropdownMenuItem
                                                            key={s}
                                                            onClick={() =>
                                                                updateStatus({ id: user._id ?? user.id, status: s })
                                                            }
                                                            className="capitalize"
                                                        >
                                                            Set {s}
                                                        </DropdownMenuItem>
                                                    ),
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
                        )} of ${total} users`
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

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                            (p) =>
                                p === 1 ||
                                p === totalPages ||
                                Math.abs(p - Number(page)) <= 1,
                        )
                        .reduce<(number | string)[]>((acc, p, idx, arr) => {
                            if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
                                acc.push('…')
                            }
                            acc.push(p)
                            return acc
                        }, [])
                        .map((p, idx) =>
                            p === '…' ? (
                                <span key={`ellipsis-${idx}`} className="px-1">
                                    …
                                </span>
                            ) : (
                                <Button
                                    key={p}
                                    variant={String(p) === page ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => handlePageChange(Number(p))}
                                    disabled={isLoading}
                                >
                                    {p}
                                </Button>
                            ),
                        )}

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

export default UserTable