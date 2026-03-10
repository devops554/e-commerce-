"use client"
import DeliveryPartnerForm from '@/components/delivery-partners/DeliveryPartnerForm'

const RegisterPartnerPage = () => {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Register Partner</h1>
                    <p className="text-slate-500 font-bold">Create a new delivery partner account</p>
                </div>
            </div>

            <DeliveryPartnerForm mode="register" />
        </div>
    )
}

export default RegisterPartnerPage