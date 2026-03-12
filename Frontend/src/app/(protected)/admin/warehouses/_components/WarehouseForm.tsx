import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createPortal } from 'react-dom'
import {
    Form, FormControl, FormField, FormItem,
    FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
    MapPin, Navigation, Loader2,
    CheckCircle2, MapPinned, Maximize2, X, Check,
} from 'lucide-react'
import { Warehouse } from '@/hooks/useWarehouses'
import { useAllUsers } from '@/hooks/useUser'
import worldData from '@/data/world.json'
import { FullscreenMapModal } from './FullMapModal'
import { reverseGeocode } from './ReverseGeocode'


// ── Schema (UNCHANGED) ────────────────────────────────────────────────────────
const warehouseSchema = z.object({
    code: z.string().min(3, "Code is required"),
    name: z.string().min(3, "Name is required"),
    managerId: z.string().optional(),
    contact: z.object({
        contactPerson: z.string().min(3, "Contact person is required"),
        phone: z.coerce.string().min(10, "Valid phone is required"),
        email: z.string().email("Valid email is required"),
    }),
    address: z.object({
        addressLine1: z.string().min(5, "Address is required"),
        addressLine2: z.string().optional(),
        city: z.string().min(2, "City is required"),
        state: z.string().min(2, "State is required"),
        country: z.string().min(2, "Country is required"),
        pincode: z.coerce.string().min(6, "Valid pincode is required"),
    }),
    location: z.object({
        latitude: z.coerce.number().default(0),
        longitude: z.coerce.number().default(0),
    }).default({ latitude: 0, longitude: 0 }),
    capacity: z.object({
        totalCapacity: z.number().min(1, "Capacity must be greater than 0"),
        usedCapacity: z.number().default(0),
    }),
    status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]).default("ACTIVE"),
    isPickupAvailable: z.boolean().default(true),
    isDeliveryAvailable: z.boolean().default(true),
    isDefaultWarehouse: z.boolean().default(false),
    notes: z.string().optional(),
})

interface WarehouseFormProps {
    initialData?: Warehouse | null
    onSubmit: (values: z.infer<typeof warehouseSchema>) => Promise<void>
    isLoading?: boolean
    buttonText?: string
}


// ── Fullscreen Map Modal ──────────────────────────────────────────────────────


