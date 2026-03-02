"use client"

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import UserDetailView from '@/components/admin/users/UserDetailView'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, UserX } from 'lucide-react'

export default function UserDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: user, isLoading, error } = useUser(id as string)

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Admin', href: '/admin' },
            { label: 'Users', href: '/admin/users' },
            { label: 'User Details' }
        ])
    }, [setBreadcrumbs])

    if (isLoading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
                <p className="text-slate-500 font-medium">Loading user information...</p>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
                <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mb-2">
                    <UserX className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900">User Not Found</h1>
                <p className="text-slate-500 max-w-md mx-auto">
                    We couldn't find the user you're looking for. It might have been deleted or the ID is incorrect.
                </p>
                <Button
                    onClick={() => router.push('/admin/users')}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-8 font-bold mt-4"
                >
                    Back to Users
                </Button>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-slate-100 h-10 w-10"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Overview</h1>
                        <p className="text-slate-500 font-medium">Detailed profile and transaction history</p>
                    </div>
                </div>
            </div>

            <UserDetailView user={user} />
        </div>
    )
}
