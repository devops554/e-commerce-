"use client"

import React from 'react'

export const PackingSlipFooter = () => {
    return (
        <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex flex-col items-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 italic">
                    FOR WAREHOUSE INTERNAL USE ONLY
                </p>
                <div className="flex items-center gap-6 mt-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                    <p className="text-[9px] font-black text-slate-900 tracking-tighter">E-BIVHA LOGISTICS</p>
                    <p className="text-[9px] font-black text-slate-900 tracking-tighter">QUALITY CHECK PASSED</p>
                    <p className="text-[9px] font-black text-slate-900 tracking-tighter">ZERO PLASTIC PACKING</p>
                </div>
            </div>
        </div>
    )
}
