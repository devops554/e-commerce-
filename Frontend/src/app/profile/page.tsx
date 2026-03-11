"use client";

import React, { useState } from "react"
import { useAuth } from "@/providers/AuthContext"
import { useUserProfile, useAddAddress, useUpdateAddress, useDeleteAddress } from "@/hooks/useUser"
import { useMyOrders } from "@/hooks/useOrders"
import { ProfileSkeleton } from "./_components/ProfileSkeleton"
import { AddressCard } from "./_components/AddressCard"
import { AddressDialog } from "./_components/AddressDialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    User, Mail, Shield, Calendar, Plus,
    Settings, MapPin, ArrowRight,
    ShoppingBag, Heart, Bell, Package,
    Star, ChevronRight, Clock, Loader2
} from "lucide-react"
import { toast } from "sonner"
import { UserAddress } from "@/services/user.service"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

const BRAND = "#FF3269"

export default function ProfilePage() {
    const { user: authUser } = useAuth()
    const { data: profile, isLoading, error } = useUserProfile(!!authUser)
    const addAddress = useAddAddress()
    const updateAddress = useUpdateAddress()
    const deleteAddress = useDeleteAddress()
    const { data: ordersData, isLoading: ordersLoading } = useMyOrders({ limit: 5 })
    const recentOrders = ordersData?.orders || []

    const [activeTab, setActiveTab] = useState<"overview" | "addresses" | "settings">("overview")
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null)

    if (isLoading) return <ProfileSkeleton />

    if (error || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4">
                <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center">
                    <User className="w-10 h-10 text-rose-400" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-black text-slate-900 mb-1">Unable to load profile</h2>
                    <p className="text-sm text-slate-500">Please check your connection and try again.</p>
                </div>
                <Button variant="outline" className="rounded-2xl border-slate-200 font-bold" onClick={() => window.location.reload()}>
                    Retry Connection
                </Button>
            </div>
        )
    }

    const handleAddressSubmit = async (data: any) => {
        try {
            if (selectedAddress) {
                await updateAddress.mutateAsync({ ...data, _id: selectedAddress._id })
                toast.success("Address updated successfully")
            } else {
                await addAddress.mutateAsync(data)
                toast.success("New address added")
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong")
        }
    }

    const handleEditAddress = (address: UserAddress) => {
        setSelectedAddress(address)
        setIsAddressDialogOpen(true)
    }

    const handleDeleteAddress = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return
        try {
            await deleteAddress.mutateAsync(id)
            toast.success("Address removed")
        } catch (err: any) {
            toast.error("Failed to delete address")
        }
    }

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "addresses", label: "Addresses" },
        { id: "settings", label: "Settings" },
    ] as const

    return (
        <main className="min-h-screen bg-slate-50/60">
            {/* ── Hero Banner ── */}
            <div className="relative bg-slate-900 overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF3269]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-20 w-48 h-48 bg-pink-500/10 rounded-full blur-[60px] translate-y-1/2 pointer-events-none" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-tr from-[#FF3269] to-pink-400 opacity-60 blur-sm" />
                            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-[24px] border-4 border-slate-900 relative z-10 shadow-2xl">
                                <AvatarImage alt={profile.name} />
                                <AvatarFallback className="bg-gradient-to-br from-[#FF3269] to-pink-400 text-white font-black text-3xl rounded-[24px]">
                                    {profile.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {/* Online dot */}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-slate-900 z-20" />
                        </div>

                        {/* Info */}
                        <div className="text-center sm:text-left flex-1 pb-1">
                            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                                    {profile.name}
                                </h1>
                                <span className="bg-emerald-400/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-emerald-400/30">
                                    Verified ✓
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm font-medium flex items-center justify-center sm:justify-start gap-1.5 mb-3">
                                <Mail className="w-3.5 h-3.5" />
                                {profile.email}
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                                    <Shield className="w-3 h-3" /> {profile.role}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                                    <Calendar className="w-3 h-3" /> Since {new Date(profile.createdAt).getFullYear()}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                                    <Star className="w-3 h-3 text-amber-400" /> Premium Member
                                </span>
                            </div>
                        </div>

                        {/* Quick actions — desktop only */}
                        <Link href="/my-orders">
                            <button className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white group">
                                <ShoppingBag className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Orders</span>
                            </button>
                        </Link>
                        <button className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-[#FF3269] border border-[#FF3269]/50 hover:bg-[#e8215a] transition-all group">
                            <Settings className="w-5 h-5 text-white" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white">Settings</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stats Bar + Tab Nav (overlapping hero) ── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
                {/* Stats cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                        { icon: <Package className="w-4 h-4" />, value: ordersData?.total || "0", label: "Orders", color: "text-blue-500", bg: "bg-blue-50" },
                        { icon: <MapPin className="w-4 h-4" />, value: profile.addresses?.length || 0, label: "Addresses", color: "text-[#FF3269]", bg: "bg-rose-50" },
                    ].map(({ icon, value, label, color, bg }) => (
                        <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0 mx-auto sm:mx-0`}>
                                {icon}
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">{value}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1 flex gap-1 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${activeTab === tab.id
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}

                {/* Overview */}
                {activeTab === "overview" && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 pb-10"
                    >
                        {/* Quick links on mobile */}
                        <div className="sm:hidden grid grid-cols-2 gap-3">
                            {[
                                { icon: <ShoppingBag className="w-5 h-5" />, label: "Orders", href: "/my-orders", color: "text-blue-500", bg: "bg-blue-50" },
                                { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "#", color: "text-slate-500", bg: "bg-slate-100" },
                            ].map(({ icon, label, href, color, bg }) => (
                                <Link key={label} href={href}>
                                    <div className={`bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center gap-2 hover:border-slate-200 transition-all`}>
                                        <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center`}>{icon}</div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                {
                                    icon: <ShoppingBag className="w-5 h-5" />,
                                    title: "Recent Orders",
                                    desc: "Track and manage your recent purchases.",
                                    cta: "View Order History",
                                    href: "/my-orders",
                                    color: "#3b82f6",
                                    bg: "bg-blue-50",
                                },
                                {
                                    icon: <Bell className="w-5 h-5" />,
                                    title: "Notifications",
                                    desc: "Get updates on orders and offers.",
                                    cta: "Manage Alerts",
                                    href: "#",
                                    color: "#10b981",
                                    bg: "bg-emerald-50",
                                },
                            ].map(({ icon, title, desc, cta, href, color, bg }) => (
                                <Link key={title} href={href}>
                                    <div className="bg-white rounded-3xl border border-slate-100 p-5 hover:shadow-md hover:border-slate-200 transition-all duration-200 h-full group cursor-pointer">
                                        <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center mb-4`} style={{ color }}>
                                            {icon}
                                        </div>
                                        <h3 className="font-black text-slate-900 text-sm mb-1">{title}</h3>
                                        <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">{desc}</p>
                                        <div className="flex items-center gap-1 text-xs font-black uppercase tracking-widest" style={{ color }}>
                                            {cta}
                                            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Recent activity placeholder */}
                        <div className="bg-white rounded-3xl border border-slate-100 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-slate-900 text-sm">Recent Activity</h3>
                                <Link href="/my-orders" className="text-[10px] font-black uppercase tracking-widest text-[#FF3269] hover:underline">View All</Link>
                            </div>
                            <div className="space-y-3">
                                {ordersLoading ? (
                                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                                        <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading activity...</p>
                                    </div>
                                ) : recentOrders.length > 0 ? (
                                    recentOrders.map((order, i) => (
                                        <Link key={order._id} href={`/my-orders/${order._id}`}>
                                            <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg shrink-0">
                                                    📦
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-slate-900 truncate">Order #{order.orderId}</p>
                                                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg shrink-0 ${order.orderStatus === 'delivered' ? 'text-emerald-600 bg-emerald-50' :
                                                    order.orderStatus === 'cancelled' ? 'text-rose-600 bg-rose-50' :
                                                        'text-blue-600 bg-blue-50'
                                                    }`}>
                                                    {order.orderStatus}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-xs text-slate-400 font-medium">No recent activity found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Addresses */}
                {activeTab === "addresses" && (
                    <motion.div
                        key="addresses"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pb-10"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-black text-slate-900 text-base">Saved Addresses</h2>
                                <p className="text-xs text-slate-400 font-medium">{profile.addresses?.length || 0} address{profile.addresses?.length !== 1 ? "es" : ""} saved</p>
                            </div>
                            <Button
                                onClick={() => { setSelectedAddress(null); setIsAddressDialogOpen(true); }}
                                className="rounded-2xl bg-[#FF3269] hover:bg-[#e8215a] text-white font-black text-[10px] uppercase tracking-widest h-10 px-4 gap-2 shadow-md shadow-[#FF3269]/20"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add New
                            </Button>
                        </div>

                        {profile.addresses && profile.addresses.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {profile.addresses.map((addr: UserAddress) => (
                                    <AddressCard
                                        key={addr._id}
                                        address={addr}
                                        onEdit={handleEditAddress}
                                        onDelete={handleDeleteAddress}
                                        isDeleting={deleteAddress.isPending}
                                    />
                                ))}
                                {/* Add another card */}
                                <button
                                    onClick={() => { setSelectedAddress(null); setIsAddressDialogOpen(true); }}
                                    className="p-8 rounded-3xl border-2 border-dashed border-slate-200 hover:border-[#FF3269]/40 hover:bg-rose-50/30 transition-all duration-300 group flex flex-col items-center justify-center gap-3 min-h-[140px]"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-[#FF3269]/10 transition-colors flex items-center justify-center">
                                        <Plus className="w-5 h-5 text-slate-400 group-hover:text-[#FF3269] transition-colors" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-[#FF3269] transition-colors">Add another address</span>
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-8 h-8 text-[#FF3269]" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-1">No saved addresses</h3>
                                <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">Add a delivery address for a smoother checkout experience.</p>
                                <Button
                                    onClick={() => setIsAddressDialogOpen(true)}
                                    className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black px-6 gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add your first address
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Settings */}
                {activeTab === "settings" && (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pb-10"
                    >
                        <div className="bg-white rounded-3xl border border-slate-100 p-10 sm:p-16 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-5">
                                <Settings className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Account Settings</h3>
                            <p className="text-sm text-slate-500 max-w-sm mx-auto">This section is under development. You'll soon be able to manage your security and preferences here.</p>
                        </div>
                    </motion.div>
                )}
            </div>

            <AddressDialog
                isOpen={isAddressDialogOpen}
                onClose={() => setIsAddressDialogOpen(false)}
                onSubmit={handleAddressSubmit}
                address={selectedAddress}
                isLoading={addAddress.isPending || updateAddress.isPending}
            />
        </main >
    )
}