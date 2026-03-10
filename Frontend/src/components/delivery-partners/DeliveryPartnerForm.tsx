"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRegisterPartner, useUpdatePartner } from '@/hooks/useDeliveryPartners'
import { useWarehouses } from '@/hooks/useWarehouses'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'
import { Bike, Shield, User, Phone, Mail, MapPin, CreditCard, Droplet, Search } from 'lucide-react'
import { DeliveryPartner } from '@/services/delivery-partner.service'
import worldData from '@/data/world.json'

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
    vehicleType: z.enum(['BIKE', 'SCOOTER', 'CAR', 'VAN']),
    vehicleNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    warehouseIds: z.array(z.string()).min(1, 'Select at least one warehouse'),
    bloodGroup: z.string().optional(),
    aadhaarNumber: z.string().min(12, 'Aadhaar must be 12 digits').max(12).optional().or(z.literal('')),
    panNumber: z.string().min(10, 'PAN must be 10 characters').max(10).optional().or(z.literal('')),
    permanentAddress: z.object({
        addressLine: z.string().default(''),
        city: z.string().default(''),
        state: z.string().default(''),
        country: z.string().default('India'),
        pincode: z.string().default(''),
    }),
    currentAddress: z.object({
        addressLine: z.string().default(''),
        city: z.string().default(''),
        state: z.string().default(''),
        country: z.string().default('India'),
        pincode: z.string().default(''),
    }),
})

type FormValues = z.infer<typeof formSchema>

interface DeliveryPartnerFormProps {
    initialData?: DeliveryPartner;
    mode?: 'register' | 'update';
}

