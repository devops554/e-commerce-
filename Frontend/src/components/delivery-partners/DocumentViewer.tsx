"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, ImageIcon, X, Loader2, Download } from 'lucide-react'

interface DocumentViewerProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    title: string
    url?: string
}

const DocumentViewer = ({ isOpen, onOpenChange, title, url }: DocumentViewerProps) => {
    const isPDF = url?.toLowerCase().endsWith('.pdf') || url?.includes('pdf')
    const [isLoading, setIsLoading] = React.useState(true)
    const [hasError, setHasError] = React.useState(false)

    React.useEffect(() => {
        if (isOpen) {
            setIsLoading(true)
            setHasError(false)
        }
    }, [isOpen, url])

    if (!url) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col border-0 shadow-2xl rounded-3xl">
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            {isPDF ? <FileText className="w-5 h-5 text-indigo-400" /> : <ImageIcon className="w-5 h-5 text-purple-400" />}
                        </div>
                        <div>
                            <DialogTitle className="text-white text-base font-black truncate max-w-[300px]">{title}</DialogTitle>
                            <DialogDescription className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">
                                {isPDF ? 'Portable Document Format' : 'Static Image Source'}
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
                            onClick={() => window.open(url, '_blank')}
                        >
                            <Download className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 bg-slate-100/50 relative overflow-hidden flex items-center justify-center p-4">
                    {isLoading && !hasError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydrating Document</p>
                        </div>
                    )}

                    {hasError ? (
                        <div className="flex flex-col items-center text-center p-8">
                            <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center mb-4">
                                <X className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">Document Not Found</h3>
                            <p className="text-xs font-bold text-slate-500 mt-2 max-w-[240px]">The requested file could not be retrieved from the server.</p>
                            <Button className="mt-6 rounded-xl font-bold" onClick={() => window.open(url, '_blank')}>
                                Open in External Browser
                            </Button>
                        </div>
                    ) : (
                        isPDF ? (
                            <iframe
                                src={`${url}#toolbar=0`}
                                className="w-full h-full rounded-2xl bg-white shadow-2xl border border-slate-200"
                                onLoad={() => setIsLoading(false)}
                                onError={() => setHasError(true)}
                            />
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center group">
                                <img
                                    src={url}
                                    alt={title}
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl bg-white"
                                    onLoad={() => setIsLoading(false)}
                                    onError={() => setHasError(true)}
                                />
                                <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-4 text-white text-[10px] font-black uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            Source Verified
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DocumentViewer
