"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { MapPin, MapPinned, Loader2, X, Check, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLeafletMap } from "./UseLeafletMap"
import { reverseGeocode } from "./ReverseGeocode"

export function FullscreenMapModal({ location, onConfirm, onClose }: {
    location: { latitude: number; longitude: number } | null
    onConfirm: (loc: { latitude: number; longitude: number }, addr: Awaited<ReturnType<typeof reverseGeocode>>) => void
    onClose: () => void
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [tempLoc, setTempLoc] = useState(location)
    const [geocoding, setGeocoding] = useState(false)
    const [addrPreview, setAddrPreview] = useState<string | null>(null)
    const [addrData, setAddrData] = useState<Awaited<ReturnType<typeof reverseGeocode>>>(null)

    const fetchAddr = useCallback(async (lat: number, lng: number) => {
        setGeocoding(true); setAddrPreview(null)
        const r = await reverseGeocode(lat, lng)
        setGeocoding(false); setAddrData(r)
        if (r?.display) setAddrPreview(r.display.split(",").slice(0, 4).join(","))
    }, [])

    const handlePin = useCallback((loc: { latitude: number; longitude: number }) => {
        setTempLoc(loc); fetchAddr(loc.latitude, loc.longitude)
    }, [fetchAddr])

    const { ready, syncLocation } = useLeafletMap({
        containerRef, initialLocation: location, onPinChange: handlePin,
    })

    useEffect(() => {
        if (location?.latitude) { syncLocation(location); fetchAddr(location.latitude, location.longitude) }
    }, [ready])

    useEffect(() => {
        document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = "" }
    }, [])

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                        <p className="text-sm font-black text-slate-900">Select Warehouse Location</p>
                        <p className="text-xs text-slate-400 font-medium">Tap map or drag pin to set exact coordinates</p>
                    </div>
                </div>
                <button type="button" onClick={onClose}
                    className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <X className="w-4 h-4 text-slate-600" />
                </button>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
                {!ready && (
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}
                {geocoding && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20
                        bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm font-bold text-slate-600">Fetching address…</span>
                    </div>
                )}
                {tempLoc?.latitude ? (
                    <div className="absolute top-3 right-3 z-20 bg-slate-900/85 rounded-xl px-3 py-2 flex items-center gap-2">
                        <MapPinned className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-xs font-bold text-white font-mono">
                            {tempLoc.latitude.toFixed(5)}, {tempLoc.longitude.toFixed(5)}
                        </span>
                    </div>
                ) : null}
            </div>

            {/* Bottom sheet */}
            <div className="bg-white border-t border-slate-200 px-4 pt-4 pb-6 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
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
                                <p className="text-xs font-black text-green-700 mb-0.5">Location Found</p>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed">{addrPreview}</p>
                            </div></>
                    ) : (
                        <><MapPin className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-400 font-medium">Tap anywhere on map to drop a pin</span></>
                    )}
                </div>
                <Button type="button" disabled={!tempLoc?.latitude}
                    onClick={() => tempLoc?.latitude && onConfirm(tempLoc, addrData)}
                    className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-black gap-2 disabled:opacity-40">
                    <Check className="w-4 h-4" />
                    Confirm This Location
                </Button>
            </div>
            <style>{`@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');`}</style>
        </div>,
        document.body
    )
}