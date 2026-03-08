"use client"
import React, { useState, useCallback } from 'react'
import { useAllUsers, useUpdateStatus } from '@/hooks/useUser'
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
import { useDebounce } from '@/hooks/useDebounce'
import Link from 'next/link'
import { UserRole, UserProfile } from '@/services/user.service'

const STATUSES = ['all', 'active', 'inactive', 'blocked']
const LIMITS = ['10', '20', '50']

const ManagerTable = () => {
    const [page, setPage] = useState('1')
    const [limit, setLimit] = useState('10')
    const [status, setStatus] = useState('all')
    const [searchInput, setSearchInput] = useState('')

    const search = useDebounce(searchInput, 400)

    const { data, isLoading, isFetching } = useAllUsers(
        page,
        limit,
        UserRole.MANAGER,
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
            blocked: 'destructive',
        }
        return map[s] ?? 'outline'
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search managers..."
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value)
                            setPage('1')
                        }}
                        className="pl-9 h-11 rounded-xl"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Select value={status} onValueChange={handleFilterChange(setStatus)}>
                        <SelectTrigger className="w-36 h-11 rounded-xl">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={limit} onValueChange={handleFilterChange(setLimit)}>
                        <SelectTrigger className="w-24 h-11 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {LIMITS.map((l) => (
                                <SelectItem key={l} value={l}>
                                    {l} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Link href="/admin/manager/register">
                        <Button className="h-11 rounded-xl bg-slate-900 hover:bg-black text-white font-black px-6 shadow-lg shadow-slate-200 gap-2">
                            <UserPlus className="h-4 w-4" />
                            Add Manager
                        </Button>
                    </Link>

                    {isFetching && (
                        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>
            </div>

            <div className="rounded-2xl border bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[200px] font-bold py-4">Name</TableHead>
                            <TableHead className="font-bold py-4">Email</TableHead>
                            <TableHead className="font-bold py-4">Status</TableHead>
                            <TableHead className="font-bold py-4">Joined</TableHead>
                            <TableHead className="text-right font-bold py-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: Number(limit) }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 5 }).map((__, j) => (
                                        <TableCell key={j} className="py-4">
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                                    No managers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user: UserProfile) => (
                                <TableRow key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-bold text-slate-900 py-4">{user.name}</TableCell>
                                    <TableCell className="text-slate-500 py-4">{user.email}</TableCell>
                                    <TableCell className="py-4">
                                        <Badge variant={statusVariant(user.status)} className="capitalize rounded-lg px-2.5 py-0.5">
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm py-4">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString()
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-right py-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl hover:bg-slate-100"
                                                    disabled={isUpdating}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/manager/${user._id}`} className="cursor-pointer font-bold">
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                {STATUSES.filter((s) => s !== 'all' && s !== user.status).map(
                                                    (s) => (
                                                        <DropdownMenuItem
                                                            key={s}
                                                            onClick={() =>
                                                                updateStatus({ id: user._id, status: s })
                                                            }
                                                            className="capitalize font-bold"
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

            <div className="flex items-center justify-between text-sm font-bold text-slate-500 px-2">
                <span>
                    {total > 0
                        ? `Showing ${(Number(page) - 1) * Number(limit) + 1}–${Math.min(
                            Number(page) * Number(limit),
                            total,
                        )} of ${total} managers`
                        : 'No results'}
                </span>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-9 w-9"
                        onClick={() => handlePageChange(Number(page) - 1)}
                        disabled={page === '1' || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-1">
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
                                    <span key={`ellipsis-${idx}`} className="px-2 self-center">
                                        …
                                    </span>
                                ) : (
                                    <Button
                                        key={p}
                                        variant={String(p) === page ? 'default' : 'ghost'}
                                        className={`rounded-xl h-9 w-9 font-bold ${String(p) === page ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                                        onClick={() => handlePageChange(Number(p))}
                                        disabled={isLoading}
                                    >
                                        {p}
                                    </Button>
                                ),
                            )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-9 w-9"
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

export default ManagerTable
