"use client"
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRegisterPartner } from '@/hooks/useDeliveryPartners'
import { useWarehouses } from '@/hooks/useWarehouses'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserPlus2, Mail, Lock, User, Phone, Loader2, Bike, MapPin, CreditCard } from 'lucide-react'

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    vehicleType: z.enum(['BIKE', 'SCOOTER', 'CAR', 'VAN']).default('BIKE'),
    vehicleNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    warehouseId: z.string().optional(),
    aadhaarNumber: z.string().min(12, 'Aadhaar must be 12 digits').max(12, 'Aadhaar must be 12 digits').optional().or(z.literal('')),
    panNumber: z.string().min(10, 'PAN must be 10 characters').max(10, 'PAN must be 10 characters').optional().or(z.literal('')),
    aadhaarImage: z.string().optional(),
    panImage: z.string().optional(),
    drivingLicenseImage: z.string().optional(),
})

const DeliveryPartnerRegistrationForm = () => {
    const router = useRouter()
    const { mutate: registerPartner, isPending } = useRegisterPartner()
    const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehouses()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            password: '',
            vehicleType: 'BIKE',
            vehicleNumber: '',
            licenseNumber: '',
            warehouseId: '',
            aadhaarNumber: '',
            panNumber: '',
            aadhaarImage: '',
            panImage: '',
            drivingLicenseImage: '',
        },
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // Clean up empty strings
        const cleanedValues = Object.fromEntries(
            Object.entries(values).map(([k, v]) => [k, v === '' ? undefined : v])
        ) as any;

        registerPartner(cleanedValues, {
            onSuccess: () => {
                toast.success('Delivery Partner registered successfully')
                router.push('/admin/delivery-partners')
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || 'Failed to register delivery partner')
            },
        })
    }

    return (
        <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
            <CardHeader className="p-8 pb-4 text-center">
                <div className="mx-auto h-16 w-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-600/20">
                    <Bike className="h-8 w-8" />
                </div>
                <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Register Partner</CardTitle>
                <CardDescription className="text-slate-500 font-bold text-lg mt-2">
                    Add a new delivery partner to the fleet.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Partner Information</h3>

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Full Name</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <Input
                                                        placeholder="Raju Kumar"
                                                        {...field}
                                                        className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-slate-900"
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
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Phone Number</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                                        <Phone className="h-5 w-5" />
                                                    </div>
                                                    <Input
                                                        placeholder="9876543210"
                                                        {...field}
                                                        className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-slate-900"
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
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                                        <Lock className="h-5 w-5" />
                                                    </div>
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        {...field}
                                                        className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-slate-900"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Logistics info */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Vehicle & Logistics</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="vehicleType"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                                        <SelectItem value="BIKE">Bike</SelectItem>
                                                        <SelectItem value="SCOOTER">Scooter</SelectItem>
                                                        <SelectItem value="CAR">Car</SelectItem>
                                                        <SelectItem value="VAN">Van</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="vehicleNumber"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Number</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="MH01AB1234"
                                                        {...field}
                                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold uppercase"
                                                    />
                                                </FormControl>
                                                <FormMessage className="font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="warehouseId"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Assign Warehouse</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-slate-400" />
                                                            <SelectValue placeholder="Select Warehouse" />
                                                        </div>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-2xl border-slate-100 shadow-xl max-h-60">
                                                    {warehouses?.map((w: any) => (
                                                        <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="licenseNumber"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">License Number</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                                        <CreditCard className="h-5 w-5" />
                                                    </div>
                                                    <Input
                                                        placeholder="DL-12345678"
                                                        {...field}
                                                        className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-slate-900"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Identity & Verification */}
                        <div className="space-y-6 pt-6 border-t border-slate-100">
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Identity & Verification</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="aadhaarNumber"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Aadhaar Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="0000 0000 0000"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold tracking-widest"
                                                />
                                            </FormControl>
                                            <FormMessage className="font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="panNumber"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">PAN Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="ABCDE1234F"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value.toUpperCase().slice(0, 10))}
                                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold uppercase tracking-widest"
                                                />
                                            </FormControl>
                                            <FormMessage className="font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Aadhaar Upload */}
                                <div className="space-y-2">
                                    <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Aadhaar Card</FormLabel>
                                    <div className="relative h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-600/30 hover:bg-blue-50/30 transition-all group flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    form.setValue('aadhaarImage', file.name);
                                                    toast.success('Aadhaar uploaded (mock)');
                                                }
                                            }}
                                        />
                                        {form.watch('aadhaarImage') ? (
                                            <div className="flex flex-col items-center">
                                                <CreditCard className="w-6 h-6 text-green-500 mb-1" />
                                                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{form.watch('aadhaarImage')}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-600">
                                                <CreditCard className="w-5 h-5 mb-1" />
                                                <span className="text-[10px] font-black uppercase">Upload Aadhar</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* PAN Upload */}
                                <div className="space-y-2">
                                    <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">PAN Card</FormLabel>
                                    <div className="relative h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-600/30 hover:bg-blue-50/30 transition-all group flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    form.setValue('panImage', file.name);
                                                    toast.success('PAN uploaded (mock)');
                                                }
                                            }}
                                        />
                                        {form.watch('panImage') ? (
                                            <div className="flex flex-col items-center">
                                                <CreditCard className="w-6 h-6 text-green-500 mb-1" />
                                                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{form.watch('panImage')}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-600">
                                                <CreditCard className="w-5 h-5 mb-1" />
                                                <span className="text-[10px] font-black uppercase">Upload PAN</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* License Upload */}
                                <div className="space-y-2">
                                    <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Driving License</FormLabel>
                                    <div className="relative h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-600/30 hover:bg-blue-50/30 transition-all group flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    form.setValue('drivingLicenseImage', file.name);
                                                    toast.success('License uploaded (mock)');
                                                }
                                            }}
                                        />
                                        {form.watch('drivingLicenseImage') ? (
                                            <div className="flex flex-col items-center">
                                                <CreditCard className="w-6 h-6 text-green-500 mb-1" />
                                                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{form.watch('drivingLicenseImage')}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-600">
                                                <CreditCard className="w-5 h-5 mb-1" />
                                                <span className="text-[10px] font-black uppercase">Upload License</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-6"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    Creating Partner Account...
                                </>
                            ) : (
                                'Register Delivery Partner'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default DeliveryPartnerRegistrationForm
