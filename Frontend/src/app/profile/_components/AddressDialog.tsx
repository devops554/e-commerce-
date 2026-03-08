"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { UserAddress } from "@/services/user.service"
import { Loader2, Plus, Home, Briefcase, MapPin, X } from "lucide-react"

const addressSchema = z.object({
    label: z.string().min(2, "Label is required"),
    fullName: z.string().min(3, "Full name is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    street: z.string().min(5, "Street address is required"),
    landmark: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().min(6, "Valid postal code is required"),
    country: z.string().default("India"),
    isDefault: z.boolean().default(false),
})

type AddressFormValues = z.infer<typeof addressSchema>

interface AddressDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    address?: UserAddress | null;
    isLoading?: boolean;
}

const labelOptions = [
    { id: 'home', value: 'Home', icon: Home },
    { id: 'office', value: 'Office', icon: Briefcase },
    { id: 'other', value: 'Other', icon: MapPin },
]

const fieldClass = "h-11 rounded-xl border-slate-200 bg-slate-50 font-semibold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-[#FF3269]/20 focus:border-[#FF3269]/40 transition-all"

export function AddressDialog({ isOpen, onClose, onSubmit, address, isLoading }: AddressDialogProps) {
    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema) as any,
        defaultValues: address ? {
            label: address.label,
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            landmark: address.landmark || "",
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault,
        } : {
            label: "", fullName: "", phone: "", street: "",
            landmark: "", city: "", state: "",
            postalCode: "", country: "India", isDefault: false,
        },
    })

    const handleFormSubmit = async (values: AddressFormValues) => {
        await onSubmit(values)
        form.reset()
        onClose()
    }

    const watchedLabel = form.watch("label")

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-[480px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl max-h-[95vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-900 px-6 pt-6 pb-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3269]/15 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 rounded-xl bg-[#FF3269] flex items-center justify-center">
                                {address ? <MapPin className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                            </div>
                            <DialogTitle className="text-xl font-black text-white tracking-tight">
                                {address ? "Edit Address" : "Add New Address"}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-slate-400 text-sm font-medium pl-12">
                            {address ? "Update your saved address details." : "Enter your delivery details for faster checkout."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Form */}
                <div className="p-5 sm:p-6 bg-white">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">

                            {/* Label selector */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Address Type</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {labelOptions.map(({ id, value, icon: Icon }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => form.setValue('label', value)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 gap-1.5 ${watchedLabel === value
                                                    ? 'border-[#FF3269] bg-rose-50 text-[#FF3269]'
                                                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">{value}</span>
                                        </button>
                                    ))}
                                </div>
                                {form.formState.errors.label && (
                                    <p className="text-[10px] text-rose-500 mt-1 font-bold">{form.formState.errors.label.message}</p>
                                )}
                            </div>

                            {/* Name + Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <FormField control={form.control} name="fullName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</FormLabel>
                                        <FormControl><Input placeholder="John Doe" {...field} className={fieldClass} /></FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="phone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</FormLabel>
                                        <FormControl><Input placeholder="9876543210" {...field} className={`${fieldClass} font-mono`} /></FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                            </div>

                            {/* Street */}
                            <FormField control={form.control} name="street" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Street Address</FormLabel>
                                    <FormControl><Input placeholder="123 Main St, Apartment 4B" {...field} className={fieldClass} /></FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )} />

                            {/* Landmark */}
                            <FormField control={form.control} name="landmark" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Landmark <span className="text-slate-300 normal-case font-medium">(optional)</span></FormLabel>
                                    <FormControl><Input placeholder="Near City Mall" {...field} className={fieldClass} /></FormControl>
                                </FormItem>
                            )} />

                            {/* City + State */}
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">City</FormLabel>
                                        <FormControl><Input placeholder="Mumbai" {...field} className={fieldClass} /></FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="state" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">State</FormLabel>
                                        <FormControl><Input placeholder="Maharashtra" {...field} className={fieldClass} /></FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                            </div>

                            {/* Pin + Default */}
                            <div className="grid grid-cols-2 gap-3 items-end">
                                <FormField control={form.control} name="postalCode" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pin Code</FormLabel>
                                        <FormControl><Input placeholder="400001" {...field} className={`${fieldClass} font-mono`} /></FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="isDefault" render={({ field }) => (
                                    <FormItem className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 h-11 cursor-pointer">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="w-4 h-4 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none"
                                            />
                                        </FormControl>
                                        <FormLabel className="text-xs font-black text-slate-600 cursor-pointer leading-tight">Set as Default</FormLabel>
                                    </FormItem>
                                )} />
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-2xl bg-[#FF3269] hover:bg-[#e8215a] text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-[#FF3269]/25 transition-all active:scale-[0.98]"
                                >
                                    {isLoading
                                        ? <Loader2 className="w-5 h-5 animate-spin" />
                                        : address ? "Update Address" : "Save Address"
                                    }
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}