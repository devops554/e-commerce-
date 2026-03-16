"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

/* ─────────────────────────────────────────────────────────────────
   ORS CONFIG  →  add to .env.local:
   NEXT_PUBLIC_ORS_API_KEY=your_openrouteservice_key
───────────────────────────────────────────────────────────────── */
const ORS_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY ?? ''
const ORS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car'

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */
interface LocPoint {
    latitude?: number
    longitude?: number
}

interface RouteState {
    fullCoords: [number, number][]   // entire road path  [lat,lng][]
    doneCoords: [number, number][]   // warehouse → partner
    remainCoords: [number, number][]   // partner → customer
    distanceKm: number
    durationMin: number
    progressPct: number
    isFallback: boolean
}

interface LiveTrackingMapProps {
    warehouseLoc?: { latitude: number; longitude: number }
    customerLoc?: LocPoint | null
    partnerLoc?: LocPoint | null
    partnerName?: string
    orderStatus?: string
    orderId?: string
    estimatedTime?: string              // pass to override ORS ETA
    historyLocs?: LocPoint[]             // tracking history
}

/* ─────────────────────────────────────────────────────────────────
   CUSTOM SVG ICONS  (no external image deps)
───────────────────────────────────────────────────────────────── */
const mkIcon = (html: string, w: number, h: number) =>
    L.divIcon({ html, className: '', iconSize: [w, h], iconAnchor: [w / 2, h], popupAnchor: [0, -h + 6] })

const warehouseIcon = mkIcon(`
<svg width="46" height="55" viewBox="0 0 46 55" xmlns="http://www.w3.org/2000/svg">
  <defs><filter id="wf"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#1e1b4b" flood-opacity="0.5"/></filter></defs>
  <g filter="url(#wf)">
    <path d="M23 3L43 15V45Q43 47 41 47H5Q3 47 3 45V15Z" fill="#4338CA" stroke="#fff" stroke-width="1.5"/>
    <line x1="23" y1="3" x2="3"  y2="15" stroke="#818cf8" stroke-width="1.1"/>
    <line x1="23" y1="3" x2="43" y2="15" stroke="#818cf8" stroke-width="1.1"/>
    <rect x="7"  y="21" width="9"  height="8" rx="1.5" fill="#fff" opacity="0.8"/>
    <rect x="30" y="21" width="9"  height="8" rx="1.5" fill="#fff" opacity="0.8"/>
    <rect x="17" y="33" width="12" height="14" rx="1.5" fill="#fff" opacity="0.92"/>
    <circle cx="27" cy="40" r="1.2" fill="#818cf8"/>
    <rect x="9" y="30" width="28" height="3" rx="1" fill="#4338CA" opacity="0.45"/>
  </g>
  <path d="M23 47L20 55L23 52L26 55Z" fill="#4338CA"/>
</svg>`, 46, 55)

const customerIcon = mkIcon(`
<svg width="38" height="50" viewBox="0 0 38 50" xmlns="http://www.w3.org/2000/svg">
  <defs><filter id="cf"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#064e3b" flood-opacity="0.45"/></filter></defs>
  <g filter="url(#cf)">
    <path d="M19 2C9 2 2 9.5 2 19C2 31.5 19 46 19 46C19 46 36 31.5 36 19C36 9.5 29 2 19 2Z" fill="#059669" stroke="#fff" stroke-width="1.5"/>
  </g>
  <polygon points="19,10 10,18 13,18 13,28 25,28 25,18 28,18" fill="#fff" opacity="0.95"/>
  <rect x="16" y="22" width="6" height="6" rx="0.5" fill="#059669" opacity="0.65"/>
  <path d="M19 46L17 50L19 48.5L21 50Z" fill="#059669"/>
</svg>`, 38, 50)

