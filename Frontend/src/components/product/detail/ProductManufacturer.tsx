'use client'
import React from 'react'
import { Truck, ShieldCheck, Info } from 'lucide-react'

interface ManufacturerInfo {
    name?: string
    address?: string
    countryOfOrigin?: string
    selfLife?: string
}

interface CustomerCare {
    name?: string
    address?: string
    email?: string
    phone?: string
}

interface Props {
    manufacturerInfo?: ManufacturerInfo
    warranty?: string
    disclaimer?: string
    customerCareDetails?: CustomerCare
}

export function ProductManufacturer({ manufacturerInfo, warranty, disclaimer, customerCareDetails }: Props) {
    const hasMfg = manufacturerInfo && (manufacturerInfo.name || manufacturerInfo.address || manufacturerInfo.countryOfOrigin || manufacturerInfo.selfLife)
    const hasCare = customerCareDetails && (customerCareDetails.name || customerCareDetails.email || customerCareDetails.phone)
    const hasInfo = hasMfg || warranty || disclaimer || hasCare

    if (!hasInfo) return null

    return (
        <div className=" space-y-6">

            {(hasMfg || warranty) && (
                <div className="space-y-3 border-slate-100 bg-white p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-slate-400" />
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Manufacturer Info</h3>
                    </div>
                    {manufacturerInfo?.name && (
                        <div className="flex justify-between items-start py-2 border-b border-dashed border-slate-100">
                            <span className="text-xs font-semibold text-slate-500">Manufacturer</span>
                            <span className="text-xs text-slate-800 font-medium text-right">{manufacturerInfo.name}</span>
                        </div>
                    )}
                    {manufacturerInfo?.address && (
                        <div className="flex justify-between items-start py-2 border-b border-dashed border-slate-100">
                            <span className="text-xs font-semibold text-slate-500">Address</span>
                            <span className="text-xs text-slate-800 font-medium text-right max-w-[60%]">{manufacturerInfo.address}</span>
                        </div>
                    )}
                    {manufacturerInfo?.countryOfOrigin && (
                        <div className="flex justify-between items-start py-2 border-b border-dashed border-slate-100">
                            <span className="text-xs font-semibold text-slate-500">Country of Origin</span>
                            <span className="text-xs text-slate-800 font-medium">{manufacturerInfo.countryOfOrigin}</span>
                        </div>
                    )}
                    {manufacturerInfo?.selfLife && (
                        <div className="flex justify-between items-start py-2 border-b border-dashed border-slate-100">
                            <span className="text-xs font-semibold text-slate-500">Shelf Life</span>
                            <span className="text-xs text-slate-800 font-medium">{manufacturerInfo.selfLife}</span>
                        </div>
                    )}
                    {warranty && (
                        <div className="flex justify-between items-start py-2">
                            <span className="text-xs font-semibold text-slate-500">Warranty</span>
                            <span className="text-xs text-slate-800 font-medium text-right max-w-[70%]">{warranty}</span>
                        </div>
                    )}
                    {disclaimer && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                    <span className="font-bold text-slate-700 block mb-1">Disclaimer:</span>
                                    {disclaimer}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {hasCare && (
                <div className="space-y-3 border-slate-100 bg-white p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-4 w-4 text-slate-400" />
                        <h3 className="text-sm font-black text-slate-900 tracking-tight">Customer Care</h3>
                    </div>
                    {customerCareDetails.name && (
                        <div className="flex justify-between items-start py-2 border-b border-dashed border-slate-100">
                            <span className="text-xs font-semibold text-slate-500">Support Team</span>
                            <span className="text-xs text-slate-800 font-medium text-right">{customerCareDetails.name}</span>
                        </div>
                    )}
                    {customerCareDetails.email && (
                        <div className="flex justify-between items-start py-2 border-b border-dashed border-slate-100">
                            <span className="text-xs font-semibold text-slate-500">Email</span>
                            <a href={`mailto:${customerCareDetails.email}`} className="text-xs text-blue-600 hover:underline font-medium text-right">{customerCareDetails.email}</a>
                        </div>
                    )}
                    {customerCareDetails.phone && (
                        <div className="flex justify-between items-start py-2 border-b border-dashed border-slate-100">
                            <span className="text-xs font-semibold text-slate-500">Phone</span>
                            <a href={`tel:${customerCareDetails.phone}`} className="text-xs text-blue-600 hover:underline font-medium text-right">{customerCareDetails.phone}</a>
                        </div>
                    )}
                    {customerCareDetails.address && (
                        <div className="flex justify-between items-start py-2">
                            <span className="text-xs font-semibold text-slate-500">Address</span>
                            <span className="text-xs text-slate-800 font-medium text-right max-w-[60%]">{customerCareDetails.address}</span>
                        </div>
                    )}
                </div>
            )}



        </div>
    )
}
