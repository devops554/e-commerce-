"use client"

import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Eye, Search, Users, StoreIcon, Plus } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useAllSellers } from '@/hooks/useSellers'

export default function AdminSellerListPage() {
    const { data: sellers = [], isLoading } = useAllSellers()
    const [searchTerm, setSearchTerm] = useState('')

    const filteredSellers = sellers.filter((seller: any) =>
        seller.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'rejected': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Seller Management</h1>
                    <p className="text-gray-500 font-medium">
                        Review and manage seller registrations
                        {sellers.length > 0 && (
                            <span className="ml-2 text-xs font-black text-blue-600">{sellers.length} total</span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/seller/new">
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-slate-100">
                            <Plus className="mr-2 h-4 w-4" /> Add Seller
                        </Button>
                    </Link>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search sellers..."
                            className="pl-10 h-11 rounded-xl border-none shadow-sm ring-1 ring-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="font-bold text-gray-700 py-5 pl-8">Store Details</TableHead>
                            <TableHead className="font-bold text-gray-700">Owner</TableHead>
                            <TableHead className="font-bold text-gray-700">Registered</TableHead>
                            <TableHead className="font-bold text-gray-700">Status</TableHead>
                            <TableHead className="font-bold text-gray-700 pr-8 text-right">View</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse border-slate-50">
                                    <TableCell><div className="h-4 bg-slate-100 rounded w-3/4"></div></TableCell>
                                    <TableCell><div className="h-4 bg-slate-100 rounded w-1/2"></div></TableCell>
                                    <TableCell><div className="h-4 bg-slate-100 rounded w-1/3"></div></TableCell>
                                    <TableCell><div className="h-5 bg-slate-100 rounded-full w-16"></div></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            ))
                        ) : filteredSellers.length === 0 ? (
                            <TableRow className="border-none">
                                <TableCell colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="bg-slate-50 p-5 rounded-full">
                                            <StoreIcon className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <p className="text-gray-400 font-bold">No sellers found</p>
                                        {searchTerm && (
                                            <p className="text-gray-300 text-sm">Try a different search term</p>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSellers.map((seller: any) => (
                                <TableRow key={seller._id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                                    <TableCell className="py-5 pl-8">
                                        <div>
                                            <p className="font-black text-gray-900">{seller.storeName}</p>
                                            <p className="text-xs text-gray-400 font-medium capitalize">{seller.businessType}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{seller.name}</p>
                                            <p className="text-xs text-gray-400">{seller.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium text-gray-500">
                                        {seller.createdAt ? format(new Date(seller.createdAt), 'MMM dd, yyyy') : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`rounded-full border-none px-3 font-black text-[10px] uppercase tracking-wider ${getStatusStyle(seller.status)}`}>
                                            {seller.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="pr-8 text-right">
                                        <Link href={`/admin/seller/${seller.slug || seller._id}`}>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
