"use client"
import React, { useEffect } from 'react'
import UserTable from '../users/_componet/UserTable'
import { UserRole } from '@/services/user.service'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'

export default function SubAdminPage() {
    const { setBreadcrumbs } = useBreadcrumb()
    useEffect(() => {
        setBreadcrumbs([{ label: 'Sub-Admins' }])
    }, [setBreadcrumbs])

    return (
        <div className='p-4'>
            <UserTable role={UserRole.SUB_ADMIN} />
        </div>
    )
}
