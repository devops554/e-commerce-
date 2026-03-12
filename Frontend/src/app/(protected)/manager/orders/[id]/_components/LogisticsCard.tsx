import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck, Info, AlertCircle, User, Calendar, Hash, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FaWhatsapp } from 'react-icons/fa'
import { format } from 'date-fns'

interface LogisticsCardProps {
    shipment: any
    partner: any
    onAssignPartner: () => void
    onViewPartner: (id: string) => void
}

export function LogisticsCard({ shipment, partner, onAssignPartner, onViewPartner }: LogisticsCardProps) {
    return (
        <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 px-6 pt-6 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                    <Truck className="w-5 h-5 text-indigo-500" />
                    Logistics & Assignment
                </CardTitle>
                {shipment && (
                    <Badge className={`font-bold capitalize ${shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : shipment.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {shipment.status.replace(/_/g, ' ')}
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="px-6 py-6 font-medium">
                {!shipment ? (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                            <Info className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">No delivery partner assigned to this order yet.</p>
                        <Button onClick={onAssignPartner} variant="outline" size="sm" className="rounded-xl font-black bg-white border-slate-200">Go to Assignment List</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Assigned Delivery Partner</span>
                                {!partner ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                                            <AlertCircle className="w-5 h-5 text-rose-500" />
                                            <p className="text-xs font-bold text-rose-600">No partner assigned</p>
                                        </div>
                                        <Button onClick={onAssignPartner} className="rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest h-10 w-full">Assign Partner Now</Button>
                                    </div>
                                ) : (
                                    <div onClick={() => onViewPartner(partner._id)} className="flex cursor-pointer items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-900 truncate">{partner.name || 'N/A'}</p>
                                            <p className="text-[10px] text-slate-500 font-bold">{partner.phone || 'No phone'}</p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-1">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="rounded-full h-8 w-8 cursor-pointer text-green-500" 
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    partner.phone && window.open(`https://wa.me/${partner.phone}`, '_blank')
                                                }}
                                            >
                                                <FaWhatsapp size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Tracking Number</span>
                                <div className="flex items-center gap-2 text-sm font-mono font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 w-fit">
                                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                                    {shipment.trackingNumber}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Assigned On</span>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                        {shipment.assignedAt ? format(new Date(shipment.assignedAt), 'MMM dd, HH:mm') : 'Pending'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Picked Up</span>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                        {shipment.pickedAt ? format(new Date(shipment.pickedAt), 'MMM dd, HH:mm') : 'Pending'}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Dispatch Agent</span>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                                    <Check className={`w-4 h-4 ${shipment.deliveredAt ? 'text-green-600' : 'text-slate-300'}`} />
                                    {shipment.deliveredAt
                                        ? `Delivered on ${format(new Date(shipment.deliveredAt), 'MMM dd, yyyy HH:mm')}`
                                        : shipment.status === 'OUT_FOR_DELIVERY' ? 'Order is out for delivery'
                                            : shipment.status === 'ACCEPTED' ? 'Partner accepted, awaiting pickup'
                                                : shipment.status === 'ASSIGNED_TO_DELIVERY' ? 'Awaiting partner acceptance'
                                                    : 'Awaiting pickup from warehouse'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
