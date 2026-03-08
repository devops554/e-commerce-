import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { StepProps } from './types'
import { RETAIL_CHANNELS, SOCIAL_CHANNELS, MONTHLY_SALES_OPTIONS } from './constants'

export const SalesStep = ({ formData, updateFormData }: StepProps) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <Label className="font-bold text-slate-700">Select your retail channels *</Label>
                <MultiSelect
                    options={RETAIL_CHANNELS}
                    selected={formData.retailChannels}
                    onChange={(val) => updateFormData('retailChannels', val)}
                    placeholder="Where else do you sell?"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Reference link *</Label>
                    <Input
                        placeholder="e.g. your website or amazon store"
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                        value={formData.referenceLinks[0]}
                        onChange={(e) => updateFormData('referenceLinks', [e.target.value])}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Total monthly sales *</Label>
                    <Select
                        value={formData.monthlySales}
                        onValueChange={(v) => updateFormData('monthlySales', v)}
                    >
                        <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50">
                            <SelectValue placeholder="Select sales range" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100">
                            {MONTHLY_SALES_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <Label className="font-bold text-slate-700">Select your social channels</Label>
                <MultiSelect
                    options={SOCIAL_CHANNELS}
                    selected={formData.socialChannels}
                    onChange={(val) => updateFormData('socialChannels', val)}
                    placeholder="Which social media do you use for business?"
                />

                {formData.socialChannels.map((channel, idx) => (
                    <div key={channel} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-left-2 duration-300">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 capitalize">{channel} Link</Label>
                            <Input
                                placeholder={`https://${channel.toLowerCase()}.com/yourbrand`}
                                className="h-10 rounded-xl border-slate-100 bg-slate-50/50"
                                value={formData.socialMediaLinks[idx] || ''}
                                onChange={(e) => {
                                    const newLinks = [...formData.socialMediaLinks]
                                    newLinks[idx] = e.target.value
                                    updateFormData('socialMediaLinks', newLinks)
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400">User Count</Label>
                            <Input
                                placeholder="Followers / Subscribers"
                                className="h-10 rounded-xl border-slate-100 bg-slate-50/50"
                                value={formData.userCounts[idx] || ''}
                                onChange={(e) => {
                                    const newCounts = [...formData.userCounts]
                                    newCounts[idx] = e.target.value
                                    updateFormData('userCounts', newCounts)
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
