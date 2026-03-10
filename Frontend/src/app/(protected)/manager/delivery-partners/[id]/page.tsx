"use client"

import React, { useEffect } from 'react'
import DeliveryPartnerDetail from '@/components/delivery-partners/DeliveryPartnerDetail'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { useDeliveryPartnerById } from '@/hooks/useDeliveryPartners'
import { useParams } from 'next/navigation'

const ManagerDeliveryPartnerDetailPage = () => {
    const params = useParams()
    const id = params.id as string
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: partner } = useDeliveryPartnerById(id)

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Manager Dashboard', href: '/manager' },
            { label: 'Delivery Partners', href: '/manager/delivery-partners' },
            { label: partner?.name || 'Partner Details' }
        ])
    }, [setBreadcrumbs, partner])

    return (
        <div className="p-0">
            <DeliveryPartnerDetail id={id} />
        </div>
    )
}

export default ManagerDeliveryPartnerDetailPage
