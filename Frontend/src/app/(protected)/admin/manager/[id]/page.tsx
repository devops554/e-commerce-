"use client"
import React, { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useWarehouseByManager } from '@/hooks/useWarehouses'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    Package,
    MapPin,
    Contact,
    Building2,
    ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const ManagerDetailsPage = () => {
    const { id } = useParams() as { id: string }
    const { setBreadcrumbs } = useBreadcrumb()

    const { data: manager, isLoading: isUserLoading } = useUser(id)
    const { data: warehouse, isLoading: isWarehouseLoading } = useWarehouseByManager(id)

    useEffect(() => {
        if (manager) {
            setBreadcrumbs([
                { label: 'Admin Dashboard', href: '/admin' },
                { label: 'Warehouse Managers', href: '/admin/manager' },
                { label: manager.name }
            ])
        }
    }, [manager, setBreadcrumbs])

    if (isUserLoading || isWarehouseLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-[400px] md:col-span-1 rounded-2xl shadow-xl shadow-slate-200/50" />
                    <Skeleton className="h-[400px] md:col-span-2 rounded-2xl shadow-xl shadow-slate-200/50" />
                </div>
            </div>
        )
    }

    if (!manager) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500 font-bold">Manager not found.</p>
                <Link href="/admin/manager">
                    <Button variant="link">Back to list</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/manager">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-md transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manager Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Info Card */}
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                    <div className="h-24 bg-slate-900" />
                    <CardContent className="relative pt-0 px-6 pb-8 text-center">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                            <div className="h-24 w-24 rounded-3xl bg-white p-1 shadow-lg">
                                <div className="h-full w-full rounded-[20px] bg-slate-50 flex items-center justify-center">
                                    <User className="h-10 w-10 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 space-y-2">
                            <h2 className="text-xl font-black text-slate-900">{manager.name}</h2>
                            <Badge variant="outline" className="rounded-lg font-black uppercase tracking-wider text-[10px] px-3 py-1 bg-slate-50 border-slate-100 text-slate-500">
                                {manager.role}
                            </Badge>
                        </div>

                        <div className="mt-8 space-y-4 text-left border-t border-slate-50 pt-8">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Email Address</p>
                                    <p className="font-bold text-slate-900 text-sm mt-0.5">{manager.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Account Status</p>
                                    <Badge variant={manager.status === 'active' ? 'default' : 'secondary'} className="rounded-lg font-bold mt-1">
                                        {manager.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Joined Platform</p>
                                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                                        {new Date(manager.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Warehouse Info Card */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="p-8 border-b border-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Assigned Facility</CardTitle>
                                </div>
                                {warehouse && (
                                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none font-black px-4 py-1.5 rounded-full">
                                        Assigned
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            {warehouse ? (
                                <div className="space-y-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                        <div className="flex items-center gap-5">
                                            <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                                <Package className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900">{warehouse.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Facility Code:</span>
                                                    <span className="text-xs font-black text-blue-600 px-2 py-0.5 bg-blue-50 rounded-lg">{warehouse.code}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/admin/warehouses`}>
                                            <Button variant="outline" className="rounded-xl font-black px-6 border-slate-200 hover:bg-white hover:shadow-lg transition-all">
                                                Manage Facility
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <MapPin className="h-3 w-3" /> Location Information
                                            </h4>
                                            <div className="bg-slate-50/30 p-4 rounded-2xl border border-slate-50 space-y-1">
                                                <p className="font-bold text-slate-900 leading-relaxed text-sm">
                                                    {warehouse.address.addressLine1}
                                                    {warehouse.address.addressLine2 && `, ${warehouse.address.addressLine2}`}
                                                </p>
                                                <p className="font-medium text-slate-500 text-sm">
                                                    {warehouse.address.city}, {warehouse.address.state}, {warehouse.address.country}
                                                </p>
                                                <p className="font-black text-slate-400 text-xs mt-2">PIN: {warehouse.address.pincode}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Contact className="h-3 w-3" /> Facility Contact
                                            </h4>
                                            <div className="bg-slate-50/30 p-4 rounded-2xl border border-slate-50 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-500">Person</span>
                                                    <span className="text-xs font-black text-slate-900">{warehouse.contact.contactPerson}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-500">Email</span>
                                                    <span className="text-xs font-black text-slate-900">{warehouse.contact.email}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-500">Phone</span>
                                                    <span className="text-xs font-black text-slate-900">{warehouse.contact.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                    <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                                        <Package className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900">No facility assigned yet</p>
                                        <p className="text-sm font-bold text-slate-400 max-w-xs mt-1">
                                            This manager has no facility assigned. You can assign one in the warehouse settings.
                                        </p>
                                    </div>
                                    <Link href="/admin/warehouses">
                                        <Button className="bg-slate-900 hover:bg-black text-white font-black px-8 rounded-xl h-11 shadow-lg shadow-slate-200 mt-2">
                                            Assign Warehouse
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ManagerDetailsPage
