"use client"
import React from 'react'
import { BreadcrumbProvider } from '@/providers/BreadcrumbContext'

export default function SubadminLayout({ children }: { children: React.ReactNode }) {
    return (
        <BreadcrumbProvider>
            {children}
        </BreadcrumbProvider>
    )
}
