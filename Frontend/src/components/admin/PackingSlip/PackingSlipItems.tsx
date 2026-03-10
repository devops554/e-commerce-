"use client"

import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface PackingSlipItemsProps {
    items: any[]
}

export const PackingSlipItems = ({ items }: PackingSlipItemsProps) => {
    return (
        <div className="mb-6">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-900 hover:bg-slate-900 border-none">
                        <TableHead className="font-black text-white text-[10px] uppercase tracking-wider h-10 rounded-l-xl pl-4">Product Details</TableHead>
                        <TableHead className="font-black text-white text-[10px] uppercase tracking-wider h-10">SKU Code</TableHead>
                        <TableHead className="font-black text-white text-[10px] uppercase tracking-wider h-10">HSN</TableHead>
                        <TableHead className="font-black text-white text-[10px] uppercase tracking-wider h-10 text-right pr-4 rounded-r-xl">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(items || []).map((item: any, i: number) => (
                        <TableRow key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <TableCell className="py-4 pl-4">
                                <div className="flex items-center gap-4">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-100 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                        <span className="font-black text-slate-800 text-sm block truncate max-w-[240px]">{item.title}</span>
                                        {item.attributes?.length > 0 && (
                                            <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase truncate whitespace-nowrap overflow-hidden">
                                                {item.attributes.map((a: any) => `${a.name}: ${a.value}`).join(' | ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="font-mono text-[10px] font-bold text-slate-500 uppercase">{item.sku || '—'}</TableCell>
                            <TableCell className="font-mono text-[10px] font-bold text-slate-400">{item.hsnCode || '—'}</TableCell>
                            <TableCell className="text-right font-black text-slate-900 pr-4">
                                <span className="inline-block bg-slate-100 px-3 py-1 rounded-lg text-sm">{item.quantity}</span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
