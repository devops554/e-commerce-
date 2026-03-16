/* ─────────────────────────────────────────────────────────────────
   primitives.tsx  —  tiny reusable building blocks
   Used by all OrderHistoryDetail sub-components.
───────────────────────────────────────────────────────────────── */
import React from 'react'
import { cn } from '@/lib/utils'
import { CHIP_COLOR, getStatus } from '@/types/orderhistory'

/* ── OhdCard ─────────────────────────────────────────────────── */
interface OhdCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    noPad?: boolean
}
export function OhdCard({ children, className, noPad, ...rest }: OhdCardProps) {
    return (
        <div
            className={cn(
                'ohd-card bg-white border border-slate-100 rounded-3xl overflow-hidden',
                'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)]',
                'transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.05)]',
                !noPad && 'px-6 py-5',
                className
            )}
            {...rest}
        >
            {children}
        </div>
    )
}

/* ── SectionLabel ─────────────────────────────────────────────── */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <p className={cn('ohd-section-label text-[10px] font-bold tracking-[.12em] uppercase text-slate-400 mb-1', className)}>
            {children}
        </p>
    )
}

/* ── CardTitle ────────────────────────────────────────────────── */
export function CardTitle({
    icon,
    children,
    className,
}: { icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
    return (
        <h2 className={cn('ohd-display text-base font-bold text-slate-900 flex items-center gap-2 mb-5', className)}>
            {icon}
            {children}
        </h2>
    )
}

/* ── Divider ──────────────────────────────────────────────────── */
export function Divider({ className }: { className?: string }) {
    return <hr className={cn('border-none border-t border-dashed border-slate-200 my-4', className)} />
}

/* ── MetaChip ─────────────────────────────────────────────────── */
export function MetaChip({
    icon,
    label,
    value,
    color = 'blue',
}: {
    icon?: React.ReactNode
    label: string
    value: string
    color?: keyof typeof CHIP_COLOR
}) {
    return (
        <div className={cn('rounded-2xl border px-3 py-2.5', CHIP_COLOR[color] ?? CHIP_COLOR.blue)}>
            {icon && (
                <div className="flex items-center gap-1.5 mb-1 opacity-70">
                    {icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                </div>
            )}
            {!icon && (
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block mb-1">{label}</span>
            )}
            <p className="text-xs font-bold leading-tight capitalize truncate">{value}</p>
        </div>
    )
}

/* ── StatusBadge ──────────────────────────────────────────────── */
export function StatusBadge({ status }: { status: string }) {
    const st = getStatus(status)
    return (
        <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold uppercase tracking-widest',
            st.bg, st.pill, st.border
        )}>
            <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0 ohd-status-dot', st.glow)} />
            {status.replace(/_/g, ' ')}
        </div>
    )
}

/* ── InfoRow — icon + label + value row ───────────────────────── */
export function InfoRow({
    icon,
    label,
    value,
    valueClass,
}: {
    icon: React.ReactNode
    label: string
    value?: React.ReactNode
    valueClass?: string
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
                <p className={cn('text-xs font-semibold text-slate-700 leading-relaxed break-words', valueClass)}>{value ?? '—'}</p>
            </div>
        </div>
    )
}

/* ── AvatarBlock — initials circle + name + sub ──────────────── */
export function AvatarBlock({
    name,
    sub,
    photo,
    color = 'slate',
}: {
    name?: string
    sub?: string
    photo?: string
    color?: string
}) {
    const initial = (name || '?').charAt(0).toUpperCase()
    const colorMap: Record<string, string> = {
        slate: 'bg-slate-100 text-slate-600',
        emerald: 'bg-emerald-100 text-emerald-700',
        blue: 'bg-blue-100 text-blue-700',
        violet: 'bg-violet-100 text-violet-700',
        amber: 'bg-amber-100 text-amber-700',
        indigo: 'bg-indigo-100 text-indigo-700',
    }
    return (
        <div className="flex items-center gap-3">
            <div className={cn(
                'h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100',
                !photo && (colorMap[color] ?? colorMap.slate)
            )}>
                {photo
                    ? <img src={photo} alt={name} className="h-full w-full object-cover" />
                    : <span className="text-sm font-bold">{initial}</span>
                }
            </div>
            <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{name || '—'}</p>
                {sub && <p className="text-xs font-medium text-slate-400 truncate">{sub}</p>}
            </div>
        </div>
    )
}

/* ── StarRating ───────────────────────────────────────────────── */
export function StarRating({ rating }: { rating?: number }) {
    if (!rating) return null
    const filled = Math.round(rating)
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="12" height="12" viewBox="0 0 12 12">
                    <path
                        d="M6 1l1.2 3.6H11L8.1 6.9l1.1 3.5L6 8.3l-3.2 2.1 1.1-3.5L1 4.6h3.8z"
                        fill={i <= filled ? '#F59E0B' : '#E2E8F0'}
                    />
                </svg>
            ))}
            <span className="text-[10px] font-bold text-slate-400 ml-1">{rating.toFixed(1)}</span>
        </div>
    )
}