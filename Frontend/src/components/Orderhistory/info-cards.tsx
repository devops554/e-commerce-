/* ─────────────────────────────────────────────────────────────────
   info-cards.tsx  —  CustomerCard · DeliveryPartnerCard · WarehouseCard · OrderMetaCard
   All self-contained, fully typed, zero external state.
───────────────────────────────────────────────────────────────── */
import React from 'react'
import {
    User, MapPin, Phone, Mail, Truck, Warehouse,
    Star, Package, Receipt, Activity, Clock,
    Hash, Building2, Phone as PhoneIcon, Boxes,
    BadgeCheck, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Order, DeliveryPartner, Warehouse as WarehouseType } from '@/types/orderhistory'
import {
    OhdCard, SectionLabel, CardTitle, Divider,
    InfoRow, AvatarBlock, MetaChip, StarRating,
} from './primitives'

/* ═══════════════════════════════════════════════════════════════
   CustomerCard
═══════════════════════════════════════════════════════════════ */
interface CustomerCardProps {
    order: Order
    className?: string
    animClass?: string
}

export function CustomerCard({ order, className, animClass }: CustomerCardProps) {
    const addr = order.shippingAddress
    const name = addr?.fullName || order.user?.name

    return (
        <OhdCard className={cn(animClass, className)}>
            <SectionLabel>Recipient</SectionLabel>
            <CardTitle icon={<User className="h-4 w-4 text-emerald-500" />}>
                Customer Details
            </CardTitle>

            <AvatarBlock name={name} sub={addr?.phone} color="emerald" />

            <Divider />

            <div className="space-y-3">
                {addr?.phone && (
                    <InfoRow
                        icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
                        label="Phone"
                        value={addr.phone}
                    />
                )}
                {order.user?.email && (
                    <InfoRow
                        icon={<Mail className="h-3.5 w-3.5 text-slate-400" />}
                        label="Email"
                        value={order.user.email}
                    />
                )}
                {addr?.street && (
                    <InfoRow
                        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
                        label="Delivery Address"
                        value={[
                            addr.street,
                            addr.landmark,
                            addr.city,
                            addr.state,
                            addr.postalCode,
                        ].filter(Boolean).join(', ')}
                    />
                )}
            </div>
        </OhdCard>
    )
}

/* ═══════════════════════════════════════════════════════════════
   DeliveryPartnerCard
═══════════════════════════════════════════════════════════════ */
interface PartnerCardProps {
    partner?: DeliveryPartner | null
    className?: string
    animClass?: string
}

export function DeliveryPartnerCard({ partner, className, animClass }: PartnerCardProps) {
    if (!partner) {
        return (
            <OhdCard className={cn(animClass, className)}>
                <SectionLabel>Courier</SectionLabel>
                <CardTitle icon={<Truck className="h-4 w-4 text-blue-500" />}>
                    Delivery Partner
                </CardTitle>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                        <Truck className="h-5 w-5 text-slate-300" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">No partner assigned yet</p>
                </div>
            </OhdCard>
        )
    }

    return (
        <OhdCard className={cn(animClass, className)}>
            <SectionLabel>Courier</SectionLabel>
            <CardTitle icon={<Truck className="h-4 w-4 text-blue-500" />}>
                Delivery Partner
            </CardTitle>

            <AvatarBlock
                name={partner.name}
                sub={partner.vehicleType ? `${partner.vehicleType}${partner.vehicleNumber ? ' · ' + partner.vehicleNumber : ''}` : partner.phone}
                photo={partner.photo}
                color="blue"
            />

            {partner.rating && (
                <div className="mt-2 ml-14">
                    <StarRating rating={partner.rating} />
                </div>
            )}

            <Divider />

            <div className="space-y-3">
                {partner.phone && (
                    <InfoRow
                        icon={<PhoneIcon className="h-3.5 w-3.5 text-slate-400" />}
                        label="Phone"
                        value={partner.phone}
                    />
                )}
                {partner.email && (
                    <InfoRow
                        icon={<Mail className="h-3.5 w-3.5 text-slate-400" />}
                        label="Email"
                        value={partner.email}
                    />
                )}
                {partner.vehicleNumber && (
                    <InfoRow
                        icon={<Hash className="h-3.5 w-3.5 text-slate-400" />}
                        label="Vehicle"
                        value={`${partner.vehicleType ?? ''} · ${partner.vehicleNumber}`}
                    />
                )}
                {partner.totalDeliveries !== undefined && (
                    <InfoRow
                        icon={<TrendingUp className="h-3.5 w-3.5 text-slate-400" />}
                        label="Total deliveries"
                        value={partner.totalDeliveries.toLocaleString()}
                    />
                )}
            </div>

            {/* live badge */}
            {partner.location && (
                <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Live location available</span>
                </div>
            )}
        </OhdCard>
    )
}

