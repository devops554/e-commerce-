"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, ChevronRight, Mail, User, Lock, ShieldCheck, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/AuthContext'
import Link from 'next/link'
import axiosClient from '@/lib/axiosClient'
import { toast } from 'sonner'

import { getErrorMessage } from '@/utils/error-handler'

type Step = 'form' | 'otp'

export default function SellerSignupPage() {
    const { login } = useAuth()

    const [step, setStep] = useState<Step>('form')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [otpResending, setOtpResending] = useState(false)

    // Password validation helper
    const isPasswordLongEnough = password.length >= 6
    const passwordsMatch = password === confirmPassword && password.length > 0

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!passwordsMatch) {
            toast.error('Passwords do not match.')
            return
        }
        setLoading(true)
        try {
            await axiosClient.post('/auth/request-otp', { email })
            toast.success('OTP sent to your email!')
            setStep('otp')
        } catch (err: any) {
            toast.error(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axiosClient.post('/auth/register', { name, email, password, otp })
            const { accessToken, refreshToken, user } = res.data
            toast.success('Account created!')
            await login(accessToken, refreshToken, user, '/seller/onboarding')
        } catch (err: any) {
            toast.error(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Decorative Glows */}
            <div className="absolute top-[-5%] right-[-5%] w-96 h-96 bg-pink-200/40 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-5%] left-[-5%] w-96 h-96 bg-rose-200/30 blur-[100px] rounded-full" />

            <div className="max-w-md w-full relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-pink-600 rounded-2xl shadow-xl shadow-pink-200 flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-pink-950 mb-1 tracking-tight italic">
                        Partner <span className="text-pink-600">Portal</span>
                    </h1>
                    <p className="text-pink-800/60 text-sm font-bold uppercase tracking-tighter">
                        Build your instant store
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-8 px-10">
                    <div className="flex-1 h-1.5 rounded-full bg-pink-600" />
                    <div className={`flex-1 h-1.5 rounded-full transition-all duration-700 ${step === 'otp' ? 'bg-pink-600' : 'bg-pink-100'}`} />
                </div>

                <AnimatePresence mode="wait">
                    {step === 'form' ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-[0_20px_50px_rgba(255,182,193,0.15)]"
                        >
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                {/* Name */}
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-pink-400 pl-2">Owner Name</Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-200 group-focus-within:text-pink-500 transition-colors" />
                                        <Input
                                            placeholder="Enter your full name"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="h-12 pl-12 rounded-xl border-pink-50 bg-pink-50/30 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/5 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-pink-400 pl-2">Business Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-200 group-focus-within:text-pink-500 transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="h-12 pl-12 rounded-xl border-pink-50 bg-pink-50/30 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/5 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-pink-400 pl-2">Secure Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-200 group-focus-within:text-pink-500 transition-colors" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="h-12 pl-12 pr-12 rounded-xl border-pink-50 bg-pink-50/30 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/5 transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-200 hover:text-pink-500"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {isPasswordLongEnough && (
                                        <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-1 pl-2">
                                            <CheckCircle2 className="w-3 h-3" /> Valid length
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-pink-400 pl-2">Confirm</Label>
                                    <Input
                                        type="password"
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className={`h-12 rounded-xl border-pink-50 bg-pink-50/30 focus:bg-white focus:ring-4 transition-all ${passwordsMatch ? 'focus:border-emerald-500 focus:ring-emerald-500/5' : 'focus:border-pink-500 focus:ring-pink-500/5'}`}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || !passwordsMatch}
                                    className="w-full h-14 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg shadow-lg shadow-pink-100 mt-2 transition-all active:scale-[0.98]"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Account'}
                                </Button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-[0_20px_50px_rgba(255,182,193,0.15)]"
                        >
                            <button onClick={() => setStep('form')} className="mb-6 flex items-center gap-1 text-pink-400 font-bold text-xs hover:text-pink-600 transition-colors">
                                <ArrowLeft className="w-3 h-3" /> BACK TO DETAILS
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-pink-200">
                                    <ShieldCheck className="w-7 h-7 text-pink-600" />
                                </div>
                                <h3 className="font-black text-pink-950 text-xl tracking-tight">Verify Identity</h3>
                                <p className="text-xs text-pink-800/60 font-medium">Code sent to: {email}</p>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-6">
                                <Input
                                    type="text"
                                    placeholder="••••••"
                                    maxLength={6}
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="h-16 rounded-2xl border-pink-100 bg-pink-50/30 text-center text-3xl font-black tracking-[0.3em] focus:border-pink-500 transition-all"
                                    required
                                />

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 rounded-2xl bg-pink-950 hover:bg-black text-white font-bold text-lg shadow-xl"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify & Launch'}
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => {/* handleResend */ }}
                                        className="text-[10px] font-black uppercase tracking-widest text-pink-400 hover:text-pink-600 transition-colors"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-pink-900/40 text-xs font-bold uppercase tracking-widest">
                        Already have an account?{' '}
                        <Link href="/seller/login" className="text-pink-600 hover:text-pink-700 underline decoration-2 underline-offset-4">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}