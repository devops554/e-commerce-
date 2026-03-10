"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Printer, Loader2, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/order.service'

import { PackingSlipHeader } from './PackingSlip/PackingSlipHeader'
import { PackingSlipBuyer } from './PackingSlip/PackingSlipBuyer'
import { PackingSlipItems } from './PackingSlip/PackingSlipItems'
import { PackingSlipFooter } from './PackingSlip/PackingSlipFooter'

interface PackingSlipModalProps {
    orderId: string
    open: boolean
    onClose: () => void
}

export default function PackingSlipModal({ orderId, open, onClose }: PackingSlipModalProps) {
    const { data: slip, isLoading, error } = useQuery({
        queryKey: ['packing-slip', orderId],
        queryFn: () => orderService.getPackingSlip(orderId),
        enabled: open && !!orderId,
    })

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[720px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl print:shadow-none bg-slate-50/30 backdrop-blur-xl">
                <DialogHeader className="px-8 py-5 bg-white border-b border-slate-100 flex-row items-center justify-between space-y-0 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 p-2 rounded-xl">
                            <Printer className="w-5 h-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Packing Slip</DialogTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            className="bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl px-5 h-9"
                            onClick={() => window.print()}
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Print Slip
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl h-9 w-9 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="max-h-[80vh] overflow-y-auto no-scrollbar print:max-h-none print:overflow-visible bg-white mx-4 my-4 rounded-2xl shadow-sm border border-slate-100 print:m-0 print:border-none print:shadow-none">
                    <div id="packing-slip-print" className="p-10 bg-white">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Generating Slip...</p>
                            </div>
                        )}
                        {error && (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center">
                                    <X className="w-8 h-8 text-rose-500" />
                                </div>
                                <p className="text-sm text-rose-500 font-black text-center max-w-[200px]">
                                    We couldn't generate the packing slip at this moment.
                                </p>
                            </div>
                        )}
                        {slip && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <PackingSlipHeader
                                    orderId={slip.orderId}
                                    invoiceNumber={slip.invoiceNumber}
                                />

                                <PackingSlipBuyer buyer={slip.buyer} />

                                <PackingSlipItems items={slip.items} />

                                <PackingSlipFooter />
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body * { visibility: hidden; }
                    #packing-slip-print, #packing-slip-print * { visibility: visible; }
                    #packing-slip-print { 
                        position: fixed; 
                        left: 0; 
                        top: 0; 
                        width: 100vw; 
                        height: 100vh;
                        padding: 40px !important; 
                        background: white !important;
                        margin: 0 !important;
                    }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                }
            `}</style>
        </Dialog>
    )
}
