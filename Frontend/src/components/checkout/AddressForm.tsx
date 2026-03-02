"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, User as UserIcon, Navigation, Loader2, Home, Briefcase, Building } from "lucide-react"
import { getAddressFromCoords } from "@/lib/location"
import { useState } from "react"
import { toast } from "sonner"

const addressSchema = z.object({
    label: z.string().min(2, "Label must be at least 2 characters"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    street: z.string().min(5, "Street address must be at least 5 characters"),
    landmark: z.string().optional(),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    postalCode: z.string().min(6, "Postal code must be 6 digits"),
    country: z.string().min(2, "Country must be at least 2 characters"),
})

export type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormProps {
    onSubmit: (values: AddressFormValues) => void
    defaultValues?: Partial<AddressFormValues>
}

export function AddressForm({ onSubmit, defaultValues }: AddressFormProps) {
    const [detecting, setDetecting] = useState(false)
    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            label: defaultValues?.label || "Home",
            fullName: defaultValues?.fullName || "",
            phone: defaultValues?.phone || "",
            street: defaultValues?.street || "",
            landmark: defaultValues?.landmark || "",
            city: defaultValues?.city || "",
            state: defaultValues?.state || "",
            postalCode: defaultValues?.postalCode || "",
            country: defaultValues?.country || "India",
        },
    })

    const handleDetectLocation = () => {
        if (!("geolocation" in navigator)) {
            toast.error("Geolocation is not supported by your browser")
            return
        }

        setDetecting(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                const result = await getAddressFromCoords(latitude, longitude)

                if (result && result.address) {
                    const addr = result.address
                    form.setValue("street", addr.road || addr.suburb || addr.neighbourhood || "")
                    form.setValue("city", addr.city || addr.town || addr.village || "")
                    form.setValue("state", addr.state || "")
                    form.setValue("postalCode", addr.postcode || "")
                    form.setValue("country", addr.country || "India")
                    toast.success("Location detected and fields updated!")
                } else {
                    toast.error("Failed to fetch address from location")
                }
                setDetecting(false)
            },
            (error) => {
                console.error(error)
                toast.error("Error detecting location. Please check permissions.")
                setDetecting(false)
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        )
    }

    return (
        <Card className="border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
                    <MapPin className="h-5 w-5 text-primary" />
                    Shipping Address
                </CardTitle>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDetectLocation}
                    disabled={detecting}
                    className="rounded-full border-primary/20 hover:bg-primary/5 text-primary font-bold text-xs gap-2 h-9 px-4 transition-all active:scale-95"
                >
                    {detecting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Navigation className="h-3 w-3" />
                    )}
                    Detect My Location
                </Button>
            </CardHeader>
            <CardContent className="p-6">
                <Form {...form}>
                    <form id="address-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="label"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">Address Label</FormLabel>
                                        <FormControl>
                                            <div className="space-y-3">
                                                <div className="flex gap-3">
                                                    <Button
                                                        type="button"
                                                        variant={field.value?.toLowerCase() === 'home' ? 'default' : 'outline'}
                                                        className={`flex-1 h-12 rounded-xl gap-2 font-bold transition-all ${field.value?.toLowerCase() === 'home' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                                        onClick={() => form.setValue('label', 'Home')}
                                                    >
                                                        <Home className="w-4 h-4" />
                                                        Home
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={field.value?.toLowerCase() === 'work' || field.value?.toLowerCase() === 'office' ? 'default' : 'outline'}
                                                        className={`flex-1 h-12 rounded-xl gap-2 font-bold transition-all ${field.value?.toLowerCase() === 'work' || field.value?.toLowerCase() === 'office' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                                        onClick={() => form.setValue('label', 'Work')}
                                                    >
                                                        <Briefcase className="w-4 h-4" />
                                                        Work
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={['home', 'work', 'office'].includes(field.value?.toLowerCase() || '') ? 'outline' : 'default'}
                                                        className={`flex-1 h-12 rounded-xl gap-2 font-bold transition-all ${!['home', 'work', 'office'].includes(field.value?.toLowerCase() || '') ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                                        onClick={() => form.setValue('label', 'Other')}
                                                    >
                                                        <Building className="w-4 h-4" />
                                                        Other
                                                    </Button>
                                                </div>
                                                <div className="relative">
                                                    {field.value?.toLowerCase() === 'home' ? (
                                                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                    ) : field.value?.toLowerCase() === 'work' || field.value?.toLowerCase() === 'office' ? (
                                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                    ) : (
                                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                    )}
                                                    <Input placeholder="Or type custom label..." className="pl-10 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all font-bold" {...field} />
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="hidden md:block"></div> {/* Spacer */}

                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input placeholder="John Doe" className="pl-10 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all" {...field} />
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
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input placeholder="9876543210" className="pl-10 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="street"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">Street Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="House No., Street Name" className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="landmark"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">Landmark (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Near ABC Park" className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem className="col-span-1 md:col-span-2">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Mumbai" className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">State</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Maharashtra" className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="postalCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pincode</FormLabel>
                                        <FormControl>
                                            <Input placeholder="400001" className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">Country</FormLabel>
                                    <FormControl>
                                        <Input placeholder="India" className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                        >
                            Save Address & Continue
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
