"use client";

import React, { useState } from 'react'
import { Store, ChevronRight, Loader2, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/AuthContext'
import Link from 'next/link'
import axiosClient from '@/lib/axiosClient'
import { toast } from 'sonner'
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog'

import { getErrorMessage } from '@/utils/error-handler'

export default function SellerLoginPage() {
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axiosClient.post('/auth/login', { email, password })
            const { accessToken, refreshToken, user } = res.data
            toast.success(`Welcome back, ${user.name}!`)
            await login(accessToken, refreshToken, user, '/seller/onboarding')
        } catch (err: any) {
            toast.error(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-pink-200/50 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-rose-200/40 blur-[100px] rounded-full" />

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-pink-600 rounded-[2rem] shadow-xl shadow-pink-200 flex items-center justify-center mx-auto mb-6 transform hover:rotate-6 transition-all duration-300">
                        <Store className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-pink-950 mb-2 tracking-tight">Seller Login</h1>
                    <p className="text-pink-800/60 font-semibold">Scale your business with speed</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(255,182,193,0.2)]">
                    <form onSubmit={handleLogin} className="space-y-5">

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase tracking-[0.15em] text-pink-900/40 pl-2">
                                Email Address
                            </Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300 group-focus-within:text-pink-500 transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="h-14 pl-12 rounded-2xl border-pink-100 bg-white shadow-sm focus:border-pink-500 focus:ring-4 focus:ring-pink-500/5 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center pr-2">
                                <Label className="text-[11px] font-black uppercase tracking-[0.15em] text-pink-900/40 pl-2">
                                    Password
                                </Label>
                                <ForgotPasswordDialog trigger={
                                    <button type="button" className="text-[11px] font-bold text-pink-600 hover:text-pink-700 transition-colors">
                                        Forgot?
                                    </button>
                                } />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300 group-focus-within:text-pink-500 transition-colors" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="h-14 pl-12 pr-12 rounded-2xl border-pink-100 bg-white shadow-sm focus:border-pink-500 focus:ring-4 focus:ring-pink-500/5 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            className="w-full h-15 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg shadow-lg shadow-pink-200 transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Enter Dashboard <ChevronRight className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-pink-900/50 text-sm font-bold">
                        New to the platform?{' '}
                        <Link href="/seller/signup" className="text-pink-600 hover:underline decoration-2 underline-offset-4">
                            Become a seller
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}