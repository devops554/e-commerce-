"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useCallback, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    MapPin, Phone, User as UserIcon, Navigation, Loader2,
    Home, Briefcase, Building, CheckCircle2, XCircle,
    MapPinned, Maximize2, X, Check,
} from "lucide-react"
import { useAutoGeocode } from "@/hooks/useAutoGeocode"
import { CountryStateCitySelect } from "./CountryStateCitySelect"

// ── Reverse geocode ───────────────────────────────────────────────────────────
async function reverseGeocode(lat: number, lng: number) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { "User-Agent": "DeliveryApp/1.0" } }
        )
        const data = await res.json()
        if (!data?.address) return null
        const a = data.address
        return {
            display: data.display_name as string,
            street: [a.road || a.pedestrian || a.suburb, a.house_number].filter(Boolean).join(" ") || "",
            city: a.city || a.town || a.village || a.county || "",
            state: a.state || "",
            postalCode: a.postcode || "",
            country: a.country || "India",
        }
    } catch { return null }
}

// ── Schema ────────────────────────────────────────────────────────────────────
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
    location: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
})

export type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormProps {
    onSubmit: (values: AddressFormValues) => void
    defaultValues?: Partial<AddressFormValues>
}

// ── Shared Leaflet map logic ──────────────────────────────────────────────────
function useLeafletMap({
    containerRef,
    initialLocation,
    onPinChange,
}: {
    containerRef: React.RefObject<HTMLDivElement | null>
    initialLocation: { latitude: number; longitude: number } | null
    onPinChange: (loc: { latitude: number; longitude: number }) => void
}) {
    const mapRef = useRef<any>(null)
    const markerRef = useRef<any>(null)
    const initRef = useRef(false)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (initRef.current || !containerRef.current) return
        initRef.current = true
            ; (async () => {
                const L = (await import("leaflet")).default
                delete (L.Icon.Default.prototype as any)._getIconUrl
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                })
                const center: [number, number] = initialLocation
                    ? [initialLocation.latitude, initialLocation.longitude]
                    : [20.5937, 78.9629]
                const map = L.map(containerRef.current!, { center, zoom: initialLocation ? 15 : 5 })
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>', maxZoom: 19,
                }).addTo(map)

                const pinIcon = L.divIcon({
                    className: "",
                    html: `<div style="width:32px;height:40px;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 8px rgba(0,0,0,.35))">
                    <div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:#EF4444;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(239,68,68,.5)"></div>
                    <div style="width:4px;height:8px;background:#EF4444;border-radius:0 0 4px 4px;margin-top:-2px"></div>
                </div>`,
                    iconSize: [32, 40], iconAnchor: [16, 40],
                })

                const addOrMove = (lat: number, lng: number) => {
                    if (markerRef.current) markerRef.current.setLatLng([lat, lng])
                    else {
                        const m = L.marker([lat, lng], { draggable: true, icon: pinIcon }).addTo(map)
                        m.on("dragend", (e: any) => {
                            const { lat: la, lng: lo } = e.target.getLatLng()
                            onPinChange({ latitude: la, longitude: lo })
                        })
                        markerRef.current = m
                    }
                }

                if (initialLocation) addOrMove(initialLocation.latitude, initialLocation.longitude)

                map.on("click", (e: any) => {
                    addOrMove(e.latlng.lat, e.latlng.lng)
                    onPinChange({ latitude: e.latlng.lat, longitude: e.latlng.lng })
                })

                mapRef.current = map
                setReady(true)
            })()
        return () => {
            mapRef.current?.remove()
            mapRef.current = null; markerRef.current = null; initRef.current = false
            setReady(false)
        }
    }, [])

    // Sync marker from outside
    const syncLocation = useCallback((loc: { latitude: number; longitude: number } | null) => {
        if (!loc || !mapRef.current || !ready) return
        markerRef.current?.setLatLng([loc.latitude, loc.longitude])
        mapRef.current.setView([loc.latitude, loc.longitude], 15, { animate: true })
    }, [ready])

    return { ready, syncLocation }
}

