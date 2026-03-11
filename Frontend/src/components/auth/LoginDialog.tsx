"use client";

import { useState } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import axios from 'axios';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Phone, ShieldCheck, Github, ArrowRight, Loader2, EyeOff, Eye } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';
import { getErrorMessage } from '@/utils/error-handler';
import Image from 'next/image';


export function LoginDialog({ trigger }: { trigger: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const [showPassword, setShowPassword] = useState(false);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    const { login: setAuthData } = useAuth();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const handleRequestOtp = async () => {
        if (!email) return toast.error('Please enter your email');
        setOtpLoading(true);
        try {
            await axios.post(`${apiUrl}/auth/request-otp`, { email });
            setOtpSent(true);
            toast.success('OTP sent to your email');
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setOtpLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
            const { accessToken, refreshToken, user } = response.data;
            setAuthData(accessToken, refreshToken, user);
            toast.success('Logged in successfully!');
            setIsOpen(false);
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/auth/register`, { email, password, name, phone, otp });
            const { accessToken, refreshToken, user } = response.data;
            setAuthData(accessToken, refreshToken, user);
            toast.success('Account created and logged in!');
            setIsOpen(false);
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            const response = await axios.post(`${apiUrl}/auth/google`, { idToken });
            const { accessToken, refreshToken, user } = response.data;
            setAuthData(accessToken, refreshToken, user);
            toast.success('Google login successful!');
            setIsOpen(false);
        } catch (error: any) {
            toast.error(getErrorMessage(error));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
                            transition={{ duration: 0.5 }}
                            className="flex items-center justify-center mb-4   "
                        >
                            <Image src="/photo/Kiranase-login-logo.png" alt="Kiranase-logo" width={200} height={100} className='w-50 h-20   flex items-center justify-center mb-4' />
                        </motion.div>
                        <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 group">
                            Welcome Back<span className="text-[#FF3269]">.</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Premium shopping experience awaits you
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1 rounded-xl mb-6">
                            <TabsTrigger
                                value="login"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#FF3269] data-[state=active]:shadow-sm font-bold transition-all underline-offset-4"
                            >
                                Login
                            </TabsTrigger>
                            <TabsTrigger
                                value="register"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#FF3269] data-[state=active]:shadow-sm font-bold transition-all underline-offset-4"
                            >
                                Register
                            </TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <TabsContent value="login" className="mt-0">
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="space-y-2 group">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#FF3269] transition-colors" />
                                                <Input
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-[#FF3269]/10 transition-all font-medium"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 group">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#FF3269] transition-colors" />
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-[#FF3269]/10 transition-all font-medium"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={togglePasswordVisibility}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <ForgotPasswordDialog trigger={
                                                <button type="button" className="text-[10px] font-bold text-[#FF3269] uppercase tracking-wider hover:underline ml-1">Forgot Password?</button>
                                            } />
                                        </div>
                                        <Button className="w-full h-12 bg-[#FF3269] hover:bg-[#E62E5F] text-white font-bold rounded-xl shadow-lg shadow-[#FF3269]/20 transition-all active:scale-[0.98] group" disabled={loading}>
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                                <span className="flex items-center gap-2">
                                                    Login <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="register" className="mt-0">
                                    <form onSubmit={handleRegister} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email & Verification</Label>
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
                                                    disabled={otpLoading || otpSent}
                                                    className="h-12 rounded-xl font-bold bg-white border border-slate-100 hover:bg-slate-50 text-slate-600"
                                                >
                                                    {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : otpSent ? 'Resend' : 'Get OTP'}
                                                </Button>
                                            </div>
                                        </div>

                                        {otpSent && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-2 group">
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
                                            </motion.div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
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
                                                        placeholder="9876543210"
                                                        className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-[#FF3269]/10 font-medium"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-[#FF3269]/10 font-medium"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={togglePasswordVisibility}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <Button className="w-full h-12 bg-[#FF3269] hover:bg-[#E62E5F] text-white font-bold rounded-xl shadow-lg shadow-[#FF3269]/20 transition-all active:scale-[0.98]" disabled={loading || !otpSent}>
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Premium Account'}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </motion.div>
                        </AnimatePresence>
                    </Tabs>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-100" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                            <span className="bg-white px-4 text-slate-400">Social Connect</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <Button
                            variant="outline"
                            onClick={handleGoogleLogin}
                            className="h-12 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-bold flex items-center gap-2 transition-all active:scale-95"
                            disabled={loading}
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Google</span>
                        </Button>

                    </div>

                    <p className="mt-8 text-center text-xs text-slate-400 font-medium">
                        By continuing, you agree to our <button className="text-slate-900 border-b border-slate-300 hover:border-slate-900 transition-colors">Terms of Service</button>
                    </p>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
