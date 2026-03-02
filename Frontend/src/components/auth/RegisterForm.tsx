"use client";

import { useState } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { SocialLogin } from './SocialLogin';

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    const { login: setAuthData } = useAuth();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const handleRequestOtp = async () => {
        if (!email) return toast.error('Please enter your email first');
        setOtpLoading(true);
        try {
            await axios.post(`${apiUrl}/auth/request-otp`, { email });
            setOtpSent(true);
            toast.success('Verification code sent to your email');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpSent) return toast.error('Please verify your email with OTP');

        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/auth/register`, {
                email,
                password,
                name,
                phone,
                otp
            });
            setAuthData(response.data.access_token, response.data.user);
            toast.success('Account created successfully!');
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleRegister} className="space-y-4 text-left">
                {/* Email Section */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                        Email & Verification
                    </Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1 group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#FF3269] transition-colors" />
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-[#FF3269]/10 font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleRequestOtp}
                            disabled={otpLoading || (otpSent && !email)}
                            className="h-12 px-6 rounded-xl font-bold bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 shadow-sm"
                        >
                            {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : otpSent ? 'Resend' : 'Get OTP'}
                        </Button>
                    </div>
                </div>

                {/* OTP Field (Animated Appearance) */}
                <AnimatePresence>
                    {otpSent && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-2 group overflow-hidden"
                        >
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">OTP Code</Label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                <Input
                                    placeholder="Enter 6-digit code"
                                    className="h-12 bg-green-50/30 border-green-100 rounded-xl pl-11 focus:ring-2 focus:ring-green-500/10 font-black tracking-widest"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Personal Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2 group">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="John Doe"
                                className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-[#FF3269]/10 font-medium"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2 group">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone</Label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="1234567890"
                                className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-[#FF3269]/10 font-medium"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Password Section */}
                <div className="space-y-2 group">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="password"
                            placeholder="••••••••"
                            className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-[#FF3269]/10 font-medium"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <Button
                    className="w-full h-12 mt-4 bg-[#FF3269] hover:bg-[#E62E5F] text-white font-bold rounded-xl shadow-lg shadow-[#FF3269]/20 transition-all active:scale-[0.98]"
                    disabled={loading || !otpSent}
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        'Create Premium Account'
                    )}
                </Button>
            </form>

            <SocialLogin />
        </div>
    );
}