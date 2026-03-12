// ── Reverse geocode (Nominatim — free, no API key) ────────────────────────────
export async function reverseGeocode(lat: number, lng: number) {
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
            pincode: a.postcode || "",
            country: a.country || "India",
        }
    } catch { return null }
}