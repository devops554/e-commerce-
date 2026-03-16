/* ─────────────────────────────────────────────────────────────
   order-constants.ts  —  shared status configs, types, helpers
───────────────────────────────────────────────────────────── */

export type OrderStatus =
    | "created" | "pending" | "confirmed" | "packed" | "shipped"
    | "out_for_delivery" | "delivered" | "failed" | "cancelled"
    | "returned" | "failed_delivery" | "PENDING_REASSIGNMENT"

export const ALL_STATUSES: OrderStatus[] = [
    "created", "pending", "confirmed", "packed", "shipped",
    "out_for_delivery", "delivered", "failed", "cancelled",
    "returned", "failed_delivery", "PENDING_REASSIGNMENT",
]

export interface StatusMeta {
    label: string
    short: string
    pill: string        // tailwind classes for badge
    bar: string        // chart bar fill hex
    dot: string        // hex for animated dot
    icon: string        // emoji fallback
    step: number        // 0-7 for flow chart position (-1 = off-flow)
}

export const STATUS_META: Record<string, StatusMeta> = {
    created: { label: "Placed", short: "Placed", pill: "bg-slate-100 text-slate-700 border-slate-200", bar: "#94A3B8", dot: "#64748B", icon: "📦", step: 0 },
    pending: { label: "Pending", short: "Pending", pill: "bg-amber-50 text-amber-700 border-amber-200", bar: "#FCD34D", dot: "#F59E0B", icon: "⏳", step: 1 },
    confirmed: { label: "Confirmed", short: "Confirmed", pill: "bg-blue-50 text-blue-700 border-blue-200", bar: "#60A5FA", dot: "#3B82F6", icon: "✅", step: 2 },
    packed: { label: "Packed", short: "Packed", pill: "bg-indigo-50 text-indigo-700 border-indigo-200", bar: "#818CF8", dot: "#6366F1", icon: "📦", step: 3 },
    shipped: { label: "Shipped", short: "Shipped", pill: "bg-violet-50 text-violet-700 border-violet-200", bar: "#A78BFA", dot: "#8B5CF6", icon: "🚚", step: 4 },
    out_for_delivery: { label: "Out for Delivery", short: "OFD", pill: "bg-orange-50 text-orange-700 border-orange-200", bar: "#FB923C", dot: "#F97316", icon: "🛵", step: 5 },
    delivered: { label: "Delivered", short: "Done", pill: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "#34D399", dot: "#10B981", icon: "🎉", step: 6 },
    failed: { label: "Failed", short: "Failed", pill: "bg-red-50 text-red-700 border-red-200", bar: "#F87171", dot: "#EF4444", icon: "❌", step: -1 },
    cancelled: { label: "Cancelled", short: "Cancelled", pill: "bg-gray-100 text-gray-600 border-gray-200", bar: "#9CA3AF", dot: "#6B7280", icon: "🚫", step: -1 },
    returned: { label: "Returned", short: "Returned", pill: "bg-stone-100 text-stone-600 border-stone-200", bar: "#A8A29E", dot: "#78716C", icon: "↩️", step: -1 },
    failed_delivery: { label: "Delivery Failed", short: "Del.Fail", pill: "bg-red-50 text-red-600 border-red-200", bar: "#FCA5A5", dot: "#DC2626", icon: "⚠️", step: -1 },
    PENDING_REASSIGNMENT: { label: "Reassignment Req.", short: "Reassign", pill: "bg-amber-100 text-amber-800 border-amber-300", bar: "#FDE68A", dot: "#D97706", icon: "🔄", step: -1 },
}

export const getSM = (s?: string): StatusMeta =>
    STATUS_META[s ?? ""] ?? STATUS_META["created"]

/* ── flow steps (for funnel chart) ── */
export const FLOW_STEPS = [
    "created", "pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"
] as const