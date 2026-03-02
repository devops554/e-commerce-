"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface CustomerCareSectionProps {
    data: any;
    onChange: (field: string, value: any) => void;
}

export default function CustomerCareSection({ data, onChange }: CustomerCareSectionProps) {
    const handleCareChange = (field: string, value: string) => {
        onChange('customerCareDetails', {
            ...(data.customerCareDetails || {}),
            [field]: value
        })
    }

    return (
        <Card className="border-none shadow-sm rounded-2xl mt-8">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Customer Care & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Support Name / Team</Label>
                        <Input
                            placeholder="e.g. Helpy Support Team"
                            value={data.customerCareDetails?.name || ''}
                            onChange={(e) => handleCareChange('name', e.target.value)}
                            className="rounded-xl h-11 border-slate-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Email Address</Label>
                        <Input
                            type="email"
                            placeholder="e.g. support@example.com"
                            value={data.customerCareDetails?.email || ''}
                            onChange={(e) => handleCareChange('email', e.target.value)}
                            className="rounded-xl h-11 border-slate-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Phone Number</Label>
                        <Input
                            placeholder="e.g. +1 800 123 4567"
                            value={data.customerCareDetails?.phone || ''}
                            onChange={(e) => handleCareChange('phone', e.target.value)}
                            className="rounded-xl h-11 border-slate-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Full Address</Label>
                        <Input
                            placeholder="e.g. 123 Main St, City, Country"
                            value={data.customerCareDetails?.address || ''}
                            onChange={(e) => handleCareChange('address', e.target.value)}
                            className="rounded-xl h-11 border-slate-200"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
