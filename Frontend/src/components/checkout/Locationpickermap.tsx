"use client"

// components/checkout/LocationPickerMap.tsx
// Interactive map with draggable pin — OpenStreetMap tiles, no API key needed
// Uses Leaflet (react-leaflet) for map rendering
// Install: npm install react-leaflet leaflet @types/leaflet

import { useEffect, useRef, useState, useCallback } from "react"
import { Loader2, MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { reverseGeocode, GeoLocation } from "@/hooks/useGeocoding"

interface LocationPickerMapProps {
    location: GeoLocation | null
    onLocationChange: (location: GeoLocation, addressFields?: {
        street: string
        city: string
        state: string
        postalCode: string
        country: string
    }) => void
    className?: string
}

// ── Dynamic import of Leaflet (SSR safe) ─────────────────────────────────────
let L: any = null

export function LocationPickerMap({
    location,
    onLocationChange,
    className = "",
}: LocationPickerMapProps) {
    const mapRef = useRef<any>(null)
    const markerRef = useRef<any>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const [isMapReady, setIsMapReady] = useState(false)
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
    const [isLocating, setIsLocating] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)
    const initRef = useRef(false)

    // Default center: India
    const defaultCenter: [number, number] = [20.5937, 78.9629]
    const defaultZoom = 5

    // ── Init Leaflet map ──────────────────────────────────────────────────────
    useEffect(() => {
        if (initRef.current || !mapContainerRef.current) return
        initRef.current = true

        const init = async () => {
            // Dynamic import for SSR safety
            const leaflet = await import("leaflet")
            L = leaflet.default

            // Fix default marker icons
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            })

            if (!mapContainerRef.current) return

            const center: [number, number] = location
                ? [location.latitude, location.longitude]
                : defaultCenter
            const zoom = location ? 15 : defaultZoom

            const map = L.map(mapContainerRef.current, {
                center,
                zoom,
                zoomControl: true,
                scrollWheelZoom: true,
            })

            // OpenStreetMap tiles — completely free
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map)

            // Custom red pin icon
            const pinIcon = L.divIcon({
                className: "",
                html: `
          <div style="
            width: 32px; height: 40px;
            display: flex; flex-direction: column;
            align-items: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
          ">
            <div style="
              width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
              background: #EF4444; transform: rotate(-45deg);
              border: 3px solid white; box-shadow: 0 2px 8px rgba(239,68,68,0.5);
            "></div>
            <div style="
              width: 4px; height: 8px;
              background: #EF4444; border-radius: 0 0 4px 4px;
            "></div>
          </div>
        `,
                iconSize: [32, 40],
                iconAnchor: [16, 40],
            })

            // Add draggable marker if location exists
            if (location) {
                const marker = L.marker([location.latitude, location.longitude], {
                    draggable: true,
                    icon: pinIcon,
                }).addTo(map)

                marker.on("dragend", async (e: any) => {
                    const { lat, lng } = e.target.getLatLng()
                    await handleLocationUpdate(lat, lng)
                })

                markerRef.current = marker
            }

            // Click on map to move pin
            map.on("click", async (e: any) => {
                const { lat, lng } = e.latlng

                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng])
                } else {
                    const marker = L.marker([lat, lng], {
                        draggable: true,
                        icon: pinIcon,
                    }).addTo(map)

                    marker.on("dragend", async (ev: any) => {
                        const { lat: mlat, lng: mlng } = ev.target.getLatLng()
                        await handleLocationUpdate(mlat, mlng)
                    })

                    markerRef.current = marker
                }

                await handleLocationUpdate(lat, lng)
            })

            mapRef.current = map
            setIsMapReady(true)
        }

        init()

        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
                markerRef.current = null
                initRef.current = false
            }
        }
    }, [])

    // ── Update marker when location prop changes ──────────────────────────────
    useEffect(() => {
        if (!isMapReady || !mapRef.current || !location || !L) return

        if (markerRef.current) {
            markerRef.current.setLatLng([location.latitude, location.longitude])
        }
        mapRef.current.setView([location.latitude, location.longitude], 15, {
            animate: true,
        })
    }, [location, isMapReady])

    // ── Reverse geocode + emit ────────────────────────────────────────────────
    const handleLocationUpdate = useCallback(async (lat: number, lng: number) => {
        setIsReverseGeocoding(true)
        const result = await reverseGeocode(lat, lng)
        setIsReverseGeocoding(false)

        onLocationChange(
            { latitude: lat, longitude: lng },
            result
                ? {
                    street: result.street,
                    city: result.city,
                    state: result.state,
                    postalCode: result.postalCode,
                    country: result.country,
                }
                : undefined
        )
    }, [onLocationChange])

    // ── GPS current location ──────────────────────────────────────────────────
    const handleUseCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser")
            return
        }
        setIsLocating(true)
        setLocationError(null)

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords
                setIsLocating(false)

                if (mapRef.current && L) {
                    mapRef.current.setView([latitude, longitude], 16, { animate: true })

                    const pinIcon = L.divIcon({
                        className: "",
                        html: `
              <div style="
                width: 32px; height: 40px;
                display: flex; flex-direction: column;
                align-items: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
              ">
                <div style="
                  width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
                  background: #EF4444; transform: rotate(-45deg);
                  border: 3px solid white; box-shadow: 0 2px 8px rgba(239,68,68,0.5);
                "></div>
                <div style="
                  width: 4px; height: 8px;
                  background: #EF4444; border-radius: 0 0 4px 4px;
                "></div>
              </div>
            `,
                        iconSize: [32, 40],
                        iconAnchor: [16, 40],
                    })

                    if (markerRef.current) {
                        markerRef.current.setLatLng([latitude, longitude])
                    } else {
                        const marker = L.marker([latitude, longitude], {
                            draggable: true,
                            icon: pinIcon,
                        }).addTo(mapRef.current)

                        marker.on("dragend", async (e: any) => {
                            const { lat, lng } = e.target.getLatLng()
                            await handleLocationUpdate(lat, lng)
                        })

                        markerRef.current = marker
                    }
                }

                await handleLocationUpdate(latitude, longitude)
            },
            (err) => {
                setIsLocating(false)
                setLocationError(
                    err.code === 1
                        ? "Location permission denied. Please enable it in browser settings."
                        : "Could not get your location. Try again."
                )
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }, [handleLocationUpdate])

    return (
        <div className={`rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 ${className}`}>
            {/* Map toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        Pin Your Location
                    </span>
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="h-8 text-xs font-bold rounded-full border-slate-200 gap-1.5"
                >
                    {isLocating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <Navigation className="w-3 h-3 text-blue-500" />
                    )}
                    {isLocating ? "Locating..." : "Use My Location"}
                </Button>
            </div>

            {/* Map container */}
            <div className="relative">
                <div
                    ref={mapContainerRef}
                    style={{ height: "280px", width: "100%" }}
                    className="z-0"
                />

                {/* Loading overlay */}
                {!isMapReady && (
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-xs font-bold text-slate-400">Loading map...</span>
                        </div>
                    </div>
                )}

                {/* Reverse geocoding indicator */}
                {isReverseGeocoding && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        <span className="text-xs font-bold text-slate-600">Getting address...</span>
                    </div>
                )}
            </div>

            {/* Helper text + error */}
            <div className="px-4 py-2.5 bg-white border-t border-slate-100">
                {locationError ? (
                    <p className="text-xs font-bold text-red-500">{locationError}</p>
                ) : (
                    <p className="text-xs text-slate-400 font-medium">
                        📍 Click on map or drag the pin to set exact delivery location
                    </p>
                )}
            </div>

            {/* Leaflet CSS */}
            <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .leaflet-container { font-family: inherit; }
        .leaflet-control-attribution { font-size: 9px !important; }
      `}</style>
        </div>
    )
}