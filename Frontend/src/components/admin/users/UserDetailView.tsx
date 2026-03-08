"use client"

import React from 'react'
import { UserProfile } from '@/services/user.service'
import { Badge } from '@/components/ui/badge'
import {
    Mail, Phone, Calendar, Shield,
    MapPin, Package, User as UserIcon,
    ChevronRight, CheckCircle2, Clock,
    TrendingUp, Star, Home, Briefcase
} from 'lucide-react'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { motion, Variants } from 'framer-motion'
import { useOrders } from '@/hooks/useOrders'

interface UserDetailViewProps {
    user: UserProfile
}

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' }
    }),
}

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
    active: { label: 'Active', dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    inactive: { label: 'Inactive', dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
    banned: { label: 'Banned', dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
    blocked: { label: 'Blocked', dot: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
}

const orderStatusConfig: Record<string, { text: string; bg: string }> = {
    delivered: { text: 'text-emerald-700', bg: 'bg-emerald-50' },
    processing: { text: 'text-blue-700', bg: 'bg-blue-50' },
    pending: { text: 'text-amber-700', bg: 'bg-amber-50' },
    cancelled: { text: 'text-rose-700', bg: 'bg-rose-50' },
    shipped: { text: 'text-violet-700', bg: 'bg-violet-50' },
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ user }) => {
    const router = useRouter()
    const { data: ordersData, isLoading: ordersLoading } = useOrders({ userId: user._id, limit: 5 })

    const status = (user as any).status || 'active'
    const statusCfg = statusConfig[status] ?? statusConfig.active

    const InfoRow = ({ icon, label, value, iconColor }: { icon: React.ReactNode; label: string; value: string; iconColor: string }) => (
        <div className="flex items-center gap-3 group">
            <div className={`h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 ${iconColor} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* ── LEFT: Profile Card ── */}
                <motion.div
                    className="lg:col-span-4"
                    variants={fadeUp} initial="hidden" animate="visible" custom={0}
                >
                    <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-lg shadow-slate-100">

                        {/* Dark header */}
                        <div className="relative bg-slate-900 px-6 pt-8 pb-16 overflow-hidden">
                            {/* Decorative blobs */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF3269]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                            {/* Role badge */}
                            <div className="flex justify-end mb-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 bg-white/10 border border-white/10 px-3 py-1 rounded-full">
                                    {user.role}
                                </span>
                            </div>

                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-3 relative z-10">
                                <div className="relative">
                                    <div className="absolute -inset-1 rounded-[22px] bg-gradient-to-tr from-[#FF3269] to-pink-400 opacity-50 blur-sm" />
                                    <div className="h-20 w-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-[20px] flex items-center justify-center border-2 border-white/10 shadow-xl relative z-10">
                                        <UserIcon className="h-9 w-9 text-white/80" />
                                    </div>
                                    {/* Online dot */}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 z-20" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-xl font-black text-white tracking-tight">{user.name}</h2>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* White body — overlapping header */}
                        <div className="bg-white rounded-t-3xl -mt-8 relative z-10 px-6 pt-6 pb-6 space-y-5">

                            {/* Status chip */}
                            <div className={`flex items-center justify-between p-3 rounded-2xl border ${statusCfg.bg} ${statusCfg.border}`}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${statusCfg.dot} animate-pulse`} />
                                    <span className={`text-xs font-black uppercase tracking-widest ${statusCfg.text}`}>
                                        {statusCfg.label}
                                    </span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Account Status</span>
                            </div>

                            {/* Info rows */}
                            <div className="space-y-3">
                                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" iconColor="text-blue-500" value={user.email} />
                                <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" iconColor="text-emerald-500" value={user.addresses?.[0]?.phone || 'Not provided'} />
                                <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joined" iconColor="text-orange-500" value={format(new Date(user.createdAt), 'PPP')} />
                                <InfoRow icon={<Shield className="w-4 h-4" />} label="Role" iconColor="text-purple-500" value={user.role} />
                                <InfoRow
                                    icon={<MapPin className="w-4 h-4" />}
                                    label="Addresses"
                                    iconColor="text-rose-500"
                                    value={`${user.addresses?.length || 0} saved address${user.addresses?.length !== 1 ? 'es' : ''}`}
                                />
                            </div>

                            {/* Quick stats row */}
                            <div className="grid grid-cols-3 gap-2 pt-1">
                                {[
                                    { icon: <Package className="w-3.5 h-3.5" />, label: 'Orders', value: ordersData?.orders?.length ?? '—', color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { icon: <Star className="w-3.5 h-3.5" />, label: 'Points', value: '240', color: 'text-amber-600', bg: 'bg-amber-50' },
                                    { icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Spent', value: '₹4.2k', color: 'text-violet-600', bg: 'bg-violet-50' },
                                ].map(({ icon, label, value, color, bg }) => (
                                    <div key={label} className={`${bg} rounded-2xl p-3 flex flex-col items-center gap-1`}>
                                        <span className={`${color}`}>{icon}</span>
                                        <p className="text-sm font-black text-slate-900">{value}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── RIGHT: Orders + Addresses ── */}
                <div className="lg:col-span-8 space-y-5">

                    {/* Recent Orders */}
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="visible" custom={1}
                        className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-100 overflow-hidden"
                    >
                        {/* Section header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-base">Recent Orders</h3>
                                    <p className="text-xs text-slate-400 font-medium">Latest purchases by this user</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                Last 5
                            </span>
                        </div>

                        <div className="p-5">
                            {ordersLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                                    ))}
                                </div>
                            ) : ordersData?.orders?.length ? (
                                <div className="space-y-2">
                                    {ordersData.orders.map((order, idx) => {
                                        const oStatus = order.orderStatus?.toLowerCase() || 'pending'
                                        const oCfg = orderStatusConfig[oStatus] ?? orderStatusConfig.pending
                                        return (
                                            <motion.div
                                                key={order._id}
                                                variants={fadeUp} initial="hidden" animate="visible" custom={idx * 0.5 + 2}
                                                onClick={() => router.push(`/admin/orders/${order._id}`)}
                                                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-100"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors shadow-sm">
                                                    <Package className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-slate-900">{order.orderId}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl ${oCfg.bg} ${oCfg.text}`}>
                                                        {order.orderStatus}
                                                    </span>
                                                    <p className="text-sm font-black text-slate-900">₹{order.totalAmount.toLocaleString()}</p>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-100">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                                        <Package className="w-7 h-7 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">No orders found for this user</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Saved Addresses */}
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="visible" custom={2}
                        className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-100 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-base">Saved Addresses</h3>
                                    <p className="text-xs text-slate-400 font-medium">Active delivery locations</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                {user.addresses?.length || 0} saved
                            </span>
                        </div>

                        <div className="p-5">
                            {user.addresses?.length ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {user.addresses.map((addr, idx) => {
                                        const AddrIcon = addr.label?.toLowerCase() === 'home' ? Home : addr.label?.toLowerCase() === 'office' ? Briefcase : MapPin
                                        return (
                                            <motion.div
                                                key={addr._id}
                                                variants={fadeUp} initial="hidden" animate="visible" custom={idx * 0.5 + 3}
                                                className="group p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all relative overflow-hidden"
                                            >
                                                {addr.isDefault && (
                                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400" />
                                                )}

                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center transition-colors flex-shrink-0">
                                                            <AddrIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                                                        </div>
                                                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{addr.label}</span>
                                                    </div>
                                                    {addr.isDefault && (
                                                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                                                            <CheckCircle2 className="w-2.5 h-2.5" /> Default
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm font-black text-slate-900 mb-1">{addr.fullName}</p>
                                                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                                                    {addr.street}{addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state} – {addr.postalCode}
                                                </p>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                    <Phone className="w-3 h-3" /> {addr.phone}
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-100">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                                        <MapPin className="w-7 h-7 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">No saved addresses found</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default UserDetailView