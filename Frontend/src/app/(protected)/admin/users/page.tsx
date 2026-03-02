"use client"
import React, { useEffect } from 'react'
import UserTable from './_componet/UserTable'
import { UserRole } from '@/services/user.service'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'


const UsersPage = () => {
    const { setBreadcrumbs } = useBreadcrumb()
    useEffect(() => {
        setBreadcrumbs([{ label: 'Customers' }])
    }, [setBreadcrumbs])
    return (
        <div className='p-4'>
            <UserTable role={UserRole.CUSTOMER} />
        </div>
    )
}

export default UsersPage