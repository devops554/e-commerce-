"use client"

import React from 'react'
import { Home, ChevronRight } from 'lucide-react'
import {
    Breadcrumb,
    BreadcrumbItem as UIBreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import Link from 'next/link'

export function AdminBreadcrumb() {
    const { breadcrumbs } = useBreadcrumb()

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <UIBreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/admin" className="flex items-center gap-1">
                            <Home className="h-3.5 w-3.5" /> Dashboard
                        </Link>
                    </BreadcrumbLink>
                </UIBreadcrumbItem>

                {breadcrumbs.map((item, index) => (
                    <React.Fragment key={index}>
                        <BreadcrumbSeparator>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </BreadcrumbSeparator>
                        <UIBreadcrumbItem>
                            {item.href ? (
                                <BreadcrumbLink asChild>
                                    <Link href={item.href!}>{item.label}</Link>
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            )}
                        </UIBreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
