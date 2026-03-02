"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface BasicInfoSectionProps {
    data: any;
    onChange: (field: string, value: any) => void;
}

export default function BasicInfoSection({ data, onChange }: BasicInfoSectionProps) {
    return (
        <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title" className="font-bold">Product Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g. Apple iPhone 15 Pro"
                        value={data.title || ''}
                        onChange={(e) => onChange('title', e.target.value)}
                        className="rounded-xl h-12 border-slate-200"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="brand" className="font-bold">Brand</Label>
                        <Input
                            id="brand"
                            placeholder="e.g. Apple"
                            value={data.brand || ''}
                            onChange={(e) => onChange('brand', e.target.value)}
                            className="rounded-xl h-12 border-slate-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="baseSku" className="font-bold">Base SKU (Parent)</Label>
                        <Input
                            id="baseSku"
                            placeholder="e.g. IPH15PRO-P"
                            value={data.baseSku || ''}
                            onChange={(e) => onChange('baseSku', e.target.value)}
                            className="rounded-xl h-12 border-slate-200 font-mono text-sm"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="shortDescription" className="font-bold">Short Description</Label>
                    <Input
                        id="shortDescription"
                        placeholder="Brief overview in one line"
                        value={data.shortDescription || ''}
                        onChange={(e) => onChange('shortDescription', e.target.value)}
                        className="rounded-xl h-12 border-slate-200"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description" className="font-bold">Full Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Describe your product in detail..."
                        value={data.description || ''}
                        onChange={(e) => onChange('description', e.target.value)}
                        className="rounded-xl min-h-[150px] border-slate-200 resize-none"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