// ── Small inline map ──────────────────────────────────────────────────────────
function InlineMap({ location, onLocationChange, onOpenFull }: {
    location: { latitude: number; longitude: number } | null
    onLocationChange: (loc: { latitude: number; longitude: number }) => void
    onOpenFull: () => void
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [geocoding, setGeocoding] = useState(false)
    const [pinnedAddress, setPinnedAddress] = useState<string | null>(null)
    const [geocodeFailed, setGeocodeFailed] = useState(false)

    const fetchAddress = useCallback(async (lat: number, lng: number) => {
        setGeocoding(true); setGeocodeFailed(false); setPinnedAddress(null)
        const r = await reverseGeocode(lat, lng)
        setGeocoding(false)
        if (r?.display) setPinnedAddress(r.display.split(",").slice(0, 3).join(","))
        else setGeocodeFailed(true)
    }, [])

    const handlePin = useCallback((loc: { latitude: number; longitude: number }) => {
        onLocationChange(loc)
        fetchAddress(loc.latitude, loc.longitude)
    }, [onLocationChange, fetchAddress])

    const { ready, syncLocation } = useLeafletMap({
        containerRef,
        initialLocation: location,
        onPinChange: handlePin,
    })

    useEffect(() => {
        if (location) { syncLocation(location); fetchAddress(location.latitude, location.longitude) }
    }, [location?.latitude, location?.longitude, ready])

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="relative">
                <div ref={containerRef} style={{ height: 200, width: "100%" }} />
                {!ready && (
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                )}
                {geocoding && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-white/95 rounded-full px-3 py-1.5 shadow flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        <span className="text-xs font-bold text-slate-600">Fetching address…</span>
                    </div>
                )}
                {location && (
                    <div className="absolute top-2 right-2 z-20 bg-slate-900/80 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                        <MapPinned className="w-3 h-3 text-red-400" />
                        <span className="text-[10px] font-bold text-white font-mono">
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </span>
                    </div>
                )}
                {/* Fullscreen button */}
                <button
                    type="button"
                    onClick={onOpenFull}
                    className="absolute bottom-2 right-2 z-20 bg-white rounded-xl px-3 py-2 shadow-md
                        flex items-center gap-2 text-xs font-black text-slate-700
                        hover:bg-primary hover:text-white transition-all border border-slate-200"
                >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Full Map
                </button>
            </div>

            {/* Pin address bar */}
            <div className="px-4 py-3 bg-white border-t border-slate-100 min-h-[44px] flex items-center gap-2">
                {geocoding ? (
                    <><Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                        <span className="text-xs font-bold text-slate-500">Getting address…</span></>
                ) : pinnedAddress ? (
                    <><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 leading-relaxed">{pinnedAddress}</span></>
                ) : geocodeFailed ? (
                    <><XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="text-xs font-bold text-red-500">Address not found — try another spot</span></>
                ) : (
                    <><MapPin className="w-4 h-4 text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-400 font-medium">Click map or drag pin to set location</span></>
                )}
            </div>
            <style>{`@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');`}</style>
        </div>
    )
}

// ── Fullscreen Map Modal ──────────────────────────────────────────────────────
function FullscreenMapModal({ location, onConfirm, onClose }: {
    location: { latitude: number; longitude: number } | null
    onConfirm: (loc: { latitude: number; longitude: number }, addr: Awaited<ReturnType<typeof reverseGeocode>>) => void
    onClose: () => void
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [tempLoc, setTempLoc] = useState(location)
    const [geocoding, setGeocoding] = useState(false)
    const [addrPreview, setAddrPreview] = useState<string | null>(null)
    const [addrData, setAddrData] = useState<Awaited<ReturnType<typeof reverseGeocode>>>(null)

    const fetchAddress = useCallback(async (lat: number, lng: number) => {
        setGeocoding(true); setAddrPreview(null)
        const r = await reverseGeocode(lat, lng)
        setGeocoding(false)
        setAddrData(r)
        if (r?.display) setAddrPreview(r.display.split(",").slice(0, 4).join(","))
    }, [])

    const handlePin = useCallback((loc: { latitude: number; longitude: number }) => {
        setTempLoc(loc)
        fetchAddress(loc.latitude, loc.longitude)
    }, [fetchAddress])

    const { ready, syncLocation } = useLeafletMap({
        containerRef,
        initialLocation: location,
        onPinChange: handlePin,
    })

    useEffect(() => {
        if (location) { syncLocation(location); fetchAddress(location.latitude, location.longitude) }
    }, [ready])

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = "" }
    }, [])

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white">

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                        <p className="text-sm font-black text-slate-900">Select Delivery Location</p>
                        <p className="text-xs text-slate-400 font-medium">Tap or drag pin to set exact spot</p>
                    </div>
                </div>
                <button type="button" onClick={onClose}
                    className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <X className="w-4 h-4 text-slate-600" />
                </button>
            </div>

            {/* ── Map fills screen ── */}
            <div className="flex-1 relative">
                <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

                {!ready && (
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="text-sm font-bold text-slate-500">Loading map…</span>
                        </div>
                    </div>
                )}

                {/* Geocoding overlay */}
                {geocoding && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20
                        bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg
                        flex items-center gap-2 border border-slate-100">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm font-bold text-slate-600">Fetching address…</span>
                    </div>
                )}

                {/* Coords chip */}
                {tempLoc && (
                    <div className="absolute top-3 right-3 z-20
                        bg-slate-900/85 backdrop-blur-sm rounded-xl px-3 py-2
                        flex items-center gap-2">
                        <MapPinned className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-xs font-bold text-white font-mono">
                            {tempLoc.latitude.toFixed(5)}, {tempLoc.longitude.toFixed(5)}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Bottom sheet ── */}
            <div className="bg-white border-t border-slate-200 px-4 pt-4 pb-6 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">

                {/* Address preview */}
                <div className={`flex items-start gap-3 p-3 rounded-2xl mb-4 min-h-[56px] ${addrPreview ? "bg-green-50 border border-green-100"
                    : geocoding ? "bg-slate-50 border border-slate-100"
                        : "bg-slate-50 border border-dashed border-slate-200"
                    }`}>
                    {geocoding ? (
                        <><Loader2 className="w-4 h-4 animate-spin text-primary shrink-0 mt-0.5" />
                            <span className="text-sm font-bold text-slate-500">Finding address for this pin…</span></>
                    ) : addrPreview ? (
                        <><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-black text-green-700 mb-0.5">Address Found</p>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed">{addrPreview}</p>
                            </div></>
                    ) : (
                        <><MapPin className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-400 font-medium">
                                Tap anywhere on the map to drop a pin
                            </span></>
                    )}
                </div>

                {/* Confirm button */}
                <Button
                    type="button"
                    disabled={!tempLoc}
                    onClick={() => tempLoc && onConfirm(tempLoc, addrData)}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-base
                        hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20
                        disabled:opacity-40 disabled:cursor-not-allowed gap-2"
                >
                    <Check className="w-5 h-5" />
                    Confirm This Location
                </Button>
            </div>

            <style>{`@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');`}</style>
        </div>,
        document.body
    )
}

