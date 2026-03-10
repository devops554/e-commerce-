"use client"

import React from 'react'

interface PackingSlipHeaderProps {
    orderId: string
    invoiceNumber?: string
}

export const PackingSlipHeader = ({ orderId, invoiceNumber }: PackingSlipHeaderProps) => {
    return (
        <div className="border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Packing Slip</h2>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-wider uppercase">Order ID: {orderId}</p>
                </div>
                <div className="text-right">
                    <h1 className="text-xl font-black text-slate-900 leading-none">E-BIVHA</h1>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Premium E-commerce</p>
                    {invoiceNumber && (
                        <div className="mt-2">
                            <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase tracking-wider border border-slate-200">
                                {invoiceNumber}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
