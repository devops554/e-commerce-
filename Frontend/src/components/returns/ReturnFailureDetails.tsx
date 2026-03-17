import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react'

interface ReturnFailureDetailsProps {
    pickupNotes?: string;
    verificationMedia?: { url: string; publicId?: string }[];
}

export function ReturnFailureDetails({ pickupNotes, verificationMedia }: ReturnFailureDetailsProps) {
    if (!pickupNotes && (!verificationMedia || verificationMedia.length === 0)) return null

    return (
        <Card className="border-none shadow-xl shadow-red-100/50 rounded-3xl overflow-hidden bg-white border-l-4 border-l-red-500">
            <CardHeader className="p-6 bg-red-50/50 border-b border-red-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    Pickup Failure Details
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {pickupNotes && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <FileText className="h-3 w-3" />
                            Partner Notes
                        </div>
                        <p className="text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                            "{pickupNotes}"
                        </p>
                    </div>
                )}

                {verificationMedia && verificationMedia.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <ImageIcon className="h-3 w-3" />
                            Verification Photos
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {verificationMedia.map((media, idx) => (
                                <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 group relative">
                                    <img 
                                        src={media.url} 
                                        alt={`Failure verification ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    <a 
                                        href={media.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <ExternalLink className="h-5 w-5 text-white" />
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Full View</span>
                                        </div>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
