"use client"
import React, { useEffect } from 'react'
import ManagerTable from './_components/ManagerTable'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users2 } from 'lucide-react'

const ManagersPage = () => {
    const { setBreadcrumbs } = useBreadcrumb()

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Warehouse Managers' }
        ])
    }, [setBreadcrumbs])

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <Users2 className="h-5 w-5" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Warehouse Managers</h1>
                    </div>
                    <p className="text-slate-500 font-bold pl-12">Manage and monitor facility managers across all locations.</p>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                <CardContent className="p-6 bg-white">
                    <ManagerTable />
                </CardContent>
            </Card>
        </div>
    )
}

export default ManagersPage
