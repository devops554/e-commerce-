"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export function useLeafletMap({
    containerRef, initialLocation, onPinChange,
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
                const hasInit = initialLocation?.latitude && initialLocation?.longitude
                const center: [number, number] = hasInit
                    ? [initialLocation!.latitude, initialLocation!.longitude]
                    : [20.5937, 78.9629]
                const map = L.map(containerRef.current!, { center, zoom: hasInit ? 15 : 5 })
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>', maxZoom: 19,
                }).addTo(map)
                const pinIcon = L.divIcon({
                    className: "",
                    html: `<div style="width:32px;height:40px;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 8px rgba(0,0,0,.35))">
                    <div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:#EF4444;transform:rotate(-45deg);border:3px solid white"></div>
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
                if (hasInit) addOrMove(initialLocation!.latitude, initialLocation!.longitude)
                map.on("click", (e: any) => {
                    addOrMove(e.latlng.lat, e.latlng.lng)
                    onPinChange({ latitude: e.latlng.lat, longitude: e.latlng.lng })
                })
                mapRef.current = map
                setReady(true)
            })()
        return () => {
            mapRef.current?.remove()
            mapRef.current = null; markerRef.current = null
            initRef.current = false; setReady(false)
        }
    }, [])

    const syncLocation = useCallback((loc: { latitude: number; longitude: number } | null) => {
        if (!loc?.latitude || !mapRef.current || !ready) return
        markerRef.current?.setLatLng([loc.latitude, loc.longitude])
        mapRef.current.setView([loc.latitude, loc.longitude], 15, { animate: true })
    }, [ready])

    return { ready, syncLocation }
}
