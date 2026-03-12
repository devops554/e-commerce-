"use client"

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const warehouseIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-indigo.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const customerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const partnerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

interface LiveTrackingMapProps {
    warehouseLoc?: { latitude: number; longitude: number }
    customerLoc?: { latitude?: number; longitude?: number } | null
    partnerLoc?: { latitude?: number; longitude?: number } | null
    partnerName?: string
}

function MapUpdater({ wLoc, cLoc, pLoc }: any) {
    const map = useMap()
    useEffect(() => {
        const bounds = L.latLngBounds([])
        if (wLoc && wLoc.latitude !== undefined && wLoc.longitude !== undefined) bounds.extend([wLoc.latitude, wLoc.longitude])
        if (cLoc && cLoc.latitude !== undefined && cLoc.longitude !== undefined) bounds.extend([cLoc.latitude, cLoc.longitude])
        if (pLoc && pLoc.latitude !== undefined && pLoc.longitude !== undefined) bounds.extend([pLoc.latitude, pLoc.longitude])

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] })
        }
    }, [wLoc, cLoc, pLoc, map])
    return null
}

export default function LiveTrackingMap({ warehouseLoc, customerLoc, partnerLoc, partnerName }: LiveTrackingMapProps) {
    // Default center to India if nothing is available
    const center = (warehouseLoc && warehouseLoc.latitude !== undefined) ? warehouseLoc :
        (customerLoc && customerLoc.latitude !== undefined) ? customerLoc :
            { latitude: 20.5937, longitude: 78.9629 }

    const isClient = typeof window !== 'undefined'
    if (!isClient) return null // Prevent SSR issues with leaflet

    // Mock partner location strictly for testing if not provided, just moving between warehouse and customer
    const pLoc = partnerLoc || (warehouseLoc && customerLoc && customerLoc.latitude !== undefined && customerLoc.longitude !== undefined ? {
        latitude: warehouseLoc.latitude + (customerLoc.latitude - warehouseLoc.latitude) * 0.3,
        longitude: warehouseLoc.longitude + (customerLoc.longitude - warehouseLoc.longitude) * 0.3,
    } : null)

    return (
        <MapContainer
            center={[center.latitude!, center.longitude!]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', zIndex: 10 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater wLoc={warehouseLoc} cLoc={customerLoc} pLoc={pLoc} />
            
            {warehouseLoc && warehouseLoc.latitude !== undefined && warehouseLoc.longitude !== undefined && (
                <Marker position={[warehouseLoc.latitude, warehouseLoc.longitude]} icon={warehouseIcon}>
                    <Popup>
                        <b>Warehouse</b><br />Origin
                    </Popup>
                </Marker>
            )}

            {customerLoc && customerLoc.latitude !== undefined && customerLoc.longitude !== undefined && (
                <Marker position={[customerLoc.latitude, customerLoc.longitude]} icon={customerIcon}>
                    <Popup>
                        <b>Customer</b><br />Destination
                    </Popup>
                </Marker>
            )}

            {pLoc && pLoc.latitude !== undefined && pLoc.longitude !== undefined && (
                <Marker position={[pLoc.latitude, pLoc.longitude]} icon={partnerIcon}>
                    <Popup>
                        <b>{partnerName || 'Delivery Partner'}</b><br />Live Location
                    </Popup>
                </Marker>
            )}

            {/* Draw a simple dotted line for the path */}
            {warehouseLoc && warehouseLoc.latitude !== undefined && warehouseLoc.longitude !== undefined && 
             customerLoc && customerLoc.latitude !== undefined && customerLoc.longitude !== undefined && (
                <Polyline 
                    positions={[
                        [warehouseLoc.latitude, warehouseLoc.longitude],
                        [customerLoc.latitude, customerLoc.longitude]
                    ]} 
                    pathOptions={{ color: 'indigo', dashArray: '5, 10', weight: 4, opacity: 0.5 }} 
                />
            )}
            
            {/* Draw solid line for completed part of journey if we have partner location */}
            {warehouseLoc && warehouseLoc.latitude !== undefined && warehouseLoc.longitude !== undefined && 
             pLoc && pLoc.latitude !== undefined && pLoc.longitude !== undefined && (
                <Polyline 
                    positions={[
                        [warehouseLoc.latitude, warehouseLoc.longitude],
                        [pLoc.latitude, pLoc.longitude]
                    ]} 
                    pathOptions={{ color: 'orange', weight: 4 }} 
                />
            )}
        </MapContainer>
    )
}