const partnerIcon = mkIcon(`
<svg width="44" height="52" viewBox="0 0 44 52" xmlns="http://www.w3.org/2000/svg">
  <defs><filter id="pf"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#7c2d12" flood-opacity="0.45"/></filter></defs>
  <g filter="url(#pf)">
    <path d="M22 2C11 2 2 11 2 21C2 33.5 22 47 22 47C22 47 42 33.5 42 21C42 11 33 2 22 2Z" fill="#EA580C" stroke="#fff" stroke-width="1.5"/>
  </g>
  <rect x="9"  y="18" width="15" height="11" rx="2"   fill="#fff" opacity="0.95"/>
  <path d="M24 21L24 29L35 29L35 25L32 18L24 18Z"      fill="#fff" opacity="0.88"/>
  <path d="M25 19.5L25 22.5L33 22.5L31 19.5Z"          fill="#EA580C" opacity="0.45"/>
  <circle cx="14.5" cy="30" r="3" fill="#EA580C" stroke="#fff" stroke-width="1.2"/>
  <circle cx="29.5" cy="30" r="3" fill="#EA580C" stroke="#fff" stroke-width="1.2"/>
  <circle cx="14.5" cy="30" r="1.2" fill="#fff"/>
  <circle cx="29.5" cy="30" r="1.2" fill="#fff"/>
  <path d="M22 47L20 52L22 50L24 52Z" fill="#EA580C"/>
</svg>`, 44, 52)

