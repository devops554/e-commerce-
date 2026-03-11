"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react'

interface BlockPartnerDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    partnerName: string
    blockReason: string
    setBlockReason: (reason: string) => void
    onConfirm: () => void
    isPending: boolean
}

export const BlockPartnerDialog = ({
    isOpen,
    onOpenChange,
    partnerName,
    blockReason,
    setBlockReason,
    onConfirm,
    isPending
}: BlockPartnerDialogProps) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
            <div className="bg-rose-600 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <DialogTitle className="text-2xl font-black relative z-10 flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8" />
                    Suspend Partner
                </DialogTitle>
                <DialogDescription className="text-rose-100 font-bold mt-2 text-sm relative z-10">
                    Provide a valid reason for suspending {partnerName}. This is required for auditing purposes.
                </DialogDescription>
            </div>
            <div className="p-8 bg-white space-y-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reason for Suspension</Label>
                    <Textarea
                        placeholder="Enter reason for blocking... (e.g., Policy violation, Identity mismatch)"
                        className="rounded-2xl border-slate-200 bg-slate-50 font-bold text-sm min-h-[120px] focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-1 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100"
                        onClick={onConfirm}
                        disabled={!blockReason.trim() || isPending}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Suspension'}
                    </Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
)

interface EditDocumentsDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    partnerName: string
    docData: any
    setDocData: (data: any) => void
    onConfirm: () => void
    isPending: boolean
}

export const EditDocumentsDialog = ({
    isOpen,
    onOpenChange,
    partnerName,
    docData,
    setDocData,
    onConfirm,
    isPending
}: EditDocumentsDialogProps) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <DialogTitle className="text-2xl font-black relative z-10 flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-indigo-400" />
                    Update Registry Documents
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-bold mt-2 text-sm relative z-10">
                    Modify government identity details and upload new registry copies for {partnerName}.
                </DialogDescription>
            </div>
            <div className="p-8 bg-white space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Aadhaar Section */}
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aadhaar Configuration</Label>
                        <div className="space-y-4">
                            <Input
                                placeholder="Aadhaar Number"
                                className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-bold"
                                value={docData.aadhaarNumber}
                                onChange={(e) => setDocData({ ...docData, aadhaarNumber: e.target.value })}
                            />
                            <Input
                                placeholder="Aadhaar Image URL"
                                className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-bold"
                                value={docData.aadhaarImage}
                                onChange={(e) => setDocData({ ...docData, aadhaarImage: e.target.value })}
                            />
                        </div>
                    </div>
                    {/* PAN Section */}
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tax Identity (PAN)</Label>
                        <div className="space-y-4">
                            <Input
                                placeholder="PAN Number"
                                className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-bold"
                                value={docData.panNumber}
                                onChange={(e) => setDocData({ ...docData, panNumber: e.target.value })}
                            />
                            <Input
                                placeholder="PAN Image URL"
                                className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-bold"
                                value={docData.panImage}
                                onChange={(e) => setDocData({ ...docData, panImage: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                {/* License Section */}
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fleet Authorization (DL)</Label>
                    <Input
                        placeholder="Driving License Image URL"
                        className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-bold text-center"
                        value={docData.drivingLicenseImage}
                        onChange={(e) => setDocData({ ...docData, drivingLicenseImage: e.target.value })}
                    />
                </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
                <Button
                    variant="ghost"
                    className="flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500"
                    onClick={() => onOpenChange(false)}
                >
                    Dismiss
                </Button>
                <Button
                    className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
                    onClick={onConfirm}
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Synchronize Registry'}
                </Button>
            </div>
        </DialogContent>
    </Dialog>
)
