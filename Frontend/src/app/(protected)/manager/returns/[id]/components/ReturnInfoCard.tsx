import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Camera, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { ReturnRequest } from '@/services/return.service'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

// Image Dialog Component (Local for now or can be shared)
interface EvidenceImageDialogProps {
    image: { url: string; publicId?: string };
    children: React.ReactNode;
    title?: string;
}

function EvidenceImageDialog({ image, children, title = "Evidence Image" }: EvidenceImageDialogProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[90vw] p-0 overflow-hidden bg-black/95 border-none">
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
                        onClick={() => setOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col h-full">
                        <div className="bg-black/80 p-4 text-white border-b border-white/10">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Camera className="h-4 w-4" />
                                {title}
                            </h3>
                            {image.publicId && (
                                <p className="text-xs text-white/60 mt-1 font-mono">
                                    ID: {image.publicId}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-center p-4 min-h-[60vh] max-h-[80vh]">
                            <img
                                src={image.url}
                                alt="Evidence"
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

interface ReturnInfoCardProps {
    request: ReturnRequest;
}

export function ReturnInfoCard({ request }: ReturnInfoCardProps) {
    return (
        <div className="space-y-4">
            <div>
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Reason for Return</Label>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Badge variant="outline" className="mb-2 bg-white text-blue-600 border-blue-100 font-bold">{request.reason}</Badge>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{request.reasonDescription}</p>
                </div>
            </div>

            {request.rejectionReason && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-xs font-black uppercase tracking-widest text-red-400 mb-2 block flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        Rejection Reason
                    </Label>
                    <p className="text-sm text-red-700 font-medium leading-relaxed">
                        {request.rejectionReason}
                    </p>
                </div>
            )}

            {request.evidenceMedia && request.evidenceMedia.length > 0 && (
                <div>
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-2">
                        <Camera className="h-3 w-3" />
                        Customer Evidence ({request.evidenceMedia.length})
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {request.evidenceMedia.map((m: any, i: number) => (
                            <EvidenceImageDialog key={i} image={m} title={`Evidence ${i + 1}`}>
                                <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 group relative cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                            <ImageIcon className="text-white h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                                        {i + 1}/{request.evidenceMedia!.length}
                                    </div>
                                </div>
                            </EvidenceImageDialog>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
