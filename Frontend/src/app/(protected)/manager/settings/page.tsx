"use client"

import React, { useEffect } from 'react'
import { useAuth } from '@/providers/AuthContext'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import {
    Settings,
    Warehouse as WarehouseIcon,
    Phone,
    Mail,
    MapPin,
    User,
    Shield,
    Bell,
    ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const ManagerSettingsPage = () => {
    const { user } = useAuth()
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: warehouse, isLoading } = useManagerWarehouse()

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Manager Dashboard', href: '/manager' },
            { label: 'Settings' }
        ])
    }, [setBreadcrumbs])

    if (isLoading) {
        return <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <Skeleton className="h-[300px] w-full rounded-2xl" />
        </div>
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
                    <p className="text-slate-500 font-bold mt-1">Manage your facility profile and preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Warehouse Details */}
                <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 rounded-[40px] overflow-hidden">
                    <CardHeader className="p-10 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-3xl bg-slate-900 flex items-center justify-center text-white">
                                <WarehouseIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Facility Information</CardTitle>
                                <CardDescription className="font-bold text-slate-400">Core details of your assigned warehouse</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Facility Name</label>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900">
                                    {warehouse?.name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Facility Code</label>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900">
                                    {warehouse?.code}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Address</label>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                                <div className="font-bold text-slate-700 leading-relaxed">
                                    {warehouse?.address.addressLine1}, {warehouse?.address.addressLine2 && warehouse?.address.addressLine2 + ','}<br />
                                    {warehouse?.address.city}, {warehouse?.address.state} - {warehouse?.address.pincode}<br />
                                    {warehouse?.address.country}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contact Phone</label>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 font-bold text-slate-900">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    {warehouse?.contact.phone}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contact Email</label>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 font-bold text-slate-900">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    {warehouse?.contact.email}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account & Security */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[40px] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black text-slate-900">Your Account</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white italic font-black">
                                    {user?.name?.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900">{user?.name}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Warehouse Manager</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full rounded-2xl py-6 border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
                                <Shield className="h-4 w-4 mr-2" />
                                Change Password
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black">Support</CardTitle>
                                <Badge className="bg-white/10 hover:bg-white/20 text-white/80 border-none font-bold">24/7</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                Need help with inventory issues or system access? Reach out to the admin support team.
                            </p>
                            <Button className="w-full rounded-2xl py-6 bg-white text-slate-900 hover:bg-slate-100 font-black">
                                Contact IT Support
                                <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ManagerSettingsPage
