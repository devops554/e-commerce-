"use client"

// hooks/useAutoGeocode.ts
// Jab bhi street + city change ho → silently lat/lng fetch karo
// No API key, uses OpenStreetMap Nominatim (free)

import { useEffect, useRef } from "react"
import { UseFormReturn } from "react-hook-form"

export function useAutoGeocode(form: UseFormReturn<any>) {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const street = form.watch("street")
    const city = form.watch("city")
    const state = form.watch("state")
    const postalCode = form.watch("postalCode")

    useEffect(() => {
        // Need at least street + city
        if (!street?.trim() || !city?.trim()) return

        if (timer.current) clearTimeout(timer.current)

        timer.current = setTimeout(async () => {
            try {
                const q = [street, city, state, postalCode].filter(Boolean).join(", ")
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
                    { headers: { "User-Agent": "DeliveryApp/1.0" } }
                )
                const data = await res.json()
                if (data?.[0]) {
                    form.setValue("location", {
                        latitude: parseFloat(data[0].lat),
                        longitude: parseFloat(data[0].lon),
                    }, { shouldDirty: false, shouldValidate: false })
                }
            } catch { /* silently fail */ }
        }, 900)

        return () => { if (timer.current) clearTimeout(timer.current) }
    }, [street, city, state, postalCode])
}