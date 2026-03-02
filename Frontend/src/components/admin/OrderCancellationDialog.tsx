"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader2 } from "lucide-react"

interface OrderCancellationDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (reason: string) => Promise<void>
    title: string
    description: string
    isLoading?: boolean
}

export function OrderCancellationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading = false
}: OrderCancellationDialogProps) {
    const [reason, setReason] = useState("")
    const [error, setError] = useState("")

    const handleConfirm = async () => {
        if (!reason.trim()) {
            setError("Please provide a reason for cancellation")
            return
        }
        setError("")
        try {
            await onConfirm(reason)
            setReason("")
            onClose()
        } catch (err) {
            // Error handling is usually done in the parent via toast
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-[32px] border-slate-100 shadow-2xl">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-rose-500" />
                    </div>
                    <DialogTitle className="text-xl font-black text-slate-900">{title}</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-500">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                            Reason for Cancellation
                        </label>
                        <Textarea
                            placeholder="e.g., Out of stock, Customer requested, etc."
                            className="min-h-[100px] rounded-2xl border-slate-200 focus:ring-rose-500/20 focus:border-rose-300 resize-none font-medium"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value)
                                if (error) setError("")
                            }}
                        />
                        {error && (
                            <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase tracking-tight">
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl font-bold text-slate-500 hover:bg-slate-50"
                        disabled={isLoading}
                    >
                        Keep Order
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        className="rounded-xl bg-rose-500 hover:bg-rose-600 font-bold shadow-lg shadow-rose-100"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Confirm Cancellation"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