/* ─────────────────────────────────────────────────────────────────
   STATUS BADGE CONFIG
───────────────────────────────────────────────────────────────── */
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string }> = {
    'in transit': { bg: '#FEF9C3', text: '#92400E', dot: '#F59E0B' },
    'out for delivery': { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
    'delivered': { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
    'pending': { bg: '#EDE9FE', text: '#4C1D95', dot: '#8B5CF6' },
    'packed': { bg: '#F0FDF4', text: '#14532D', dot: '#22C55E' },
    'assigned': { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
    default: { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
}

/* ─────────────────────────────────────────────────────────────────
   ORS API  — fetches real road geometry
───────────────────────────────────────────────────────────────── */
async function fetchOrsRoute(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
): Promise<{ coords: [number, number][]; distanceKm: number; durationMin: number } | null> {
    if (!ORS_KEY) {
        console.warn('[LiveTrackingMap] NEXT_PUBLIC_ORS_API_KEY not set — using straight-line fallback')
        return null
    }
    try {
        const res = await fetch(
            `${ORS_URL}?api_key=${ORS_KEY}&start=${from.longitude},${from.latitude}&end=${to.longitude},${to.latitude}`,
            { headers: { Accept: 'application/geo+json, application/json' } }
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const feature = json?.features?.[0]
        if (!feature) throw new Error('empty response')

        // ORS returns [lng, lat] — flip to [lat, lng] for Leaflet
        const coords: [number, number][] = feature.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
        )
        const s = feature.properties?.summary ?? {}
        return {
            coords,
            distanceKm: s.distance ? Math.round(s.distance / 100) / 10 : 0,
            durationMin: s.duration ? Math.round(s.duration / 60) : 0,
        }
    } catch (err) {
        console.warn('[LiveTrackingMap] ORS error, using straight-line fallback:', err)
        return null
    }
}

/* ─────────────────────────────────────────────────────────────────
   NEAREST POINT on polyline to partner location
───────────────────────────────────────────────────────────────── */
function nearestIdx(coords: [number, number][], pt: { latitude: number; longitude: number }): number {
    let best = 0, bestD = Infinity
    for (let i = 0; i < coords.length; i++) {
        const d = Math.hypot(coords[i][0] - pt.latitude, coords[i][1] - pt.longitude)
        if (d < bestD) { bestD = d; best = i }
    }
    return best
}

function splitRoute(coords: [number, number][], pLoc: LocPoint | null) {
    if (!pLoc?.latitude || !pLoc?.longitude || coords.length < 2)
        return { doneCoords: [] as [number, number][], remainCoords: coords, progressPct: 0 }
    const idx = nearestIdx(coords, { latitude: pLoc.latitude, longitude: pLoc.longitude })
    return {
        doneCoords: coords.slice(0, idx + 1),
        remainCoords: coords.slice(idx),
        progressPct: Math.round((idx / Math.max(coords.length - 1, 1)) * 100),
    }
}

/* ─────────────────────────────────────────────────────────────────
   MAP INNER — auto-fit bounds
───────────────────────────────────────────────────────────────── */
function BoundsFitter({ pts }: { pts: [number, number][] }) {
    const map = useMap()
    useEffect(() => {
        if (pts.length === 0) return
        const b = L.latLngBounds(pts)
        if (b.isValid()) map.fitBounds(b, { padding: [60, 60] })
    }, [pts.length > 0 ? pts[0][0] : 0, pts.length])
    return null
}

function FsResizer({ fs }: { fs: boolean }) {
    const map = useMap()
    useEffect(() => { setTimeout(() => map.invalidateSize(), 160) }, [fs])
    return null
}

/* ─────────────────────────────────────────────────────────────────
   SMALL UI PIECES
───────────────────────────────────────────────────────────────── */
function PopCard({ color, title, sub, extra }: { color: string; title: string; sub: string; extra?: string }) {
    return (
        <div style={{ padding: '5px 3px', minWidth: 130 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color, marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{sub}</div>
            {extra && <div style={{ fontSize: 11, color, marginTop: 3, fontWeight: 600 }}>{extra}</div>}
        </div>
    )
}

function LegDot({ color, label }: { color: string; label: string }) {
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B7280' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
            {label}
        </span>
    )
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
export default function LiveTrackingMap({
    warehouseLoc,
    customerLoc,
    partnerLoc,
    partnerName = 'Delivery Partner',
    orderStatus = 'In Transit',
    orderId,
    estimatedTime,
    historyLocs = [],
}: LiveTrackingMapProps) {

    const [isFS, setIsFS] = useState(false)
    const [route, setRoute] = useState<RouteState | null>(null)
    const [loading, setLoading] = useState(false)
    const prevKey = useRef('')

    /* partner fallback: 35% along the straight line */
    const pLoc: LocPoint | null = partnerLoc ?? (
        warehouseLoc && customerLoc?.latitude !== undefined && customerLoc?.longitude !== undefined
            ? {
                latitude: warehouseLoc.latitude + (customerLoc.latitude! - warehouseLoc.latitude) * 0.35,
                longitude: warehouseLoc.longitude + (customerLoc.longitude! - warehouseLoc.longitude) * 0.35,
            }
            : null
    )

    /* ── fetch ORS when warehouse / customer change ── */
    useEffect(() => {
        if (!warehouseLoc || !customerLoc?.latitude || !customerLoc?.longitude) return
        const key = `${warehouseLoc.latitude}|${warehouseLoc.longitude}|${customerLoc.latitude}|${customerLoc.longitude}`
        if (key === prevKey.current) return
        prevKey.current = key

        setLoading(true)
        fetchOrsRoute(
            warehouseLoc,
            { latitude: customerLoc.latitude!, longitude: customerLoc.longitude! }
        ).then(result => {
            const fallback = !result
            const coords: [number, number][] = result?.coords ?? [
                [warehouseLoc.latitude, warehouseLoc.longitude],
                [customerLoc.latitude!, customerLoc.longitude!],
            ]
            const split = splitRoute(coords, pLoc)
            setRoute({
                fullCoords: coords,
                distanceKm: result?.distanceKm ?? 0,
                durationMin: result?.durationMin ?? 0,
                isFallback: fallback,
                ...split,
            })
            setLoading(false)
        })
    }, [warehouseLoc?.latitude, warehouseLoc?.longitude, customerLoc?.latitude, customerLoc?.longitude])

    /* ── re-split when partner moves ── */
    useEffect(() => {
        if (!route) return
        setRoute(r => r ? { ...r, ...splitRoute(r.fullCoords, pLoc) } : null)
    }, [pLoc?.latitude, pLoc?.longitude])

    /* ── ESC exits fullscreen ── */
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFS(false) }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [])

    const toggleFS = useCallback(() => setIsFS(f => !f), [])

    if (typeof window === 'undefined') return null

    const center = warehouseLoc
        ?? (customerLoc?.latitude ? { latitude: customerLoc.latitude!, longitude: customerLoc.longitude! } : null)
        ?? { latitude: 20.5937, longitude: 78.9629 }

    const st = STATUS_CFG[orderStatus.toLowerCase()] ?? STATUS_CFG.default
    const pct = route?.progressPct ?? 0
    const distTxt = route?.distanceKm ? `${route.distanceKm} km` : ''
    const etaTxt = estimatedTime ?? (route?.durationMin ? `${route.durationMin} min` : '')

    /* bounds: full route + partner */
    const boundPts: [number, number][] = [
        ...(route?.fullCoords ?? (warehouseLoc && customerLoc?.latitude
            ? [[warehouseLoc.latitude, warehouseLoc.longitude], [customerLoc.latitude!, customerLoc.longitude!]] as [number, number][]
            : [])),
        ...(pLoc?.latitude ? [[pLoc.latitude, pLoc.longitude]] as [number, number][] : []),
        ...(historyLocs?.filter(l => l.latitude && l.longitude).map(l => [l.latitude!, l.longitude!]) as [number, number][]),
    ]

    return (
        <>
            <style>{STYLES}</style>

            <div className={`ltm${isFS ? ' ltm-fs' : ''}`}>

                {/* ── TOP OVERLAY ─────────────────────────────── */}
                <div className="ltm-top">
                    <div className="ltm-card">
                        <span className="ltm-pill" style={{ background: st.bg, color: st.text }}>
                            <span className="ltm-dot" style={{ background: st.dot }} />
                            {orderStatus}
                        </span>
                        {orderId && <div className="ltm-oid">#{orderId}</div>}
                        <div className="ltm-meta">
                            {etaTxt && <span><b>ETA</b> {etaTxt}</span>}
                            {distTxt && <span><b>Dist</b> {distTxt}</span>}
                            {route?.isFallback && (
                                <span style={{ color: '#EF4444', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1L9 9H1Z" fill="#EF4444" /><path d="M5 4v2" stroke="#fff" strokeWidth="1" strokeLinecap="round" /><circle cx="5" cy="7.5" r=".5" fill="#fff" /></svg>
                                    straight-line fallback
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 7, flexDirection: 'column', alignItems: 'flex-end' }}>
                        {/* Re-fetch when fallback */}
                        {route?.isFallback && (
                            <button className="ltm-btn" style={{ width: 36, height: 36 }}
                                title="Retry road route"
                                onClick={() => { prevKey.current = ''; setLoading(true) }}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M1 7a6 6 0 1 0 1.2-3.6" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" />
                                    <path d="M1 3.4V7h3.6" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        )}

                        {/* Expand button — only shown when NOT fullscreen */}
                        {!isFS && (
                            <button className="ltm-btn" style={{ width: 36, height: 36 }}
                                onClick={toggleFS}
                                title="View fullscreen">
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                                    <path d="M1 5V1h4M14 5V1h-4M1 10v4h4M14 10v4h-4" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Close (X) button — only shown when fullscreen, fixed top-right corner */}
                    {isFS && (
                        <button
                            className="ltm-btn ltm-close-btn"
                            onClick={toggleFS}
                            title="Close fullscreen (Esc)"
                            aria-label="Close fullscreen map"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 3l10 10M13 3L3 13" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* ── LOADING SPINNER ─────────────────────────── */}
                {loading && (
                    <div className="ltm-loading">
                        <div className="ltm-spin" />
                        <span>Fetching road route…</span>
                    </div>
                )}

                {/* ── MAP ─────────────────────────────────────── */}
                <MapContainer
                    center={[center.latitude!, center.longitude!]}
                    zoom={13}
                    scrollWheelZoom
                    zoomControl={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <BoundsFitter pts={boundPts} />
                    <FsResizer fs={isFS} />

                    {/* Full route — dashed indigo */}
                    {route && route.fullCoords.length > 1 && (
                        <Polyline
                            positions={route.fullCoords}
                            pathOptions={{ color: '#6366F1', dashArray: '7 11', weight: 3.5, opacity: 0.38 }}
                        />
                    )}

                    {/* Done segment — solid orange (real road, driven so far) */}
                    {route && route.doneCoords.length > 1 && (
                        <Polyline
                            positions={route.doneCoords}
                            pathOptions={{ color: '#EA580C', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                        />
                    )}

                    {/* Historical Tracking — solid gray thin path */}
                    {historyLocs && historyLocs.length > 1 && (
                        <Polyline
                            positions={historyLocs.filter(l => l.latitude && l.longitude).map(l => [l.latitude!, l.longitude!])}
                            pathOptions={{ color: '#6B7280', weight: 2, opacity: 0.6, dashArray: '4 4' }}
                        />
                    )}

                    {/* Remaining — dashed green */}
                    {route && route.remainCoords.length > 1 && (
                        <Polyline
                            positions={route.remainCoords}
                            pathOptions={{ color: '#059669', dashArray: '5 8', weight: 3, opacity: 0.5 }}
                        />
                    )}

                    {/* Warehouse */}
                    {warehouseLoc && (
                        <Marker position={[warehouseLoc.latitude, warehouseLoc.longitude]} icon={warehouseIcon}>
                            <Popup><PopCard color="#4338CA" title="Warehouse" sub="Dispatch origin" /></Popup>
                        </Marker>
                    )}

                    {/* Customer */}
                    {customerLoc?.latitude !== undefined && customerLoc?.longitude !== undefined && (
                        <Marker position={[customerLoc.latitude!, customerLoc.longitude!]} icon={customerIcon}>
                            <Popup><PopCard color="#059669" title="Customer" sub="Delivery destination" /></Popup>
                        </Marker>
                    )}

                    {/* Partner */}
                    {pLoc?.latitude !== undefined && pLoc?.longitude !== undefined && (
                        <Marker position={[pLoc.latitude!, pLoc.longitude!]} icon={partnerIcon}>
                            <Popup>
                                <PopCard
                                    color="#EA580C"
                                    title={partnerName}
                                    sub="Live location"
                                    extra={pct > 0 ? `${pct}% of route completed` : undefined}
                                />
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>

                {/* ── BOTTOM PROGRESS ─────────────────────────── */}
                <div className="ltm-bottom">
                    <div className="ltm-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                            <span className="ltm-prog-label">Delivery progress</span>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {distTxt && <span className="ltm-badge">{distTxt}</span>}
                                {etaTxt && <span className="ltm-badge ltm-badge-eta">{etaTxt}</span>}
                                <span className="ltm-pct">{pct}%</span>
                            </div>
                        </div>
                        <div className="ltm-track"><div className="ltm-fill" style={{ width: `${pct}%` }} /></div>
                        <div className="ltm-legend">
                            <LegDot color="#4338CA" label="Warehouse" />
                            <LegDot color="#EA580C" label={partnerName} />
                            <LegDot color="#059669" label="Customer" />
                            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#9CA3AF' }}>
                                <svg width="22" height="5" viewBox="0 0 22 5">
                                    <line x1="0" y1="2.5" x2="22" y2="2.5" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 3" />
                                </svg>
                                Full route
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

/* ─────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────── */
const STYLES = `
.ltm {
  position: relative; width: 100%; height: 100%; min-height: 440px;
  border-radius: 16px; overflow: hidden;
  font-family: 'DM Sans', system-ui, sans-serif;
  border: 0.5px solid rgba(0,0,0,0.09);
  background: #e5e0d8;
  transition: border-radius .22s;
}
.ltm-fs {
  position: fixed !important; inset: 0 !important;
  z-index: 99999 !important;
  width: 100vw !important; height: 100vh !important;
  min-height: unset !important; border-radius: 0 !important;
}
.ltm-top {
  position: absolute; top: 14px; left: 14px; right: 14px;
  z-index: 1000; display: flex; align-items: flex-start;
  justify-content: space-between; gap: 10px; pointer-events: none;
}
.ltm-bottom {
  position: absolute; bottom: 14px; left: 14px; right: 14px;
  z-index: 1000; pointer-events: none;
}
.ltm-card {
  background: rgba(255,255,255,0.94); backdrop-filter: blur(14px);
  border-radius: 12px; padding: 10px 14px;
  border: 0.5px solid rgba(0,0,0,0.08);
  box-shadow: 0 2px 14px rgba(0,0,0,0.08);
  pointer-events: all; min-width: 0;
}
.ltm-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; padding: 3px 9px;
  border-radius: 20px; letter-spacing: .3px; text-transform: uppercase;
}
.ltm-dot {
  width: 6px; height: 6px; border-radius: 50%;
  animation: ltmpulse 2s ease-in-out infinite;
}
@keyframes ltmpulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%     { opacity:.45; transform:scale(1.5); }
}
.ltm-oid {
  font-size: 13px; font-weight: 600; color: #111827;
  margin-top: 5px; letter-spacing: -.2px;
}
.ltm-meta {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-top: 4px; font-size: 11px; color: #6B7280;
}
.ltm-meta b { font-weight: 600; color: #374151; }
.ltm-btn {
  background: rgba(255,255,255,0.94); backdrop-filter: blur(14px);
  border: 0.5px solid rgba(0,0,0,0.10); border-radius: 10px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.09);
  transition: background .14s, transform .11s;
  pointer-events: all; flex-shrink: 0;
}
.ltm-btn:hover  { background: #fff; transform: scale(1.05); }
.ltm-btn:active { transform: scale(0.97); }
.ltm-close-btn {
  position: absolute !important;
  top: 14px !important;
  right: 14px !important;
  width: 42px !important;
  height: 42px !important;
  z-index: 10001 !important;
  border-radius: 50% !important;
  background: rgba(255,255,255,0.96) !important;
  box-shadow: 0 2px 18px rgba(0,0,0,0.18) !important;
  border: 0.5px solid rgba(0,0,0,0.12) !important;
  animation: ltm-close-in .22s cubic-bezier(.34,1.56,.64,1);
}
.ltm-close-btn:hover {
  background: #FEE2E2 !important;
  transform: scale(1.1) !important;
}
.ltm-close-btn:hover path { stroke: #DC2626; transition: stroke .14s; }
@keyframes ltm-close-in {
  from { opacity:0; transform: scale(0.5) rotate(-90deg); }
  to   { opacity:1; transform: scale(1)   rotate(0deg);   }
}
.ltm-loading {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%); z-index: 2000;
  background: rgba(255,255,255,0.93); backdrop-filter: blur(10px);
  border-radius: 12px; padding: 14px 22px;
  display: flex; align-items: center; gap: 10px;
  font-size: 12px; font-weight: 500; color: #374151;
  border: 0.5px solid rgba(0,0,0,0.08);
  box-shadow: 0 4px 20px rgba(0,0,0,0.10);
}
.ltm-spin {
  width: 18px; height: 18px;
  border: 2px solid #E5E7EB; border-top-color: #4338CA;
  border-radius: 50%; animation: ltmspin .7s linear infinite;
}
@keyframes ltmspin { to { transform: rotate(360deg); } }
.ltm-prog-label {
  font-size: 11px; font-weight: 600; color: #374151;
  text-transform: uppercase; letter-spacing: .4px;
}
.ltm-pct {
  font-size: 13px; font-weight: 700; color: #EA580C;
  font-variant-numeric: tabular-nums;
}
.ltm-badge {
  font-size: 10px; font-weight: 600; padding: 2px 7px;
  border-radius: 10px; background: #F3F4F6; color: #374151;
}
.ltm-badge-eta { background: #FEF9C3; color: #92400E; }
.ltm-track {
  width: 100%; height: 7px; background: #E5E7EB;
  border-radius: 4px; overflow: hidden;
}
.ltm-fill {
  height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, #4338CA 0%, #EA580C 100%);
  transition: width .65s cubic-bezier(.4,0,.2,1);
}
.ltm-legend {
  display: flex; gap: 12px; flex-wrap: wrap;
  margin-top: 9px; align-items: center;
}
.leaflet-popup-content-wrapper {
  border-radius: 10px !important;
  box-shadow: 0 4px 18px rgba(0,0,0,0.12) !important;
  border: 0.5px solid rgba(0,0,0,0.07) !important;
  font-family: 'DM Sans', system-ui, sans-serif !important;
  font-size: 13px !important;
}
.leaflet-popup-tip { display: none !important; }
.leaflet-control-attribution { font-size: 9px !important; opacity: .5; }
`