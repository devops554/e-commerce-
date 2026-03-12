"use client"

// hooks/useAutoGeocodeWarehouse.ts
// Warehouse form ke liye — nested address.* fields watch karta hai
// Jab bhi addressLine1 + city change ho → silently lat/lng fetch

import { useEffect, useRef } from "react"
import { UseFormReturn } from "react-hook-form"

export function useAutoGeocodeWarehouse(form: UseFormReturn<any>) {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const street = form.watch("address.addressLine1")
    const city = form.watch("address.city")
    const state = form.watch("address.state")
    const pincode = form.watch("address.pincode")

    useEffect(() => {
        if (!street?.trim() || !city?.trim()) return

        if (timer.current) clearTimeout(timer.current)

        timer.current = setTimeout(async () => {
            try {
                const q = [street, city, state, pincode].filter(Boolean).join(", ")
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
                    { headers: { "User-Agent": "DeliveryApp/1.0" } }
                )
                const data = await res.json()
                if (data?.[0]) {
                    form.setValue("location.latitude", parseFloat(data[0].lat), { shouldDirty: false, shouldValidate: false })
                    form.setValue("location.longitude", parseFloat(data[0].lon), { shouldDirty: false, shouldValidate: false })
                }
            } catch { /* silently fail */ }
        }, 900)

        return () => { if (timer.current) clearTimeout(timer.current) }
    }, [street, city, state, pincode])
}