"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
    title: string
    href?: string
    icon?: LucideIcon
    badge?: number
    items?: {
        title: string
        href: string
        icon?: LucideIcon
    }[]
}

interface NavigationProps {
    navigation: NavItem[]
}

export function Navigation({ navigation }: NavigationProps) {
    const pathname = usePathname()
    const [expandedItems, setExpandedItems] = useState<string[]>([])

    // Auto-expand active groups
    useEffect(() => {
        const activeGroups = navigation
            .filter(item => item.items?.some(sub => pathname === sub.href))
            .map(item => item.title)

        setExpandedItems(prev => Array.from(new Set([...prev, ...activeGroups])))
    }, [pathname, navigation])

    const toggleExpand = (title: string) => {
        setExpandedItems(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        )
    }

    return (
        <nav className="space-y-1.5 px-2">
            {navigation.map((item) => {
                const hasSubItems = item.items && item.items.length > 0
                const isExpanded = expandedItems.includes(item.title)
                const isActive = pathname === item.href || item.items?.some(sub => pathname === sub.href)

                const NavLinkContent = (
                    <div className="flex items-center flex-1">
                        {item.icon && (
                            <item.icon className={cn(
                                "mr-3 h-4 w-4 shrink-0 transition-colors",
                                isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                            )} />
                        )}
                        <span className="truncate">{item.title}</span>
                    </div>
                )

                return (
                    <div key={item.title} className="space-y-1">
                        {item.href ? (
                            <Link
                                href={item.href}
                                className={cn(
                                    "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 shadow-sm"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                {NavLinkContent}
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="ml-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ) : (
                            <button
                                onClick={() => toggleExpand(item.title)}
                                className={cn(
                                    "w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-gray-50 text-gray-900"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                {NavLinkContent}
                                <div className="flex items-center">
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="mr-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                            {item.badge}
                                        </span>
                                    )}
                                    {hasSubItems && (
                                        <div className="text-gray-400 transition-transform duration-200">
                                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                        </div>
                                    )}
                                </div>
                            </button>
                        )}

                        {hasSubItems && isExpanded && (
                            <div className="ml-4 pl-3 border-l border-gray-100 space-y-1 mt-1">
                                {item.items!.map((subItem) => {
                                    const isSubActive = pathname === subItem.href
                                    return (
                                        <Link
                                            key={subItem.title}
                                            href={subItem.href}
                                            className={cn(
                                                "flex items-center px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-200",
                                                isSubActive
                                                    ? "text-blue-700 bg-blue-50/50 font-bold"
                                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                            )}
                                        >
                                            {subItem.icon && (
                                                <subItem.icon className={cn(
                                                    "mr-2.5 h-3.5 w-3.5 shrink-0 transition-colors",
                                                    isSubActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                                )} />
                                            )}
                                            {subItem.title}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
