"use client"
import React, { useEffect } from 'react'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ManagerRegistrationForm from '../_components/ManagerRegistrationForm'

const ManagerRegisterPage = () => {
    const { setBreadcrumbs } = useBreadcrumb()

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Warehouse Managers', href: '/admin/manager' },
            { label: 'Register Manager' }
        ])
    }, [setBreadcrumbs])

    return (
        <div className="p-6 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/manager">
                    <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-white hover:shadow-md transition-all h-12 w-12">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Register Manager</h1>
                    <p className="text-slate-500 font-bold mt-1">Add a new warehouse manager to the system.</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <ManagerRegistrationForm />
            </div>
        </div>
    )
}

export default ManagerRegisterPage
