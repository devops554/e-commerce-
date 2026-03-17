"use client"

import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { useDeliveryPartners } from '@/hooks/useDeliveryPartners'
import { useShipments, useCreateShipment } from '@/hooks/useShipments'
import { useOrderById } from '@/hooks/useOrders'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeft, Search, Bike, Star, Package, MapPin, Wifi, WifiOff,
    CheckCircle2, Loader2, Navigation, AlertCircle, Phone
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

// ─── Haversine Distance ───────────────────────────────────────────────────────
function haversineKm(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number | null): string {
    if (km === null) return 'Location unknown'
    if (km < 1) return `${Math.round(km * 1000)} m away`
    return `${km.toFixed(1)} km away`
}

// ─── Partner Card ─────────────────────────────────────────────────────────────
function PartnerCard({
    partner,
    distance,
    isSelected,
    onSelect,
}: {
    partner: any
    distance: number | null
    isSelected: boolean
    onSelect: () => void
}) {
    const isUnavailable = partner.availabilityStatus === 'BUSY' || partner.accountStatus !== 'ACTIVE'
    const activeOrders = partner.activeOrders ?? 0

    const statusColor = {
        ONLINE: 'bg-green-100 text-green-700 border-green-200',
        OFFLINE: 'bg-slate-100 text-slate-500 border-slate-200',
        BUSY: 'bg-orange-100 text-orange-700 border-orange-200',
    }[partner.availabilityStatus as string] ?? 'bg-slate-100 text-slate-500'

    return (
        <button
            disabled={isUnavailable}
            onClick={onSelect}
            className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200
                ${isSelected
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                    : isUnavailable
                        ? 'border-slate-100 bg-slate-50/50 opacity-50 cursor-not-allowed'
                        : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50'
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600' : 'bg-indigo-50'}`}>
                    <Bike className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-black text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                            {partner.name}
                        </p>
                        <Badge variant="outline" className={`text-[9px] font-black h-4 flex items-center ${statusColor}`}>
                            {partner.availabilityStatus === 'ONLINE'
                                ? <Wifi className="h-2 w-2 mr-0.5" />
                                : partner.availabilityStatus === 'BUSY'
                                    ? <Package className="h-2 w-2 mr-0.5" />
                                    : <WifiOff className="h-2 w-2 mr-0.5" />
                            }
                            {partner.availabilityStatus}
                        </Badge>
                        {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-indigo-600 ml-auto" />
                        )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Phone className="h-2.5 w-2.5" />
                        {partner.phone}
                        <span className="text-slate-200 mx-1">·</span>
                        <span className="font-bold text-slate-600 uppercase text-[9px]">{partner.vehicleType}</span>
                        {partner.vehicleNumber && (
                            <>
                                <span className="text-slate-200 mx-1">·</span>
                                <span className="font-mono text-[9px]">{partner.vehicleNumber}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap mt-1">
                        {/* Distance */}
                        <div className={`flex items-center gap-1 text-[11px] font-bold ${distance !== null && distance < 5 ? 'text-emerald-600' : distance !== null && distance < 15 ? 'text-amber-600' : 'text-slate-500'}`}>
                            <Navigation className="h-3 w-3" />
                            {formatDistance(distance)}
                        </div>

                        {/* Active Orders */}
                        <div className={`flex items-center gap-1 text-[11px] font-bold ${activeOrders > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                            <Package className="h-3 w-3" />
                            {activeOrders} active order{activeOrders !== 1 ? 's' : ''}
                        </div>

                        {/* Rating */}
                        {partner.rating > 0 && (
                            <div className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {partner.rating.toFixed(1)}
                            </div>
                        )}

                        {/* Total Deliveries */}
                        <div className="text-[10px] text-slate-400 font-medium">
                            {partner.totalDeliveries} deliveries
                        </div>
                    </div>
                </div>
            </div>
        </button>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AssignPartnerPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const orderId = params.id as string
    const type = (searchParams.get('type') as 'FORWARD' | 'REVERSE') || 'FORWARD'

    const [search, setSearch] = useState('')
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'active'>('distance')
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL')

    const { data: warehouse, isLoading: warehouseLoading } = useManagerWarehouse()
    const { data: order, isLoading: orderLoading } = useOrderById(orderId)
    const { data: shipmentsData } = useShipments({ orderId })
    const existingShipment = shipmentsData?.data?.[0]

    const { data: partnersData, isLoading: partnersLoading } = useDeliveryPartners({
        warehouseId: warehouse?._id,
        limit: 200,
    })
    const createShipment = useCreateShipment()

    const warehouseLat = warehouse?.location?.latitude
    const warehouseLng = warehouse?.location?.longitude

    // Enrich each partner with computed distance
    const enrichedPartners = useMemo(() => {
        if (!partnersData?.data) return []
        return partnersData.data.map((p: any) => {
            const pLat = p.currentLocation?.latitude
            const pLng = p.currentLocation?.longitude
            const distance =
                pLat != null && pLng != null && warehouseLat != null && warehouseLng != null
                    ? haversineKm(warehouseLat, warehouseLng, pLat, pLng)
                    : null
            return { ...p, distance }
        })
    }, [partnersData, warehouseLat, warehouseLng])

    const filtered = useMemo(() => {
        let list = enrichedPartners.filter((p: any) => {
            const matchSearch = !search ||
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.phone.includes(search)
            const matchStatus = filterStatus === 'ALL' || p.availabilityStatus === filterStatus
            return matchSearch && matchStatus
        })

        if (sortBy === 'distance') {
            list = [...list].sort((a: any, b: any) => {
                if (a.distance === null) return 1
                if (b.distance === null) return -1
                return a.distance - b.distance
            })
        } else if (sortBy === 'rating') {
            list = [...list].sort((a: any, b: any) => b.rating - a.rating)
        } else if (sortBy === 'active') {
            list = [...list].sort((a: any, b: any) => (a.activeOrders ?? 0) - (b.activeOrders ?? 0))
        }

        return list
    }, [enrichedPartners, search, sortBy, filterStatus])

    const handleAssign = async () => {
        if (!selectedPartnerId || !warehouse) return
        try {
            await createShipment.mutateAsync({
                orderId,
                warehouseId: warehouse._id,
                deliveryPartnerId: selectedPartnerId,
                type,
            })
            toast.success('Delivery partner assigned successfully!')
            router.back()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to assign delivery partner')
        }
    }

    const isLoading = warehouseLoading || orderLoading || partnersLoading

    const onlineCount = enrichedPartners.filter((p: any) => p.availabilityStatus === 'ONLINE').length
    const nearbyCount = enrichedPartners.filter((p: any) => p.distance !== null && p.distance < 10).length

    return (
        <div className="space-y-6 pb-16 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 py-2">
                <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 shrink-0 border-slate-200" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assign Delivery Partner</h1>
                    <p className="text-slate-500 font-medium text-xs mt-0.5">
                        Order <span className="font-mono font-black text-slate-700">{order?.orderId || '...'}</span>
                        {warehouse && <span className="ml-2">· from <span className="font-bold text-slate-700">{warehouse.name}</span></span>}
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            {!isLoading && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Partners</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{enrichedPartners.length}</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Online Now</p>
                        <p className="text-2xl font-black text-green-700 mt-1">{onlineCount}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Within 10 km</p>
                        <p className="text-2xl font-black text-blue-700 mt-1">{nearbyCount}</p>
                    </div>
                </div>
            )}

            {/* Existing Assignment Warning */}
            {existingShipment && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                        <p className="text-sm font-black text-amber-800">Order already assigned</p>
                        <p className="text-xs text-amber-600 font-medium">
                            This will create a new assignment. The existing partner will be notified.
                        </p>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 h-11 rounded-2xl border-slate-200 bg-white font-medium"
                    />
                </div>

                {/* Sort Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
                    {(['distance', 'rating', 'active'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setSortBy(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black capitalize transition-all ${sortBy === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {s === 'distance' ? '📍 Nearest' : s === 'rating' ? '⭐ Rating' : '📦 Least Busy'}
                        </button>
                    ))}
                </div>

                {/* Availability Filter */}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
                    {(['ALL', 'ONLINE', 'OFFLINE'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilterStatus(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${filterStatus === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {f === 'ALL' ? 'All' : f === 'ONLINE' ? '🟢 Online' : '⚫ Offline'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Partner List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-400 font-medium">Loading delivery partners...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center">
                        <Bike className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-lg font-black text-slate-900">No partners found</p>
                    <p className="text-sm text-slate-400 font-medium">Try changing your search or filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filtered.map((partner: any) => (
                        <PartnerCard
                            key={partner._id}
                            partner={partner}
                            distance={partner.distance}
                            isSelected={selectedPartnerId === partner._id}
                            onSelect={() => setSelectedPartnerId(
                                selectedPartnerId === partner._id ? null : partner._id
                            )}
                        />
                    ))}
                </div>
            )}

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-6 py-4 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div>
                        {selectedPartnerId ? (
                            <div>
                                <p className="text-xs font-black text-slate-900">
                                    ✓ {filtered.find((p: any) => p._id === selectedPartnerId)?.name} selected
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    {formatDistance(filtered.find((p: any) => p._id === selectedPartnerId)?.distance)}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 font-medium">Select a delivery partner above</p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.back()} className="rounded-xl font-bold border-slate-200 h-11 px-5">
                            Cancel
                        </Button>
                        <Button
                            disabled={!selectedPartnerId || createShipment.isPending}
                            onClick={handleAssign}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black h-11 px-6 shadow-lg shadow-indigo-200 min-w-[140px]"
                        >
                            {createShipment.isPending ? (
                                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Assigning...</>
                            ) : (
                                <><CheckCircle2 className="h-4 w-4 mr-2" />Assign Partner</>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