/* ═══════════════════════════════════════════════════════════════
   WarehouseCard
═══════════════════════════════════════════════════════════════ */
interface WarehouseCardProps {
    warehouse?: WarehouseType | null
    className?: string
    animClass?: string
}

export function WarehouseCard({ warehouse, className, animClass }: WarehouseCardProps) {
    if (!warehouse) {
        return (
            <OhdCard className={cn(animClass, className)}>
                <SectionLabel>Origin</SectionLabel>
                <CardTitle icon={<Warehouse className="h-4 w-4 text-indigo-500" />}>
                    Warehouse Info
                </CardTitle>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                        <Building2 className="h-5 w-5 text-slate-300" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">Warehouse info unavailable</p>
                </div>
            </OhdCard>
        )
    }

    /* capacity bar */
    const capacityPct = warehouse.capacity && warehouse.currentStock
        ? Math.min(100, Math.round((warehouse.currentStock / warehouse.capacity) * 100))
        : null

    return (
        <OhdCard className={cn(animClass, className)}>
            <SectionLabel>Origin</SectionLabel>
            <CardTitle icon={<Warehouse className="h-4 w-4 text-indigo-500" />}>
                Warehouse Info
            </CardTitle>

            {/* name + code */}
            <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">{warehouse.name}</p>
                    {warehouse.code && (
                        <code className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded-md">{warehouse.code}</code>
                    )}
                </div>
            </div>

            <Divider />

            <div className="space-y-3">
                {(warehouse.address || warehouse.city) && (
                    <InfoRow
                        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
                        label="Address"
                        value={(() => {
                            const addr = typeof warehouse.address === 'object' 
                                ? warehouse.address.addressLine1 
                                : warehouse.address;
                            const city = typeof warehouse.address === 'object'
                                ? warehouse.address.city
                                : warehouse.city;
                            const state = typeof warehouse.address === 'object'
                                ? warehouse.address.state
                                : warehouse.state;
                            const pincode = typeof warehouse.address === 'object'
                                ? warehouse.address.pincode
                                : warehouse.pincode;
                            
                            return [addr, city, state, pincode].filter(Boolean).join(', ');
                        })()}
                    />
                )}
                {warehouse.phone && (
                    <InfoRow
                        icon={<PhoneIcon className="h-3.5 w-3.5 text-slate-400" />}
                        label="Contact"
                        value={warehouse.phone}
                    />
                )}
                {warehouse.email && (
                    <InfoRow
                        icon={<Mail className="h-3.5 w-3.5 text-slate-400" />}
                        label="Email"
                        value={warehouse.email}
                    />
                )}
                {warehouse.manager && (
                    <InfoRow
                        icon={<BadgeCheck className="h-3.5 w-3.5 text-slate-400" />}
                        label="Manager"
                        value={warehouse.manager}
                    />
                )}
            </div>

            {/* capacity bar */}
            {capacityPct !== null && (
                <div className="mt-4 pt-4 border-t border-dashed border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Boxes className="h-3 w-3" /> Stock capacity
                        </span>
                        <span className="text-[11px] font-bold text-slate-600">{capacityPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all',
                                capacityPct > 80 ? 'bg-red-400' : capacityPct > 55 ? 'bg-amber-400' : 'bg-indigo-400'
                            )}
                            style={{ width: `${capacityPct}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-slate-400">{warehouse.currentStock?.toLocaleString()} units</span>
                        <span className="text-[9px] text-slate-400">cap {warehouse.capacity?.toLocaleString()}</span>
                    </div>
                </div>
            )}
        </OhdCard>
    )
}

/* ═══════════════════════════════════════════════════════════════
   OrderMetaCard  —  summary chips grid
═══════════════════════════════════════════════════════════════ */
interface OrderMetaCardProps {
    order: Order
    className?: string
    animClass?: string
}

export function OrderMetaCard({ order, className, animClass }: OrderMetaCardProps) {
    return (
        <OhdCard className={cn(animClass, className)}>
            <SectionLabel className="mb-3">Order summary</SectionLabel>
            <div className="grid grid-cols-2 gap-2.5">
                <MetaChip
                    icon={<Package className="h-3.5 w-3.5" />}
                    label="Items"
                    value={`${order.items?.length ?? 0} products`}
                    color="violet"
                />
                <MetaChip
                    icon={<Receipt className="h-3.5 w-3.5" />}
                    label="Payment"
                    value={order.paymentMethod || 'Online'}
                    color="blue"
                />
                <MetaChip
                    icon={<Activity className="h-3.5 w-3.5" />}
                    label="Status"
                    value={order.orderStatus.replace(/_/g, ' ')}
                    color="emerald"
                />
                <MetaChip
                    icon={<Clock className="h-3.5 w-3.5" />}
                    label="Events"
                    value={`${order.history?.length ?? 0} logged`}
                    color="amber"
                />
            </div>
        </OhdCard>
    )
}