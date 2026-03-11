import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KeyRound, Loader2 } from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
    onVerify: (otp: string) => Promise<void>
    title: string
    description: string
    isLoading: boolean
}

export function OTPVerificationDialog({ isOpen, onClose, onVerify, title, description, isLoading }: Props) {
    const [otp, setOtp] = useState('')

    const handleVerify = async () => {
        if (otp.length !== 6) return
        await onVerify(otp)
        setOtp('')
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose()
                setOtp('')
            }
        }}>
            <DialogContent className="rounded-2xl max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-black text-slate-900">{title}</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Enter 6-digit OTP</label>
                        <Input
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="text-center text-2xl font-black tracking-[0.5em] h-14 rounded-2xl border-slate-200 focus:border-primary focus:ring-primary/10"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20"
                        onClick={handleVerify}
                        disabled={otp.length !== 6 || isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Verify & Proceed'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
