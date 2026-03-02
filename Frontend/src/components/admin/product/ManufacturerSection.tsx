"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface ManufacturerSectionProps {
    data: any;
    onChange: (field: string, value: any) => void;
}

export default function ManufacturerSection({ data, onChange }: ManufacturerSectionProps) {
    const handleInfoChange = (field: string, value: any) => {
        onChange('manufacturerInfo', {
            ...(data.manufacturerInfo || {}),
            [field]: value
        })
    }

    return (
        <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <Label className="text-sm font-bold text-slate-700">Manufacturer Info</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            placeholder="Manufacturer Name"
                            value={data.manufacturerInfo?.name || ''}
                            onChange={(e) => handleInfoChange('name', e.target.value)}
                            className="rounded-xl h-11 border-slate-200"
                        />
                        <Input
                            placeholder="Country of Origin"
                            value={data.manufacturerInfo?.countryOfOrigin || ''}
                            onChange={(e) => handleInfoChange('countryOfOrigin', e.target.value)}
                            className="rounded-xl h-11 border-slate-200"
                        />
                        <Input
                            placeholder="Shelf Life (Self Life)"
                            value={data.manufacturerInfo?.selfLife || ''}
                            onChange={(e) => handleInfoChange('selfLife', e.target.value)}
                            className="rounded-xl h-11 border-slate-200"
                        />
                    </div>
                    <Input
                        placeholder="Manufacturer Address"
                        value={data.manufacturerInfo?.address || ''}
                        onChange={(e) => handleInfoChange('address', e.target.value)}
                        className="rounded-xl h-11 border-slate-200"
                    />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Warranty</Label>
                        <Input
                            placeholder="e.g. 1 Year Manufacturer Warranty"
                            value={data.warranty || ''}
                            onChange={(e) => onChange('warranty', e.target.value)}
                            className="rounded-xl h-11 border-slate-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Disclaimer</Label>
                        <Textarea
                            placeholder="e.g. Product packaging may vary..."
                            value={data.disclaimer || ''}
                            onChange={(e) => onChange('disclaimer', e.target.value)}
                            className="rounded-xl border-slate-200 min-h-[80px]"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-4">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-bold text-slate-700">Active Status</Label>
                        <p className="text-xs text-slate-500">Enable or disable product visibility</p>
                    </div>
                    <Switch
                        checked={data.isActive !== false}
                        onCheckedChange={(val) => onChange('isActive', val)}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
