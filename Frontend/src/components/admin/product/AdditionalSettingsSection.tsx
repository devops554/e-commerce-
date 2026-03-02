"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface AdditionalSettingsSectionProps {
    data: any;
    onChange: (field: string, value: any) => void;
}

export default function AdditionalSettingsSection({ data, onChange }: AdditionalSettingsSectionProps) {
    const [tagInput, setTagInput] = React.useState('')

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault()
            const currentTags = data.tags || []
            if (!currentTags.includes(tagInput.trim())) {
                onChange('tags', [...currentTags, tagInput.trim()])
            }
            setTagInput('')
        }
    }

    const handleRemoveTag = (tag: string) => {
        onChange('tags', (data.tags || []).filter((t: string) => t !== tag))
    }

    return (
        <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">


                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-bold">New Arrival</Label>
                        <p className="text-xs text-slate-500">Mark as a newly arrived product.</p>
                    </div>
                    <Switch
                        checked={data.isNewArrival || false}
                        onCheckedChange={(checked) => onChange('isNewArrival', checked)}
                    />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-bold text-red-600">Active Status</Label>
                        <p className="text-xs text-slate-500">Enable or disable product visibility.</p>
                    </div>
                    <Switch
                        checked={data.isActive ?? true}
                        onCheckedChange={(checked) => onChange('isActive', checked)}
                    />
                </div>

                <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <Label className="text-sm font-bold">Display Order</Label>
                    <Input
                        type="number"
                        placeholder="0"
                        value={data.order || 0}
                        onChange={(e) => onChange('order', parseInt(e.target.value) || 0)}
                        className="rounded-xl bg-white"
                    />
                    <p className="text-[10px] text-slate-500 italic">Lower numbers appear first.</p>
                </div>

                <div className="space-y-3 pt-2">
                    <Label className="text-sm font-bold">Product Tags</Label>
                    <Input
                        placeholder="Add tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className="rounded-xl"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(data.tags || []).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="pl-3 pr-1 py-1 rounded-full bg-slate-100 text-slate-700 border-none group">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-2 h-5 w-5 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
