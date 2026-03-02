"use client";

import { useState } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { SocialLogin } from './SocialLogin';

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login: setAuthData } = useAuth();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
            setAuthData(response.data.access_token, response.data.user);
            toast.success('Logged in successfully!');
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
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
                            type="password"
                            placeholder="••••••••"
                            className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-[#FF3269]/10 transition-all font-medium"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <Button className="w-full h-12 bg-[#FF3269] hover:bg-[#E62E5F] text-white font-bold rounded-xl shadow-lg shadow-[#FF3269]/20 transition-all active:scale-[0.98] group" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <span className="flex items-center gap-2">
                            Login <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    )}
                </Button>
            </form>
            <SocialLogin />
        </div>
    );
}