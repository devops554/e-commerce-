"use client"

import React from 'react'
import { UserProfile } from '@/services/user.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Mail,
    Phone,
    Calendar,
    Shield,
    MapPin,
    Package,
    User as UserIcon,
    AlertCircle
} from 'lucide-react'
import { useAllOrders } from '@/hooks/useOrders'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

interface UserDetailViewProps {
    user: UserProfile
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ user }) => {

    const { data: ordersData, isLoading: ordersLoading } = useAllOrders({
        // userId: user._id,
        limit: 5
    })

    const statusVariant = (s: string) => {
        const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            inactive: 'secondary',
            banned: 'destructive',
            blocked: 'destructive',
        }
        return map[s] ?? 'outline'
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Profile Card */}
                <Card className="lg:col-span-1 border-none shadow-xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-linear-to-tr from-slate-900 to-slate-800 text-white pb-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-20 w-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                                <UserIcon className="h-10 w-10 text-white" />
                            </div>
                            <div className="text-center">
                                <CardTitle className="text-2xl font-black">{user.name}</CardTitle>
                                <Badge variant="secondary" className="mt-2 capitalize bg-white/20 text-white border-none">
                                    {user.role}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6 -mt-4 bg-white rounded-t-3xl relative z-10">
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-semibold truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Phone className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                    <p className="text-sm font-semibold">{user.addresses?.[0]?.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-4 w-4 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined On</p>
                                    <p className="text-sm font-semibold">{format(new Date(user.createdAt), 'PPP')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Shield className="h-4 w-4 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Status</p>
                                    <Badge variant={(user as any).status ? statusVariant((user as any).status) : 'outline'} className="mt-0.5 capitalize">
                                        {(user as any).status || 'Active'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Area (Addresses & Orders) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Orders */}
                    <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
                                    <CardDescription>Latest purchases by this user</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {ordersLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                    ))}
                                </div>
                            ) : ordersData?.orders?.length ? (
                                <div className="space-y-4">
                                    {ordersData.orders.map((order) => (
                                        <div key={order._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                    <Package className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{order.orderId}</p>
                                                    <p className="text-xs text-slate-500">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900">₹{order.totalAmount.toLocaleString()}</p>
                                                <Badge className="text-[10px] h-5 capitalize mt-1">
                                                    {order.orderStatus}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium">No orders found for this user.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipping Addresses */}
                    <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Saved Addresses</CardTitle>
                                    <CardDescription>The user's active delivery locations</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {user.addresses?.length ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {user.addresses.map((addr) => (
                                        <div key={addr._id} className="p-4 bg-slate-50 rounded-xl border-2 border-transparent hover:border-emerald-100 transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline" className="bg-white">{addr.label}</Badge>
                                                {addr.isDefault && (
                                                    <Badge className="bg-emerald-500 text-white border-none">Default</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">{addr.fullName}</p>
                                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                                {addr.street}, {addr.landmark && `${addr.landmark}, `}
                                                {addr.city}, {addr.state} - {addr.postalCode}
                                            </p>
                                            <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {addr.phone}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium">No saved addresses found.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default UserDetailView
