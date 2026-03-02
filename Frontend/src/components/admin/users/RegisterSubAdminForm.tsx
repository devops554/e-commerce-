"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authService } from '@/services/auth.service'
import { Loader2, Mail, Lock, User, Phone, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
})

export default function RegisterSubAdminForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            phone: '',
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        try {
            await authService.registerSubAdmin(values)
            toast.success('Sub-admin registered successfully')
            router.push('/admin/subadmin')
        } catch (error: any) {
            // Error is handled by axios interceptor toast, but we can add specific handling if needed
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1 pb-6 text-center bg-linear-to-tr from-slate-900 to-slate-800 text-white">
                <div className="mx-auto w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3">
                    <ShieldCheck className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">Register Sub-admin</CardTitle>
                <CardDescription className="text-slate-400 font-medium pt-1">
                    Create a new administrative account with restricted permissions.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="John Doe"
                                                    className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-blue-500/10 font-medium"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="email"
                                                    placeholder="subadmin@bivha.com"
                                                    className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-blue-500/10 font-medium"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number (Optional)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="9876543210"
                                                    className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-blue-500/10 font-medium"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Temporary Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-blue-500/10 font-medium"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="h-12 rounded-xl px-6 font-bold text-slate-500 hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-8 shadow-xl shadow-slate-200 min-w-[180px]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    'Register Sub-admin'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
