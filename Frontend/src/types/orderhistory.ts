/* ─────────────────────────────────────────────────────────────────
   types.ts  —  shared types + style helpers for OrderHistoryDetail
───────────────────────────────────────────────────────────────── */

export interface LocPoint {
    latitude: number
    longitude: number
}

export interface OrderItem {
    _id?: string
    title?: string
    image?: string
    product?: { thumbnail?: { url: string } }
    quantity: number
    price?: number
    lineTotal?: number
    status?: string
    warehouse?: { location: LocPoint; name?: string }
}

export interface ShippingAddress {
    fullName?: string
    phone?: string
    street?: string
    landmark?: string
    city?: string
    state?: string
    postalCode?: string
    location?: LocPoint
}

export interface DeliveryPartner {
    _id?: string
    name?: string
    phone?: string
    email?: string
    vehicleNumber?: string
    vehicleType?: string
    photo?: string
    rating?: number
    totalDeliveries?: number
    location?: LocPoint
}

export interface Warehouse {
    _id?: string
    name?: string
    code?: string
    phone?: string
    email?: string
    address?: string | {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
    }
    city?: string
    state?: string
    pincode?: string
    capacity?: number
    currentStock?: number
    manager?: string
    location?: LocPoint
}

export interface OrderHistory {
    status: string
    note?: string
    updatedAt?: string
    createdAt?: string
    updatedBy?: string
}

export interface Order {
    _id: string
    orderId: string
    orderStatus: string
    paymentMethod?: string
    subTotal?: number
    totalGstAmount?: number
    totalAmount?: number
    items?: OrderItem[]
    shippingAddress?: ShippingAddress
    user?: { name?: string; email?: string; phone?: string }
    history?: OrderHistory[]
    deliveryPartner?: DeliveryPartner | null
    assignedPartner?: DeliveryPartner | null
    createdAt?: string
    updatedAt?: string
}

/* ─── status style map ─── */
export const STATUS_STYLE: Record<string, {
    pill: string; border: string; glow: string; dot: string; bg: string
}> = {
    delivered: { pill: 'text-emerald-700', border: 'border-emerald-200', glow: 'bg-emerald-400', dot: '#10B981', bg: 'bg-emerald-50' },
    out_for_delivery: { pill: 'text-blue-700', border: 'border-blue-200', glow: 'bg-blue-400', dot: '#3B82F6', bg: 'bg-blue-50' },
    packed: { pill: 'text-violet-700', border: 'border-violet-200', glow: 'bg-violet-400', dot: '#8B5CF6', bg: 'bg-violet-50' },
    pending: { pill: 'text-amber-700', border: 'border-amber-200', glow: 'bg-amber-400', dot: '#F59E0B', bg: 'bg-amber-50' },
    assigned: { pill: 'text-indigo-700', border: 'border-indigo-200', glow: 'bg-indigo-400', dot: '#6366F1', bg: 'bg-indigo-50' },
    cancelled: { pill: 'text-red-700', border: 'border-red-200', glow: 'bg-red-400', dot: '#EF4444', bg: 'bg-red-50' },
    default: { pill: 'text-slate-700', border: 'border-slate-200', glow: 'bg-slate-400', dot: '#9CA3AF', bg: 'bg-slate-50' },
}

export const getStatus = (s?: string) =>
    STATUS_STYLE[s?.toLowerCase() ?? ''] ?? STATUS_STYLE.default

/* ─── color map for MetaChip ─── */
export const CHIP_COLOR: Record<string, string> = {
    violet: 'bg-violet-50  border-violet-100  text-violet-600',
    blue: 'bg-blue-50    border-blue-100    text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    amber: 'bg-amber-50   border-amber-100   text-amber-600',
    rose: 'bg-rose-50    border-rose-100    text-rose-600',
    indigo: 'bg-indigo-50  border-indigo-100  text-indigo-600',
    slate: 'bg-slate-50   border-slate-100   text-slate-600',
}