const DeliveryPartnerForm = ({ initialData, mode = 'register' }: DeliveryPartnerFormProps) => {
    const router = useRouter()
    const registerPartner = useRegisterPartner()
    const updatePartner = useUpdatePartner()
    const { data: warehouses } = useWarehouses()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: initialData?.name || '',
            phone: initialData?.phone || '',
            email: initialData?.email || '',
            password: '',
            vehicleType: (initialData?.vehicleType as any) || 'BIKE',
            vehicleNumber: initialData?.vehicleNumber || '',
            licenseNumber: initialData?.licenseNumber || '',
            warehouseIds: initialData?.warehouseIds?.map(wh => typeof wh === 'string' ? wh : wh._id) || [],
            bloodGroup: initialData?.bloodGroup || '',
            aadhaarNumber: initialData?.documents?.aadhaarNumber || '',
            panNumber: initialData?.documents?.panNumber || '',
            permanentAddress: {
                addressLine: initialData?.permanentAddress?.addressLine || '',
                city: initialData?.permanentAddress?.city || '',
                state: initialData?.permanentAddress?.state || '',
                country: initialData?.permanentAddress?.country || 'India',
                pincode: initialData?.permanentAddress?.pincode || '',
            },
            currentAddress: {
                addressLine: initialData?.currentAddress?.addressLine || '',
                city: initialData?.currentAddress?.city || '',
                state: initialData?.currentAddress?.state || '',
                country: initialData?.currentAddress?.country || 'India',
                pincode: initialData?.currentAddress?.pincode || '',
            }
        },
    })

    // Watchers for address filtering
    const permCountry = form.watch('permanentAddress.country')
    const permState = form.watch('permanentAddress.state')
    const currCountry = form.watch('currentAddress.country')
    const currState = form.watch('currentAddress.state')

    const getStates = (countryName: string) => {
        return (worldData as any[]).find(c => c.name === countryName)?.states || []
    }

    const getCities = (countryName: string, stateName: string) => {
        const country = (worldData as any[]).find(c => c.name === countryName)
        const state = country?.states.find((s: any) => s.name === stateName)
        return state?.cities || []
    }

    // Options
    const countries = (worldData as any[]).map(c => c.name)
    const permStates = getStates(permCountry)
    const permCities = getCities(permCountry, permState)
    const currStates = getStates(currCountry)
    const currCities = getCities(currCountry, currState)

    const onSubmit = (values: FormValues) => {
        if (mode === 'update' && initialData) {
            const updateData: any = { ...values };
            if (!updateData.password) delete updateData.password;

            updatePartner.mutate({ id: initialData._id, data: updateData }, {
                onSuccess: () => {
                    toast.success('Partner updated successfully')
                    router.push('/admin/delivery-partners')
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || 'Update failed')
                }
            })
        } else {
            if (!values.password) {
                toast.error('Password is required for registration')
                return;
            }
            registerPartner.mutate(values as any, {
                onSuccess: () => {
                    toast.success('Delivery partner registered successfully')
                    router.push('/admin/delivery-partners')
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || 'Registration failed')
                }
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2 px-1">
                            <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Basic Profile</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personal Details</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-blue-500/20 font-bold transition-all" />
                                        </FormControl>
                                        <FormMessage className="font-bold" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Phone Number</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input placeholder="9876543210" {...field} className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold" />
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
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Email (Optional)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input placeholder="john@example.com" {...field} className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">
                                            {mode === 'register' ? 'Initial Password' : 'New Password (leave blank to keep current)'}
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold" />
                                        </FormControl>
                                        <FormMessage className="font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bloodGroup"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Blood Group</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                                                    <div className="flex items-center gap-2">
                                                        <Droplet className="h-4 w-4 text-rose-500" />
                                                        <SelectValue placeholder="Select Blood Group" />
                                                    </div>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="font-bold" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Fleet & Logistics */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2 px-1">
                            <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                                <Bike className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Logistics</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle & Warehouse</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="vehicleType"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Vehicle Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold capitalize">
                                                        <SelectValue placeholder="Select vehicle" />
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
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Reg. Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="MH 12 AB 1234" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold uppercase" />
                                            </FormControl>
                                            <FormMessage className="font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="licenseNumber"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Driving License No.</FormLabel>
                                        <FormControl>
                                            <Input placeholder="DL-1234567890123" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold uppercase" />
                                        </FormControl>
                                        <FormMessage className="font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="warehouseIds"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Assign Warehouses</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                options={warehouses?.map((w: any) => ({ label: w.name, value: w._id })) || []}
                                                selected={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select Warehouses"
                                            />
                                        </FormControl>
                                        <FormMessage className="font-bold" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Identity Documents */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2 px-1">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Identity</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification Details</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-5">
                            <FormField
                                control={form.control}
                                name="aadhaarNumber"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Aadhaar Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input placeholder="1234 5678 9012" {...field} className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold" />
                                            </div>
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
                                            <Input placeholder="ABCDE1234F" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold uppercase" />
                                        </FormControl>
                                        <FormMessage className="font-bold" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Address Section - Permanent */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2 px-1">
                            <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Permanent Address</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Legal Residence</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-4">
                            <FormField
                                control={form.control}
                                name="permanentAddress.addressLine"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Street Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123, Street Name" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="permanentAddress.country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Country</FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    form.setValue('permanentAddress.state', '');
                                                    form.setValue('permanentAddress.city', '');
                                                }}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                                                        <SelectValue placeholder="Select Country" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-60 rounded-2xl">
                                                    {countries.map((c: any) => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="permanentAddress.state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">State</FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    form.setValue('permanentAddress.city', '');
                                                }}
                                                value={field.value}
                                                disabled={!permCountry}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                                                        <SelectValue placeholder="Select State" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-60 rounded-2xl">
                                                    {permStates.map((s: any) => (
                                                        <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="permanentAddress.city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">City</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!permState}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                                                        <SelectValue placeholder="Select City" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-60 rounded-2xl">
                                                    {permCities.map((c: any) => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="permanentAddress.pincode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Pincode</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Pincode" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2 px-1">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Current Address</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Location</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="text-xs font-bold"
                            onClick={() => {
                                const perm = form.getValues('permanentAddress');
                                if (perm) {
                                    form.setValue('currentAddress', { ...perm });
                                }
                            }}
                        >
                            Same as Permanent Address
                        </Button>
                        <FormField
                            control={form.control}
                            name="currentAddress.addressLine"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Street Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123, Street Name" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currentAddress.country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Country</FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                form.setValue('currentAddress.state', '');
                                                form.setValue('currentAddress.city', '');
                                            }}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                                                    <SelectValue placeholder="Select Country" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-60 rounded-2xl">
                                                {countries.map((c: any) => (
                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentAddress.state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">State</FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                form.setValue('currentAddress.city', '');
                                            }}
                                            value={field.value}
                                            disabled={!currCountry}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                                                    <SelectValue placeholder="Select State" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-60 rounded-2xl">
                                                {currStates.map((s: any) => (
                                                    <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currentAddress.city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">City</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!currState}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                                                    <SelectValue placeholder="Select City" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-60 rounded-2xl">
                                                {currCities.map((c: any) => (
                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentAddress.pincode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Pincode</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Pincode" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        className="h-14 px-8 rounded-2xl text-slate-500 font-bold hover:bg-slate-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={registerPartner.isPending || updatePartner.isPending}
                        className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-black shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
                    >
                        {mode === 'register'
                            ? (registerPartner.isPending ? 'Registering...' : 'Complete Registration')
                            : (updatePartner.isPending ? 'Updating...' : 'Save Changes')
                        }
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default DeliveryPartnerForm
