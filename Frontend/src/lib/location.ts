export interface ReverseGeocodingResult {
    display_name: string;
    address: {
        road?: string;
        suburb?: string;
        city?: string;
        town?: string;
        village?: string;
        state_district?: string;
        state?: string;
        postcode?: string;
        country?: string;
        country_code?: string;
        neighbourhood?: string;
    };
}

export async function getAddressFromCoords(lat: number, lon: number): Promise<ReverseGeocodingResult | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
            {
                headers: {
                    "Accept-Language": "en",
                    // Good practice to provide a user agent for Nominatim
                    "User-Agent": "BivhaShop-Ecommerce-App"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch address");
        }

        const data = await response.json();
        return data as ReverseGeocodingResult;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return null;
    }
}
