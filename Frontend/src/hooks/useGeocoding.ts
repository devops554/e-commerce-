// src/hooks/useGeocoding.ts
// OpenStreetMap Nominatim — free, no API key required
// Features: forward geocoding (address → lat/lng), reverse geocoding (lat/lng → address)

import { useState, useCallback, useRef } from "react"

export interface GeoLocation {
    latitude: number
    longitude: number
}

export interface GeocodeResult {
    location: GeoLocation
    displayName: string
}

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org"

// Debounce helper
function useDebouncedCallback<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): T {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    return useCallback(
        (...args: Parameters<T>) => {
            if (timer.current) clearTimeout(timer.current)
            timer.current = setTimeout(() => fn(...args), delay)
        },
        [fn, delay]
    ) as T
}

// ── Forward geocoding: address string → lat/lng ───────────────────────────────
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!address?.trim()) return null
    try {
        const params = new URLSearchParams({
            q: address,
            format: "json",
            limit: "1",
            addressdetails: "1",
        })
        const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
            headers: { "Accept-Language": "en", "User-Agent": "DeliveryApp/1.0" },
        })
        const data = await res.json()
        if (!data?.length) return null
        return {
            location: {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
            },
            displayName: data[0].display_name,
        }
    } catch {
        return null
    }
}

// ── Reverse geocoding: lat/lng → address ─────────────────────────────────────
export async function reverseGeocode(lat: number, lng: number): Promise<{
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    displayName: string
} | null> {
    try {
        const params = new URLSearchParams({
            lat: lat.toString(),
            lon: lng.toString(),
            format: "json",
            addressdetails: "1",
        })
        const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
            headers: { "Accept-Language": "en", "User-Agent": "DeliveryApp/1.0" },
        })
        const data = await res.json()
        if (!data?.address) return null
        const a = data.address
        return {
            street: [a.road || a.pedestrian || a.footway, a.house_number]
                .filter(Boolean).join(" ") || a.suburb || "",
            city: a.city || a.town || a.village || a.county || "",
            state: a.state || "",
            postalCode: a.postcode || "",
            country: a.country || "",
            displayName: data.display_name || "",
        }
    } catch {
        return null
    }
}

// ── React hook ────────────────────────────────────────────────────────────────
export function useGeocoding() {
    const [isGeocoding, setIsGeocoding] = useState(false)
    const [geocodeError, setGeocodeError] = useState<string | null>(null)

    const geocode = useCallback(async (address: string): Promise<GeocodeResult | null> => {
        setIsGeocoding(true)
        setGeocodeError(null)
        try {
            const result = await geocodeAddress(address)
            if (!result) setGeocodeError("Location not found for this address")
            return result
        } catch {
            setGeocodeError("Failed to find location")
            return null
        } finally {
            setIsGeocoding(false)
        }
    }, [])

    const reverse = useCallback(async (lat: number, lng: number) => {
        setIsGeocoding(true)
        setGeocodeError(null)
        try {
            return await reverseGeocode(lat, lng)
        } catch {
            setGeocodeError("Failed to get address")
            return null
        } finally {
            setIsGeocoding(false)
        }
    }, [])

    return { geocode, reverse, isGeocoding, geocodeError }
}