// ── Main WarehouseForm ────────────────────────────────────────────────────────
export function WarehouseForm({ initialData, onSubmit, isLoading, buttonText }: WarehouseFormProps) {
    const [fullscreenOpen, setFullscreenOpen] = useState(false)
    const [detecting, setDetecting] = useState(false)
    const detectingRef = useRef(false)

    const form = useForm<z.infer<typeof warehouseSchema>>({
        resolver: zodResolver(warehouseSchema) as any,
        defaultValues: {
            code: '', name: '',
            contact: { contactPerson: '', phone: '', email: '' },
            address: { addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', pincode: '' },
            location: { latitude: 0, longitude: 0 },
            capacity: { totalCapacity: 0, usedCapacity: 0 },
            status: 'ACTIVE',
            isPickupAvailable: true, isDeliveryAvailable: true, isDefaultWarehouse: false,
        },
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                managerId: typeof initialData.managerId === 'object'
                    ? initialData.managerId?._id
                    : initialData.managerId || '',
                location: initialData.location || { latitude: 0, longitude: 0 },
            } as any)
        }
    }, [initialData, form])

    // ── Auto-geocode: address type karo → lat/lng silently set ───────────────
    const street = form.watch('address.addressLine1')
    const city = form.watch('address.city')
    const state = form.watch('address.state')
    const pincode = form.watch('address.pincode')
    const autoGeoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (!street?.trim() || !city?.trim()) return
        if (autoGeoTimer.current) clearTimeout(autoGeoTimer.current)
        autoGeoTimer.current = setTimeout(async () => {
            try {
                const q = [street, city, state, pincode].filter(Boolean).join(", ")
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
                    { headers: { "User-Agent": "DeliveryApp/1.0" } }
                )
                const data = await res.json()
                if (data?.[0]) {
                    form.setValue('location.latitude', parseFloat(data[0].lat), { shouldDirty: false, shouldValidate: false })
                    form.setValue('location.longitude', parseFloat(data[0].lon), { shouldDirty: false, shouldValidate: false })
                }
            } catch { /* silently fail */ }
        }, 900)
        return () => { if (autoGeoTimer.current) clearTimeout(autoGeoTimer.current) }
    }, [street, city, state, pincode])

    // ── formRef: GPS/fullscreen callbacks mein stale closure avoid ───────────
    const formRef = useRef(form)
    useEffect(() => { formRef.current = form }, [form])

    // ── GPS button ────────────────────────────────────────────────────────────
    const handleGetCurrentLocation = useCallback(() => {
        if (!("geolocation" in navigator)) return
        if (detectingRef.current) return          // duplicate call guard
        detectingRef.current = true
        setDetecting(true)
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const f = formRef.current
                f.setValue('location.latitude', coords.latitude)
                f.setValue('location.longitude', coords.longitude)
                const addr = await reverseGeocode(coords.latitude, coords.longitude)
                if (addr) {
                    if (addr.street) f.setValue('address.addressLine1', addr.street)
                    if (addr.city) f.setValue('address.city', addr.city)
                    if (addr.state) f.setValue('address.state', addr.state)
                    if (addr.pincode) f.setValue('address.pincode', addr.pincode)
                    if (addr.country) f.setValue('address.country', addr.country)
                }
                detectingRef.current = false
                setDetecting(false)
            },
            () => { detectingRef.current = false; setDetecting(false) },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }, []) // no deps — kabhi recreate nahi hoga

    // ── Fullscreen map confirm ────────────────────────────────────────────────
    const handleFullscreenConfirm = useCallback((
        loc: { latitude: number; longitude: number },
        addr: Awaited<ReturnType<typeof reverseGeocode>>
    ) => {
        const f = formRef.current
        f.setValue('location.latitude', loc.latitude)
        f.setValue('location.longitude', loc.longitude)
        if (addr) {
            if (addr.street) f.setValue('address.addressLine1', addr.street)
            if (addr.city) f.setValue('address.city', addr.city)
            if (addr.state) f.setValue('address.state', addr.state)
            if (addr.pincode) f.setValue('address.pincode', addr.pincode)
            if (addr.country) f.setValue('address.country', addr.country)
        }
        setFullscreenOpen(false)
    }, []) // no deps

    // ── World data dropdowns (UNCHANGED) ─────────────────────────────────────
    const countries = useMemo(() => (worldData as any[]).map(c => c.name), [])
    const selectedCountryName = form.watch('address.country')
    const selectedCountry = useMemo(() => (worldData as any[]).find(c => c.name === selectedCountryName), [selectedCountryName])
    const states = useMemo(() => selectedCountry?.states.map((s: any) => s.name) || [], [selectedCountry])
    const selectedStateName = form.watch('address.state')
    const selectedState = useMemo(() => selectedCountry?.states.find((s: any) => s.name === selectedStateName), [selectedCountry, selectedStateName])
    const cities = useMemo(() => selectedState?.cities.map((c: any) => typeof c === 'string' ? c : c.name) || [], [selectedState])

    const { data: userData } = useAllUsers('1', '100', 'manager')
    const managers = useMemo(() => userData?.users || [], [userData])

    const watchLat = form.watch('location.latitude')
    const watchLng = form.watch('location.longitude')
    const hasLocation = !!watchLat && watchLat !== 0

    const onError = (errors: any) => console.log('Form validation errors:', errors)

    return (
        <>
            {fullscreenOpen && (
                <FullscreenMapModal
                    location={hasLocation ? { latitude: watchLat, longitude: watchLng } : null}
                    onConfirm={handleFullscreenConfirm}
                    onClose={() => setFullscreenOpen(false)}
                />
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-slate-50 p-1 mb-6">
                            <TabsTrigger value="basic" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">Basic Info</TabsTrigger>
                            <TabsTrigger value="address" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">Address</TabsTrigger>
                            <TabsTrigger value="settings" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">Settings</TabsTrigger>
                        </TabsList>

                        {/* ── Basic Info (UNCHANGED) ── */}
                        <TabsContent value="basic" className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="code" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-700">Warehouse Code</FormLabel>
                                        <FormControl><Input placeholder="WH-001" {...field} className="rounded-xl bg-slate-50/50 border-slate-100 h-11" disabled={!!initialData} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-700">Warehouse Name</FormLabel>
                                        <FormControl><Input placeholder="Central Hub" {...field} className="rounded-xl bg-slate-50/50 border-slate-100 h-11" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="managerId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-slate-700">Warehouse Manager</FormLabel>
                                    <Select onValueChange={(v) => field.onChange(v === "none" ? "" : v)} value={field.value || "none"}>
                                        <FormControl>
                                            <SelectTrigger className="rounded-xl bg-slate-50/50 border-slate-100 h-11">
                                                <SelectValue placeholder="Assign a manager (Optional)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl border-slate-100">
                                            <SelectItem value="none">De-assign Manager</SelectItem>
                                            {managers.map((m: any) => (
                                                <SelectItem key={m._id} value={m._id}>{m.name} ({m.email})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription className="text-[10px] text-slate-400">
                                        Managers can handle stock and dispatches for this facility.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="space-y-4 border rounded-2xl p-4 bg-slate-50/30">
                                <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Contact Details</p>
                                <FormField control={form.control} name="contact.contactPerson" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-700 text-xs">Contact Person Name</FormLabel>
                                        <FormControl><Input {...field} className="rounded-xl bg-white border-slate-100 h-10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="contact.email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700 text-xs">Email</FormLabel>
                                            <FormControl><Input type="email" {...field} className="rounded-xl bg-white border-slate-100 h-10" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="contact.phone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700 text-xs">Phone</FormLabel>
                                            <FormControl><Input {...field} className="rounded-xl bg-white border-slate-100 h-10" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                        </TabsContent>

                        {/* ── Address tab — coordinates section ENHANCED ── */}
                        <TabsContent value="address" className="space-y-4 pt-2">
                            <FormField control={form.control} name="address.addressLine1" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-slate-700">Address Line 1</FormLabel>
                                    <FormControl><Input {...field} className="rounded-xl bg-slate-50/50 border-slate-100 h-11" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="address.country" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-700">Country</FormLabel>
                                        <Select onValueChange={(v) => { field.onChange(v); form.setValue('address.state', ''); form.setValue('address.city', '') }} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl bg-slate-50/50 border-slate-100 h-11"><SelectValue placeholder="Select country" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-60">
                                                {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="address.state" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-700">State</FormLabel>
                                        <Select onValueChange={(v) => { field.onChange(v); form.setValue('address.city', '') }} value={field.value} disabled={!selectedCountryName}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl bg-slate-50/50 border-slate-100 h-11"><SelectValue placeholder="Select state" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-60">
                                                {states.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="address.city" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-700">City</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedStateName}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl bg-slate-50/50 border-slate-100 h-11"><SelectValue placeholder="Select city" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-60">
                                                {cities.map((city: string) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="address.pincode" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-700">Pincode</FormLabel>
                                        <FormControl><Input {...field} className="rounded-xl bg-slate-50/50 border-slate-100 h-11" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            {/* ── Coordinates — ENHANCED (was just 2 inputs before) ── */}
                            <div className="space-y-3 border rounded-2xl p-4 bg-slate-50/30">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Coordinates</p>
                                    <div className="flex items-center gap-2">
                                        {/* GPS — fixed: useCallback + ref + duplicate guard */}
                                        <Button type="button" variant="outline" size="sm"
                                            onClick={handleGetCurrentLocation} disabled={detecting}
                                            className="h-7 text-[10px] rounded-lg font-bold gap-1.5">
                                            {detecting
                                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                                : <Navigation className="w-3 h-3" />}
                                            {detecting ? "Detecting…" : "Get Current Location"}
                                        </Button>
                                        {/* NEW: Fullscreen map */}
                                        <Button type="button" variant="outline" size="sm"
                                            onClick={() => setFullscreenOpen(true)}
                                            className="h-7 text-[10px] rounded-lg font-bold gap-1.5">
                                            <Maximize2 className="w-3 h-3" />
                                            Pick on Map
                                        </Button>
                                    </div>
                                </div>

                                {/* NEW: Location status indicator */}
                                <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${hasLocation
                                    ? "bg-green-50 border-green-100"
                                    : "bg-white border-dashed border-slate-200"
                                    }`}>
                                    {hasLocation ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-green-700">Location captured</p>
                                                <p className="text-[10px] font-mono text-green-600">
                                                    {watchLat?.toFixed(5)}, {watchLng?.toFixed(5)}
                                                </p>
                                            </div>
                                            <button type="button" onClick={() => setFullscreenOpen(true)}
                                                className="text-[10px] font-black text-green-700 underline underline-offset-2 shrink-0">
                                                Edit on Map
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <MapPin className="w-4 h-4 text-slate-300 shrink-0" />
                                            <p className="text-[10px] font-bold text-slate-400">
                                                Fill address fields to auto-capture, or use buttons above
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Manual inputs (UNCHANGED) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="location.latitude" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700 text-xs">Latitude</FormLabel>
                                            <FormControl><Input type="number" step="any" {...field} className="rounded-xl bg-white border-slate-100 h-10" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="location.longitude" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700 text-xs">Longitude</FormLabel>
                                            <FormControl><Input type="number" step="any" {...field} className="rounded-xl bg-white border-slate-100 h-10" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>

                            <FormField control={form.control} name="capacity.totalCapacity" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-slate-700">Total Capacity (Units)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field}
                                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                            className="rounded-xl bg-slate-50/50 border-slate-100 h-11" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </TabsContent>

                        {/* ── Settings (UNCHANGED) ── */}
                        <TabsContent value="settings" className="space-y-6 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-700">Operational Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl bg-slate-50/50 border-slate-100 h-11"><SelectValue placeholder="Select status" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-slate-100">
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className="space-y-4">
                                    <FormField control={form.control} name="isDefaultWarehouse" render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-xl border p-3 bg-rose-50/30 border-rose-100">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm font-black text-rose-900">Default Warehouse</FormLabel>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="isPickupAvailable" render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-xl border p-3 bg-slate-50/50">
                                        <FormLabel className="text-sm font-bold text-slate-600">Pickup Available</FormLabel>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="isDeliveryAvailable" render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-xl border p-3 bg-slate-50/50">
                                        <FormLabel className="text-sm font-bold text-slate-600">Delivery Available</FormLabel>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="notes" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-slate-700">Internal Notes</FormLabel>
                                    <FormControl><Textarea {...field} className="rounded-xl bg-slate-50/50 border-slate-100 min-h-[100px]" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" loading={isLoading} className="rounded-xl bg-slate-900 hover:bg-black px-8 font-black shadow-lg h-12">
                            {buttonText || (initialData ? 'Update Warehouse' : 'Save Warehouse')}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    )
}