// ── Main AddressForm ──────────────────────────────────────────────────────────
export function AddressForm({ onSubmit, defaultValues }: AddressFormProps) {
    const [detecting, setDetecting] = useState(false)
    const [showMap, setShowMap] = useState(!!defaultValues?.location)
    const [fullscreenOpen, setFullscreenOpen] = useState(false)

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            label: "Home", country: "India",
            fullName: "", phone: "", street: "",
            landmark: "", city: "", state: "", postalCode: "",
            ...defaultValues,
        },
    })

    // ✅ Auto-geocode — user type kare, location silently save
    useAutoGeocode(form)

    const watchLocation = form.watch("location")

    // ── GPS: formRef + detectingRef se duplicate calls band ──────────────────
    const formRef = useRef(form)
    const detectingRef = useRef(false)
    useEffect(() => { formRef.current = form }, [form])

    const handleDetectLocation = useCallback(() => {
        if (!("geolocation" in navigator)) { toast.error("Geolocation not supported"); return }
        if (detectingRef.current) return          // already running → ignore
        detectingRef.current = true
        setDetecting(true)
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const f = formRef.current
                f.setValue("location", { latitude: coords.latitude, longitude: coords.longitude })
                setShowMap(true)
                const addr = await reverseGeocode(coords.latitude, coords.longitude)
                if (addr) {
                    if (addr.street) f.setValue("street", addr.street)
                    if (addr.city) f.setValue("city", addr.city)
                    if (addr.state) f.setValue("state", addr.state)
                    if (addr.postalCode) f.setValue("postalCode", addr.postalCode)
                    if (addr.country) f.setValue("country", addr.country)
                    toast.success("Location detected!")
                }
                detectingRef.current = false
                setDetecting(false)
            },
            () => {
                toast.error("Location access denied.")
                detectingRef.current = false
                setDetecting(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }, [])  // no deps — never recreates

    // ── Inline map pin ────────────────────────────────────────────────────────
    const handleMapPin = useCallback(async (loc: { latitude: number; longitude: number }) => {
        form.setValue("location", loc)
        const addr = await reverseGeocode(loc.latitude, loc.longitude)
        if (addr) {
            if (addr.street) form.setValue("street", addr.street)
            if (addr.city) form.setValue("city", addr.city)
            if (addr.state) form.setValue("state", addr.state)
            if (addr.postalCode) form.setValue("postalCode", addr.postalCode)
            if (addr.country) form.setValue("country", addr.country)
        }
    }, [form])

    // ── Fullscreen confirm ────────────────────────────────────────────────────
    const handleFullscreenConfirm = useCallback((
        loc: { latitude: number; longitude: number },
        addr: Awaited<ReturnType<typeof reverseGeocode>>
    ) => {
        form.setValue("location", loc)
        if (addr) {
            if (addr.street) form.setValue("street", addr.street)
            if (addr.city) form.setValue("city", addr.city)
            if (addr.state) form.setValue("state", addr.state)
            if (addr.postalCode) form.setValue("postalCode", addr.postalCode)
            if (addr.country) form.setValue("country", addr.country)
        }
        setFullscreenOpen(false)
        setShowMap(true)
        toast.success("Location pinned!")
    }, [form])

    const labelVal = form.watch("label")

    return (
        <>
            {/* Fullscreen map modal */}
            {fullscreenOpen && (
                <FullscreenMapModal
                    location={watchLocation ?? null}
                    onConfirm={handleFullscreenConfirm}
                    onClose={() => setFullscreenOpen(false)}
                />
            )}

            <Card className="border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
                        <MapPin className="h-5 w-5 text-primary" />
                        Shipping Address
                    </CardTitle>
                    <Button type="button" variant="outline" size="sm"
                        onClick={handleDetectLocation} disabled={detecting}
                        className="rounded-full border-primary/20 hover:bg-primary/5 text-primary font-bold text-xs gap-2 h-9 px-4 transition-all active:scale-95">
                        {detecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3" />}
                        {detecting ? "Detecting…" : "Detect My Location"}
                    </Button>
                </CardHeader>

                <CardContent className="p-6">

                    {/* Location status bar */}
                    <div className={`flex items-center gap-3 mb-5 px-4 py-3 rounded-2xl border transition-all ${watchLocation ? "bg-green-50 border-green-100" : "bg-slate-50 border-slate-100"
                        }`}>
                        {watchLocation ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-green-700">Location captured</p>
                                    <p className="text-[10px] font-mono text-green-600 mt-0.5">
                                        {watchLocation.latitude.toFixed(5)}, {watchLocation.longitude.toFixed(5)}
                                    </p>
                                </div>
                                <button type="button" onClick={() => setFullscreenOpen(true)}
                                    className="flex items-center gap-1.5 text-[11px] font-black text-primary
                                        bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors shrink-0">
                                    <Maximize2 className="w-3 h-3" />
                                    Edit on Map
                                </button>
                            </>
                        ) : (
                            <>
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                <p className="text-xs font-bold text-slate-500 flex-1">
                                    Fill street + city — location auto-captures
                                </p>
                                <button type="button" onClick={() => setFullscreenOpen(true)}
                                    className="flex items-center gap-1.5 text-[11px] font-black text-primary
                                        bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors shrink-0">
                                    <Maximize2 className="w-3 h-3" />
                                    Pick on Map
                                </button>
                            </>
                        )}
                    </div>

                    <Form {...form}>
                        <form id="address-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Label */}
                            <FormField control={form.control} name="label" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">Address Label</FormLabel>
                                    <FormControl>
                                        <div className="space-y-3">
                                            <div className="flex gap-3">
                                                {[
                                                    { val: "Home", icon: <Home className="w-4 h-4" /> },
                                                    { val: "Work", icon: <Briefcase className="w-4 h-4" /> },
                                                    { val: "Other", icon: <Building className="w-4 h-4" /> },
                                                ].map(({ val, icon }) => {
                                                    const active = val === "Other"
                                                        ? !["home", "work", "office"].includes(labelVal?.toLowerCase() || "")
                                                        : labelVal?.toLowerCase() === val.toLowerCase() || (val === "Work" && labelVal?.toLowerCase() === "office")
                                                    return (
                                                        <Button key={val} type="button"
                                                            className={`flex-1 h-12 rounded-xl gap-2 font-bold transition-all ${active ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-slate-50/50 border border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                                                            onClick={() => form.setValue("label", val)}>
                                                            {icon} {val}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                            <div className="relative">
                                                {labelVal?.toLowerCase() === "home" ? <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                    : ["work", "office"].includes(labelVal?.toLowerCase()) ? <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                        : <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />}
                                                <Input placeholder="Or type custom label..."
                                                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all font-bold" {...field} />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Full Name + Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="fullName" render={({ field }) => (
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
                                )} />
                                <FormField control={form.control} name="phone" render={({ field }) => (
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
                                )} />
                            </div>

                            {/* Street */}
                            <FormField control={form.control} name="street" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">Street Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="House No., Street Name"
                                            className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Landmark */}
                            <FormField control={form.control} name="landmark" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">Landmark (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Near ABC Park"
                                            className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Country → State → City */}
                            <CountryStateCitySelect
                                value={{ country: form.watch("country"), state: form.watch("state"), city: form.watch("city") }}
                                onChange={(val) => {
                                    form.setValue("country", val.country)
                                    form.setValue("state", val.state)
                                    form.setValue("city", val.city)
                                }}
                                required
                            />

                            {/* Pincode */}
                            <FormField control={form.control} name="postalCode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pincode</FormLabel>
                                    <FormControl>
                                        <Input placeholder="400001"
                                            className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Inline map (shows after location set) */}
                            {showMap && watchLocation && (
                                <InlineMap
                                    location={watchLocation}
                                    onLocationChange={handleMapPin}
                                    onOpenFull={() => setFullscreenOpen(true)}
                                />
                            )}

                            {/* Submit */}
                            <Button type="submit"
                                className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200">
                                Save Address & Continue
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
}