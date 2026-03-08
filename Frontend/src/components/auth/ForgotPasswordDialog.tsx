"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2, EyeOff, Eye, KeyRound } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { authService } from '@/services/auth.service';

export function ForgotPasswordDialog({ trigger }: { trigger: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [showPassword, setShowPassword] = useState(false);

    // Form fields
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error('Please enter your email');
        setOtpLoading(true);
        try {
            await authService.forgotPassword(email);
            setStep(2);
            toast.success('Reset OTP sent to your email');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.resetPassword({ email, otp, password });
            toast.success('Password reset successfully! Please login.');
            setIsOpen(false);
            setStep(1);
            setEmail('');
            setOtp('');
            setPassword('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none bg-white/80 backdrop-blur-xl shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-white/50 to-blue-500/5 -z-10" />

                <ScrollArea className="p-8 overflow-y-auto max-h-[80vh]">
                    <DialogHeader className="mb-8 items-center text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-16 h-16 bg-linear-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-orange-500/20"
                        >
                            <KeyRound className="h-8 w-8 text-white" />
                        </motion.div>
                        <DialogTitle className="text-3xl font-black tracking-tight text-slate-900">
                            Reset Password<span className="text-orange-500">.</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            {step === 1 ? 'Enter your email to receive an verification code' : 'Verify your identity and set a new password'}
                        </DialogDescription>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {step === 1 ? (
                                <form onSubmit={handleRequestOtp} className="space-y-6">
                                    <div className="space-y-2 group">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                            <Input
                                                type="email"
                                                placeholder="name@example.com"
                                                className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-orange-500/10 transition-all font-medium"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] group" disabled={otpLoading}>
                                        {otpLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                            <span className="flex items-center gap-2">
                                                Send OTP <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="space-y-2 group">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">OTP Code</Label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                            <Input
                                                placeholder="6-digit code"
                                                className="h-12 bg-green-50/50 border-green-100 rounded-xl pl-11 focus:ring-2 focus:ring-green-500/10 font-black tracking-widest"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-orange-500/10 transition-all font-medium"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] group" disabled={loading}>
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
                                    </Button>

                                    <Button variant="ghost" type="button" className="w-full text-slate-400 font-bold" onClick={() => setStep(1)}>
                                        Back to email
                                    </Button>
                                </form>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
