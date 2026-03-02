"use client"

import { useState, useEffect } from "react"
import { MapPin, ChevronDown, User, LogOut, ClipboardList, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/providers/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { ProductTypeScroller } from "./product-type/ProductTypeScroller"
import { CartDrawer } from "./CartDrawer"
import { LoginDialog } from "./auth/LoginDialog"
import { SearchBar } from "./SearchBar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname, useRouter } from "next/navigation"
import { UserRole } from "@/services/user.service"

export function Header() {
    const { user, isLoaded, logout } = useAuth()
    const router = useRouter()
    const [location, setLocation] = useState<string>("Select Location")
    const [isScrolled, setIsScrolled] = useState(false)
    const path = usePathname()


    // Handle Scroll Effect
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    const handleLocationClick = () => {
        // Open location modal or navigate to location page
        console.log("Open location modal")
    }

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-500 ${isScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
            : "bg-transparent border-b border-transparent"
            }`}>
            {/* Main Header */}
            <div className="py-2 border-b border-gray-100/50">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between gap-4 h-16">

                        {/* Left Section: Logo and Location */}
                        <div className="flex items-center gap-6 lg:gap-8">
                            {/* Logo */}
                            <Link href="/" className="flex items-center flex-shrink-0 transition-transform hover:scale-105 active:scale-95 group">
                                <h1 className="text-2xl font-black tracking-tighter text-slate-900 lg:text-3xl">
                                    Bivha<span className="text-primary group-hover:animate-pulse">.</span>
                                </h1>
                            </Link>

                            {/* Modern Location Selector */}
                            <button
                                onClick={handleLocationClick}
                                className="hidden md:flex items-center gap-2 group px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 active:scale-95"
                            >
                                <div className="p-1.5 rounded-lg bg-slate-100/50 group-hover:bg-white transition-colors">
                                    <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery at</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-semibold text-slate-700">{location}</span>
                                        <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:rotate-180" />
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="hidden md:block flex-1 max-w-2xl mx-4">
                            <SearchBar placeholder='Search for "fresh milk", "bread"...' />
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-3 lg:gap-5 flex-shrink-0">
                            <AnimatePresence mode="wait">
                                {!isLoaded ? (
                                    <div className="h-10 w-20 animate-pulse rounded-xl bg-slate-100" />
                                ) : !user ? (
                                    <LoginDialog trigger={
                                        <Button variant="ghost" className="h-11 px-4 lg:px-6 rounded-xl hover:bg-white/80 text-slate-700 font-bold flex items-center gap-2 group transition-all active:scale-95 hover:shadow-sm">
                                            <div className="p-1.5 rounded-lg bg-slate-100/80 group-hover:bg-primary/10 transition-colors">
                                                <User className="h-4 w-4 text-slate-600 group-hover:text-primary" />
                                            </div>
                                            <span className="group-hover:text-primary transition-colors">Login</span>
                                        </Button>
                                    } />
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-50 transition-all duration-200 group focus:outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-slate-200">
                                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                    <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">
                                                        {user.name?.charAt(0).toUpperCase() || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="hidden lg:flex flex-col items-start leading-none gap-0.5">
                                                    <span className="text-sm font-bold text-slate-900 group-hover:text-[#FF3269] transition-colors">{user.name?.split(" ")[0]}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">My Account</span>
                                                </div>
                                                <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-all" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-64 p-2 rounded-2xl border-slate-200/60 shadow-2xl shadow-slate-200/50" align="end" sideOffset={12}>
                                            <DropdownMenuLabel className="p-3">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium truncate">{user.email}</p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-slate-100 mx-1" />
                                            <div className="grid gap-1 py-1">
                                                {user.role === UserRole.ADMIN || user.role === UserRole.SUB_ADMIN ? (
                                                    <DropdownMenuItem
                                                        className="px-3 py-2.5 rounded-xl cursor-pointer focus:bg-slate-50"
                                                        onClick={() => router.push("/admin")}
                                                    >
                                                        <UserCircle className="mr-3 h-4 w-4 text-slate-500" />
                                                        <span className="text-sm font-semibold">Dashboard</span>
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        className="px-3 py-2.5 rounded-xl cursor-pointer focus:bg-slate-50"
                                                        onClick={() => router.push("/profile")}
                                                    >
                                                        <UserCircle className="mr-3 h-4 w-4 text-slate-500" />
                                                        <span className="text-sm font-semibold">My Profile</span>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="px-3 py-2.5 rounded-xl cursor-pointer focus:bg-slate-50" onClick={() => router.push("/my-orders")}>
                                                    <ClipboardList className="mr-3 h-4 w-4 text-slate-500" />
                                                    <span onClick={() => router.push("/my-orders")} className="text-sm font-semibold">My Orders</span>
                                                </DropdownMenuItem>
                                            </div>
                                            <DropdownMenuSeparator className="bg-slate-100 mx-1" />
                                            <DropdownMenuItem onClick={handleLogout} className="px-3 py-2.5 rounded-xl text-red-600 focus:bg-red-50 focus:text-red-600 transition-colors cursor-pointer">
                                                <LogOut className="mr-3 h-4 w-4" />
                                                <span className="text-sm font-bold">Logout</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </AnimatePresence>

                            <CartDrawer />
                        </div>
                    </div>

                    {/* Mobile Search Row */}
                    <div className="mt-2 mb-3 md:hidden">
                        <SearchBar
                            placeholder='Search for anything...'
                            inputClassName="h-10"
                        />
                        <button className="flex items-center gap-1.5 mt-2 px-1 text-xs font-bold text-slate-500 uppercase tracking-wider group active:scale-95 transition-transform">
                            <MapPin className="h-3.5 w-3.5 text-[#FF3269]" />
                            <span>{location}</span>
                            <ChevronDown className="h-3 w-3 group-hover:rotate-180 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {(
                path === "/" ||
                path.startsWith("/category/") ||
                path.startsWith("/product-type/") ||
                path.startsWith("/search")
            ) && (
                    /* Product Type Scroller - Fixed inside header */
                    <div className="bg-white/30 backdrop-blur-md border-b border-white/10">
                        <ProductTypeScroller />
                    </div>
                )}
        </header>
    )
}
