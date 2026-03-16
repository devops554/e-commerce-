"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
    ArrowLeft, 
    RotateCcw, 
    CheckCircle2, 
    XCircle, 
    PackageSearch, 
    Banknote,
    Clock,
    User,
    ClipboardList,
    AlertCircle,
    Image as ImageIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function ReturnDetailView() {
    const { id } = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [adminNote, setAdminNote] = React.useState("")
    const [rejectionReason, setRejectionReason] = React.useState("")
    const [qcGrade, setQcGrade] = React.useState<string>("")
    const [qcNotes, setQcNotes] = React.useState("")

    const { data: request, isLoading } = useQuery({
        queryKey: ['return-request', id],
        queryFn: async () => {
            // Mocking API fetch
            return {
                _id: id,
                orderId: { orderId: 'ORD-12345', _id: 'order_1' },
                productId: { title: 'Smartphone Pro Max', thumbnail: { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300' } },
                variantId: { sku: 'SP-PM-128-BLK', attributes: [{ name: 'Color', value: 'Black' }] },
                customerId: { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210' },
                status: 'PENDING',
                reason: 'DAMAGED',
                reasonDescription: 'The screen has a visible crack on the bottom left corner.',
                evidenceMedia: [
                    { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300' }
                ],
                quantity: 1,
                createdAt: new Date().toISOString(),
                warehouseId: { name: 'Mumbai North DC' }
            }
        }
    })

    const reviewMutation = useMutation({
        mutationFn: async (vars: { approved: boolean }) => {
            toast.success(`Return ${vars.approved ? 'Approved' : 'Rejected'} successfully`)
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['return-request', id] })
    })

    const qcMutation = useMutation({
        mutationFn: async () => {
            toast.success('QC Results updated successfully')
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['return-request', id] })
    })

    if (isLoading || !request) return <div className="p-10 text-center text-slate-500 font-medium">Loading Return Details...</div>

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4 py-4">
                <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Return Request Detail</h1>
                    <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">{request._id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left Column: Product & Reason ── */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="p-6 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <PackageSearch className="h-5 w-5 text-blue-600" />
                                Item Details
                            </CardTitle>
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold uppercase text-[10px] tracking-widest">
                                {request.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex gap-4">
                                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                    <img src={request.productId.thumbnail.url} alt="" className="h-full w-full object-cover" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-slate-900 leading-snug">{request.productId.title}</h3>
                                    <p className="text-[10px] font-mono text-slate-500">SKU: {request.variantId.sku}</p>
                                    <div className="flex gap-2">
                                        {request.variantId.attributes.map((a: any, i: number) => (
                                            <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600">
                                                {a.name}: {a.value}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 mt-1">Quantity: {request.quantity}</p>
                                </div>
                            </div>

                            <Separator className="bg-slate-50" />

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Reason for Return</Label>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <Badge variant="outline" className="mb-2 bg-white text-blue-600 border-blue-100 font-bold">{request.reason}</Badge>
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">{request.reasonDescription}</p>
                                    </div>
                                </div>

                                {request.evidenceMedia?.length > 0 && (
                                    <div>
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Customer Evidence</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {request.evidenceMedia.map((m: any, i: number) => (
                                                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 group relative">
                                                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <ImageIcon className="text-white h-5 w-5" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Action Card */}
                    {request.status === 'PENDING' && (
                        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white border-2 border-blue-100/50">
                            <CardHeader className="p-6 bg-blue-50/50 border-b border-blue-100">
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-800">
                                    <ClipboardList className="h-5 w-5 text-blue-600" />
                                    Internal Review
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <Label className="font-bold text-slate-700">Admin Note (Internal Only)</Label>
                                    <Textarea 
                                        placeholder="Add notes about the condition, previous issues etc..."
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        className="rounded-2xl border-slate-200 focus-visible:ring-blue-500 min-h-[100px]"
                                    />
                                </div>

                                <Separator className="bg-slate-50" />

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 space-y-3">
                                        <Button 
                                            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-100"
                                            onClick={() => reviewMutation.mutate({ approved: true })}
                                            disabled={reviewMutation.isPending}
                                        >
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Approve Return
                                        </Button>
                                        <p className="text-[10px] text-center text-slate-400 font-medium">Customer will be notified and pickup will be scheduled.</p>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <Button 
                                            variant="outline"
                                            className="w-full h-12 rounded-2xl border-2 border-red-100 text-red-600 hover:bg-red-50 font-bold text-lg"
                                            onClick={() => reviewMutation.mutate({ approved: false })}
                                            disabled={reviewMutation.isPending}
                                        >
                                            <XCircle className="mr-2 h-5 w-5" />
                                            Reject Request
                                        </Button>
                                        <p className="text-[10px] text-center text-slate-400 font-medium">Please provide a reason below if rejecting.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* ── Right Column: Info & QC ── */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="p-6 bg-slate-900 text-white">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-400" />
                                Customer Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Name</p>
                                <p className="font-bold text-slate-800">{request.customerId.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Contact</p>
                                <p className="text-sm font-medium text-slate-600">{request.customerId.email}</p>
                                <p className="text-sm font-medium text-slate-600">{request.customerId.phone}</p>
                            </div>
                            <Separator className="bg-slate-50" />
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Order Ref</p>
                                <p className="font-mono text-sm font-bold text-blue-600">{request.orderId.orderId}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Warehouse</p>
                                <p className="text-sm font-bold text-slate-700">{request.warehouseId.name}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="p-6 bg-slate-50 border-b border-slate-100">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-indigo-600" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                <TimelineItem 
                                    date={format(new Date(request.createdAt), 'dd MMM, HH:mm')} 
                                    title="Request Submitted" 
                                    description="Return request created by customer"
                                    active
                                />
                                {request.status === 'APPROVED' && (
                                    <TimelineItem 
                                        date="Just Now" 
                                        title="Approved" 
                                        description="Awaiting pickup scheduling"
                                        active
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function TimelineItem({ date, title, description, active }: any) {
    return (
        <div className="relative pl-8 space-y-1">
            <div className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 ${active ? 'bg-blue-600 border-blue-100 shadow-[0_0_0_4px] shadow-blue-50' : 'bg-slate-200 border-white'}`} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">{date}</p>
            <h4 className="text-sm font-bold text-slate-800 leading-none">{title}</h4>
            <p className="text-xs text-slate-500 font-medium">{description}</p>
        </div>
    )
}
