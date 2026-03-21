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
    ShoppingBag, Bell, Package,
    Star, ChevronRight, Clock, Loader2, Trash2, Lock, Globe
} from "lucide-react"
import { toast } from "sonner"
import { UserAddress } from "@/services/user.service"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

const BRAND = "#D4537E"

type Tab = "overview" | "addresses" | "settings"

export default function ProfilePage() {
    const { user: authUser } = useAuth()
    const { data: profile, isLoading, error } = useUserProfile(!!authUser)
    const addAddress = useAddAddress()
    const updateAddress = useUpdateAddress()
    const deleteAddress = useDeleteAddress()
    const { data: ordersData, isLoading: ordersLoading } = useMyOrders({ limit: 5 })
    const recentOrders = ordersData?.orders || []

    const [activeTab, setActiveTab] = useState<Tab>("overview")
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null)

    if (isLoading) return <ProfileSkeleton />

    if (error || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4 bg-white">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
                    <User className="w-8 h-8 text-rose-400" />
                </div>
                <div className="text-center">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Unable to load profile</h2>
                    <p className="text-sm text-gray-400">Please check your connection and try again.</p>
                </div>
                <button
                    className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        )
    }

    const handleAddressSubmit = async (data: any) => {
        try {
            if (selectedAddress) {
                await updateAddress.mutateAsync({ ...data, _id: selectedAddress._id })
                toast.success("Address updated")
            } else {
                await addAddress.mutateAsync(data)
                toast.success("Address added")
            }
            setIsAddressDialogOpen(false)
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong")
        }
    }

    const handleEditAddress = (address: UserAddress) => {
        setSelectedAddress(address)
        setIsAddressDialogOpen(true)
    }

    const handleDeleteAddress = async (id: string) => {
        if (!window.confirm("Delete this address?")) return
        try {
            await deleteAddress.mutateAsync(id)
            toast.success("Address removed")
        } catch {
            toast.error("Failed to delete address")
        }
    }

    const tabs: { id: Tab; label: string }[] = [
        { id: "overview", label: "Overview" },
        { id: "addresses", label: "Addresses" },
        { id: "settings", label: "Settings" },
    ]

    const statusStyle = (status: string) => {
        if (status === "delivered") return "bg-emerald-50 text-emerald-700"
        if (status === "cancelled") return "bg-red-50 text-red-700"
        return "bg-blue-50 text-blue-700"
    }

    return (
        <main className="min-h-screen bg-white">

            {/* ── Hero ── */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-6 pt-6 pb-0">
                <div className="max-w-2xl mx-auto">

                    {/* Avatar + Info */}
                    <div className="flex items-start gap-4 mb-5">
                        <Avatar className="h-14 w-14 rounded-2xl border border-gray-100 shrink-0">
                            <AvatarImage alt={profile.name} />
                            <AvatarFallback className="rounded-2xl bg-rose-50 text-rose-500 font-bold text-xl">
                                {profile.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold text-gray-900 leading-tight mb-0.5">{profile.name}</h1>
                            <p className="text-sm text-gray-400 flex items-center gap-1.5 mb-2">
                                <Mail className="w-3.5 h-3.5" />
                                {profile.email}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                                    Verified
                                </span>
                                <span className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md border border-gray-200">
                                    {profile.role}
                                </span>
                                <span className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md border border-gray-200">
                                    Since {new Date(profile.createdAt).getFullYear()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {[
                            { icon: <Package className="w-4 h-4" />, value: ordersData?.total ?? "—", label: "Total orders", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
                            { icon: <MapPin className="w-4 h-4" />, value: profile.addresses?.length ?? 0, label: "Saved addresses", iconBg: "bg-rose-50", iconColor: "text-rose-400" },
                        ].map(({ icon, value, label, iconBg, iconColor }) => (
                            <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                                <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
                                    {icon}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-gray-900 leading-none">{value}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2.5 text-[13px] font-medium transition-all border-b-2 ${activeTab === tab.id
                                    ? "text-[#D4537E] border-[#D4537E]"
                                    : "text-gray-400 border-transparent hover:text-gray-600"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-12">

                {/* Overview */}
                {activeTab === "overview" && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-5 mb-2">Quick links</p>
                        <div className="grid grid-cols-2 gap-2 mb-5">
                            {[
                                { icon: <ShoppingBag className="w-4 h-4" />, title: "My orders", desc: "Track & manage", href: "/my-orders", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
                                { icon: <Package className="w-4 h-4" />, title: "Returns", desc: "Manage requests", href: "/profile/returns", iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
                                { icon: <Bell className="w-4 h-4" />, title: "Notifications", desc: "Alerts & updates", href: "#", iconBg: "bg-amber-50", iconColor: "text-amber-500" },
                                { icon: <Settings className="w-4 h-4" />, title: "Settings", desc: "Preferences", href: "#", iconBg: "bg-gray-100", iconColor: "text-gray-500" },
                            ].map(({ icon, title, desc, href, iconBg, iconColor }) => (
                                <Link key={title} href={href}>
                                    <div className="p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer">
                                        <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center mb-2.5`}>
                                            {icon}
                                        </div>
                                        <p className="text-[13px] font-medium text-gray-800 mb-0.5">{title}</p>
                                        <p className="text-[11px] text-gray-400">{desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Recent activity</p>
                            <Link href="/my-orders" className="text-[11px] font-medium text-[#D4537E] hover:underline">
                                View all
                            </Link>
                        </div>

                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            {ordersLoading ? (
                                <div className="flex items-center justify-center py-10 gap-2">
                                    <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
                                    <span className="text-[12px] text-gray-400">Loading...</span>
                                </div>
                            ) : recentOrders.length > 0 ? (
                                recentOrders.map((order, i) => (
                                    <Link key={order._id} href={`/my-orders/${order._id}`}>
                                        <div className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                                            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-base shrink-0">
                                                📦
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-gray-900">Order #{order.orderId}</p>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusStyle(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-sm text-gray-400">No recent activity.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Addresses */}
                {activeTab === "addresses" && (
                    <motion.div
                        key="addresses"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center justify-between mt-5 mb-3">
                            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                                {profile.addresses?.length || 0} address{profile.addresses?.length !== 1 ? "es" : ""} saved
                            </p>
                            <button
                                onClick={() => { setSelectedAddress(null); setIsAddressDialogOpen(true) }}
                                className="flex items-center gap-1.5 text-[12px] font-medium text-[#D4537E] bg-rose-50 px-3 py-1.5 rounded-lg"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add new
                            </button>
                        </div>

                        {profile.addresses && profile.addresses.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {profile.addresses.map((addr: UserAddress) => (
                                    <div key={addr._id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <MapPin className="w-3 h-3 text-[#D4537E]" />
                                            <span className="text-[11px] font-medium text-[#D4537E]">{addr.label || "Address"}</span>
                                        </div>
                                        <p className="text-[13px] font-medium text-gray-900 mb-1">{addr.fullName || profile.name}</p>
                                        <p className="text-[12px] text-gray-400 leading-relaxed">
                                            {addr.street}<br />
                                            {addr.city}, {addr.state} {addr.postalCode}
                                        </p>
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => handleEditAddress(addr)}
                                                className="flex-1 text-[12px] font-medium py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAddress(addr._id)}
                                                disabled={deleteAddress.isPending}
                                                className="flex-1 text-[12px] font-medium py-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {/* Add another */}
                                <button
                                    onClick={() => { setSelectedAddress(null); setIsAddressDialogOpen(true) }}
                                    className="border border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px] hover:border-[#D4537E]/40 hover:bg-rose-50/20 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-rose-50 flex items-center justify-center transition-colors">
                                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#D4537E] transition-colors" />
                                    </div>
                                    <span className="text-[12px] text-gray-400 group-hover:text-[#D4537E] font-medium transition-colors">Add address</span>
                                </button>
                            </div>
                        ) : (
                            <div className="border border-dashed border-gray-200 rounded-2xl p-12 text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                    <MapPin className="w-6 h-6 text-[#D4537E]" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">No saved addresses</h3>
                                <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto">Add a delivery address for a smoother checkout experience.</p>
                                <button
                                    onClick={() => setIsAddressDialogOpen(true)}
                                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add your first address
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Settings */}
                {activeTab === "settings" && (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {[
                            {
                                group: "Account",
                                items: [
                                    { icon: <User className="w-3.5 h-3.5 text-gray-400" />, label: "Edit profile", sub: "Name, phone, email", href: "#" },
                                    { icon: <Lock className="w-3.5 h-3.5 text-gray-400" />, label: "Password & security", sub: "Change password, 2FA", href: "#" },
                                ],
                            },
                            {
                                group: "Preferences",
                                items: [
                                    { icon: <Bell className="w-3.5 h-3.5 text-gray-400" />, label: "Notifications", sub: "Alerts & updates", href: "#" },
                                    { icon: <Globe className="w-3.5 h-3.5 text-gray-400" />, label: "Language & region", sub: "English (India)", href: "#" },
                                ],
                            },
                        ].map(({ group, items }) => (
                            <div key={group}>
                                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-5 mb-2">{group}</p>
                                <div className="border border-gray-100 rounded-xl overflow-hidden">
                                    {items.map((item, i) => (
                                        <Link key={item.label} href={item.href}>
                                            <div className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[13px] font-medium text-gray-800">{item.label}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">{item.sub}</p>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-5 mb-2">Danger zone</p>
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50/50 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-[13px] font-medium text-red-600">Delete account</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Permanently remove all data</p>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                            </button>
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
        </main>
    )
}