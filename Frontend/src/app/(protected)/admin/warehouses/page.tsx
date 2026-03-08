"use client"

import React, { useEffect } from 'react'
import WarehouseList from './_components/WarehouseList'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'

const WarehousesPage = () => {
    const { setBreadcrumbs } = useBreadcrumb()

    useEffect(() => {
        setBreadcrumbs([{ label: 'Warehouses' }])
    }, [setBreadcrumbs])

    return (
        <div className="p-4 md:p-8">
            <WarehouseList />
        </div>
    )
}

export default WarehousesPage
