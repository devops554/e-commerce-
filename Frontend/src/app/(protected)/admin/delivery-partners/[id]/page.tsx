import React from 'react'
import DeliveryPartnerDetail from '../_components/DeliveryPartnerDetail'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    return (
        <div className="p-6">
            <DeliveryPartnerDetail id={id} />
        </div>
    )
}

export default Page
