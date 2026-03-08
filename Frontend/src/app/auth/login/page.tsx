"use client";

import { LoginForm } from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px] bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-linear-to-tr from-primary to-[#FF6B95] rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
                        <span className="text-3xl font-black text-white">B</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900">Welcome Back<span className="text-[#FF3269]">.</span></h1>
                    <p className="text-slate-500 font-medium mt-2">Log in to your premium account</p>
                </div>

                <LoginForm />

                <p className="mt-8 text-center text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link href="/auth/register" className="text-[#FF3269] font-bold hover:underline">
                        Register Now
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}