import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderHistory } from '@/services/order.service'
import { History, User, Clock, CheckCircle2, XCircle, Package, Truck, Info } from 'lucide-react'
import { format } from 'date-fns'

interface OrderHistoryCardProps {
    history: OrderHistory[] | undefined
}

export function OrderHistoryCard({ history }: OrderHistoryCardProps) {
    if (!history || history.length === 0) return null;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'created': return <Package className="w-4 h-4 text-blue-500" />;
            case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'confirmed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'shipped': return <Truck className="w-4 h-4 text-purple-500" />;
            case 'delivered': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'cancelled':
            case 'failed': return <XCircle className="w-4 h-4 text-rose-500" />;
            default: return <Info className="w-4 h-4 text-slate-400" />;
        }
    }

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'STATUS_UPDATE': return 'Status Changed';
            case 'CANCELLED': return 'Order Cancelled';
            case 'ITEM_CANCELLED': return 'Item Cancelled';
            default: return action.replace('_', ' ');
        }
    }

    return (
        <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 px-6 pt-6 bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                    <History className="w-5 h-5 text-slate-400" />
                    Order History
                </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
                <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    {history.map((item, index) => (
                        <div key={index} className="relative pl-8 group">
                            {/* Timeline Dot */}
                            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center z-10 group-hover:border-primary/30 transition-colors">
                                {getStatusIcon(item.status)}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-black text-slate-900">
                                        {getActionLabel(item.action)}: <span className="capitalize text-primary">{item.status}</span>
                                    </p>
                                    <span className="text-[10px] font-medium text-slate-400">
                                        {format(new Date(item.timestamp), 'MMM dd, HH:mm')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                    <User className="w-3 h-3" />
                                    <span>Modified by <span className="text-slate-700 font-bold">{(item.actor as any)?.name || 'System'}</span> ({item.actorRole})</span>
                                </div>
                                {item.note && (
                                    <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                                        "{item.note}"
                                    </p>
                                )}
                            </div>
                        </div>
                    )).reverse()}
                </div>
            </CardContent>
        </Card>
    )
}
