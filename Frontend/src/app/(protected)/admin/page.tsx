"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ListTree, Users, CreditCard } from "lucide-react"
import { useAuth } from "@/providers/AuthContext"
import { UserRole } from "@/services/user.service"

export default function AdminDashboard() {
    const { user } = useAuth()

    const stats = [
        { title: "Total Revenue", value: "₹45,231", icon: CreditCard, color: "text-green-600" },
        { title: "Total Orders", value: "+2350", icon: Package, color: "text-blue-600" },
        { title: "Active Products", value: "450", icon: ListTree, color: "text-purple-600" },
        { title: "Total Users", value: "12,234", icon: Users, color: "text-orange-600" },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 font-medium">
                    Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
                    <span className="ml-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
                        [{user?.role === UserRole.ADMIN ? 'Super Admin' : 'Sub Admin'}]
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-none shadow-sm rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-bold text-gray-500">{stat.title}</CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{stat.value}</div>
                            <p className="text-xs text-green-600 font-bold mt-1">+12% from last month</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-none shadow-sm rounded-2xl h-[400px]">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center text-gray-400 font-medium">
                        Sales chart or table placeholder
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl h-[400px]">
                    <CardHeader>
                        <CardTitle>Inventory Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center text-gray-400 font-medium">
                        Inventory alerts placeholder
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
