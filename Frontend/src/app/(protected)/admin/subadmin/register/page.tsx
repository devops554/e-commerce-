"use client"

import React, { useEffect } from 'react'
import RegisterSubAdminForm from '@/components/admin/users/RegisterSubAdminForm'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RegisterSubAdminPage() {
    const { setBreadcrumbs } = useBreadcrumb()
    const router = useRouter()

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Users', href: '/admin/users' },
            { label: 'Register Sub-admin' }
        ])
    }, [setBreadcrumbs])

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-slate-100"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sub-admin Creation</h1>
                    <p className="text-slate-500 font-medium">Add a new team member with administrative access</p>
                </div>
            </div>

            <div className="mt-8">
                <RegisterSubAdminForm />
            </div>
        </div>
    )
}
