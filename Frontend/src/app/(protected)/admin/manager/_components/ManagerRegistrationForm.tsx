"use client"
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRegisterManager } from '@/hooks/useUser'
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserPlus2, Mail, Lock, User, Phone, Loader2 } from 'lucide-react'

const formSchema = z.z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
})

const ManagerRegistrationForm = () => {
    const router = useRouter()
    const { mutate: registerManager, isPending } = useRegisterManager()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            phone: '',
        },
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        registerManager(values, {
            onSuccess: () => {
                toast.success('Manager registered successfully')
                router.push('/admin/manager')
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || 'Failed to register manager')
            },
        })
    }

    return (
        <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
            <CardHeader className="p-8 pb-4 text-center">
                <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white mb-6 shadow-xl shadow-slate-900/20">
                    <UserPlus2 className="h-8 w-8" />
                </div>
                <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Create Manager</CardTitle>
                <CardDescription className="text-slate-500 font-bold text-lg mt-2">
                    Register a new facility manager to the platform.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Full Name</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <Input
                                                placeholder="John Doe"
                                                {...field}
                                                className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="font-bold" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Email Address</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <Input
                                                placeholder="manager@example.com"
                                                {...field}
                                                className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="font-bold" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Password</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                                className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="font-bold" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Phone Number (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <Input
                                                placeholder="+1 (555) 000-0000"
                                                {...field}
                                                className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="font-bold" />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-lg shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-4"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Register Manager'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default ManagerRegistrationForm
