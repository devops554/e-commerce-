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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, HelpCircle } from "lucide-react"

const CANCEL_REASONS = [
    "Changed my mind",
    "Ordered by mistake / accidentally",
    "Found better price elsewhere",
    "Delivery time is too long",
    "Want to change shipping address",
    "Want to change payment method",
    "Other"
]

interface CancelOrderDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (reason: string) => void
    isPending: boolean
}

export function CancelOrderDialog({
    isOpen,
    onClose,
    onConfirm,
    isPending
}: CancelOrderDialogProps) {
    const [reason, setReason] = useState(CANCEL_REASONS[0])
    const [otherReason, setOtherReason] = useState("")

    const handleConfirm = () => {
        const finalReason = reason === "Other" ? otherReason : reason
        onConfirm(finalReason)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-rose-50 px-6 py-4 flex items-center gap-3 border-b border-rose-100">
                    <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-rose-200">
                        <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <DialogTitle className="text-lg font-black text-rose-900 leading-tight">Cancel Order?</DialogTitle>
                        <p className="text-[11px] text-rose-600 font-bold uppercase tracking-wider">Are you sure you want to proceed?</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <DialogDescription className="text-[13px] text-slate-500 font-medium leading-relaxed">
                        Please tell us why you want to cancel. This helps us improve our service.
                        Once cancelled, this action cannot be undone.
                    </DialogDescription>

                    <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Select a reason</Label>
                        <RadioGroup
                            value={reason}
                            onValueChange={setReason}
                            className="grid gap-2"
                        >
                            {CANCEL_REASONS.map((r) => (
                                <div
                                    key={r}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer ${reason === r ? 'bg-rose-50/50 border-rose-200 ring-1 ring-rose-200' : 'bg-slate-50 border-slate-100'}`}
                                    onClick={() => setReason(r)}
                                >
                                    <RadioGroupItem value={r} id={r} className="text-rose-500 border-slate-300 focus:ring-rose-500" />
                                    <Label htmlFor={r} className="flex-1 font-bold text-sm text-slate-700 cursor-pointer">{r}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {reason === "Other" && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label htmlFor="other-reason" className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tell us more</Label>
                            <Textarea
                                id="other-reason"
                                placeholder="Please provide additional details..."
                                className="rounded-2xl border-slate-200 focus:ring-rose-500 focus:border-rose-500 min-h-[100px] text-sm font-medium"
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex-col sm:flex-row gap-3 sm:gap-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isPending}
                        className="rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all px-6 border border-slate-200"
                    >
                        Keep Order
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isPending || (reason === "Other" && !otherReason.trim())}
                        className="rounded-2xl bg-rose-500 hover:bg-rose-600 font-bold text-white shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 px-8"
                    >
                        {isPending ? "Cancelling..." : "Confirm Cancellation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
