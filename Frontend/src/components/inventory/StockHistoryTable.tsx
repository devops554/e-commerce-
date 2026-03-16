import React from 'react'
import { format } from 'date-fns'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import {
    ArrowUpCircle,
    ArrowDownCircle,
    ArrowRightLeft,
    Truck,
    Clock,
    Box,
    History,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StockHistoryTableProps {
    history: any[];
}

export const StockHistoryTable: React.FC<StockHistoryTableProps> = ({ history }) => {
    const getActionConfig = (type: string, amount: number) => {
        switch (type) {
            case 'ADJUSTMENT':
                return {
                    icon: amount > 0 ? ArrowUpCircle : ArrowDownCircle,
                    color: amount > 0 ? 'text-emerald-500' : 'text-rose-500',
                    bgColor: amount > 0 ? 'bg-emerald-50' : 'bg-rose-50',
                    label: amount > 0 ? 'Stock Added' : 'Stock Reduced'
                }
            case 'TRANSFER_IN':
                return {
                    icon: ArrowRightLeft,
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-50',
                    label: 'Transfer In'
                }
            case 'TRANSFER_OUT':
                return {
                    icon: ArrowRightLeft,
                    color: 'text-amber-500',
                    bgColor: 'bg-amber-50',
                    label: 'Transfer Out'
                }
            case 'DISPATCH':
                return {
                    icon: Truck,
                    color: 'text-indigo-500',
                    bgColor: 'bg-indigo-50',
                    label: 'Dispatched'
                }
            case 'RESERVATION':
                return {
                    icon: Clock,
                    color: 'text-slate-500',
                    bgColor: 'bg-slate-50',
                    label: 'Reserved'
                }
            case 'RELEASE':
                return {
                    icon: Box,
                    color: 'text-sky-500',
                    bgColor: 'bg-sky-50',
                    label: 'Released'
                }
            default:
                return {
                    icon: History,
                    color: 'text-slate-500',
                    bgColor: 'bg-slate-50',
                    label: type
                }
        }
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                            <TableHead className="w-[80px] text-center font-black uppercase text-[10px] tracking-wider text-slate-400 py-4 px-4 rounded-tl-3xl">Action</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-wider text-slate-400 py-4 px-6">Product Details</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-wider text-slate-400 py-4 px-6">Source / Notes</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-wider text-slate-400 py-4 px-6">Date</TableHead>
                            <TableHead className="text-right font-black uppercase text-[10px] tracking-wider text-slate-400 py-4 px-6 rounded-tr-3xl">Quantity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map((log) => {
                            const config = getActionConfig(log.type, log.amount)
                            const Icon = config.icon

                            return (
                                <TableRow key={log._id} className="group hover:bg-slate-50/30 transition-colors border-slate-100">
                                    <TableCell className="p-4 align-top">
                                        <div className="flex flex-col items-center gap-1.5 pt-1">
                                            <div className={cn("h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300", config.bgColor)}>
                                                <Icon className={cn("h-5 w-5", config.color)} />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 align-top">
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex flex-col">
                                                <h3 className="text-sm font-black text-slate-900 leading-tight">
                                                    {log.product?.title || 'Unknown Product'}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={cn("px-2 py-0 rounded-[6px] font-black border-none ring-1 ring-inset uppercase text-[9px]", config.bgColor, config.color)}>
                                                        {config.label}
                                                    </Badge>
                                                    <Badge variant="outline" className="w-fit bg-slate-50 text-slate-500 border-slate-200 font-bold text-[9px] px-1.5 py-0 rounded-[6px]">
                                                        {log.variant?.sku}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase">
                                                User: <span className="text-slate-600">{log.user?.name || 'Manual Action'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 align-top">
                                        <div className="flex flex-col space-y-1.5 pt-1">
                                            {log.source ? (
                                                <span className="w-fit text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg uppercase tracking-wide">
                                                    {log.source}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">—</span>
                                            )}
                                            {log.notes && (
                                                <p className="text-[11px] font-medium text-slate-500 leading-snug w-full max-w-xs xl:max-w-md wrap-break-word truncate group-hover:whitespace-normal group-hover:wrap-break-word transition-all duration-300">
                                                    {log.notes}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 align-top">
                                        <div className="flex flex-col space-y-0.5 pt-1">
                                            <p className="text-xs font-black text-slate-700 block">
                                                {format(new Date(log.createdAt), 'MMM dd, yyyy')}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400">
                                                {format(new Date(log.createdAt), 'hh:mm a')}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 align-top text-right">
                                        <div className="flex flex-col items-end pt-1">
                                            <p className={cn("text-lg font-black tabular-nums tracking-tight", log.amount >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                                                {log.amount > 0 ? '+' : ''}{log.amount}
                                            </p>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Quantity</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
