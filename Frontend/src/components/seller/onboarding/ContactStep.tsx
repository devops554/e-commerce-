import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Info } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { StepProps } from './types'

export const ContactStep = ({ formData, updateFormData, updateNestedData }: StepProps) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100/50 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center">
                        <Info className="w-4 h-4 text-[#FF3269]" />
                    </div>
                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">Login & Contact details</h4>
                </div>
                <p className="text-slate-500 text-sm">
                    These details will be used for all official communication and dashboard access.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700">SPOC Name *</Label>
                    <Input
                        placeholder="Single Point of Contact Person Name"
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                        value={formData.spocDetails.name}
                        onChange={(e) => updateNestedData('spocDetails', 'name', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label className="font-bold text-slate-700">Login email ID *</Label>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="rounded-xl p-3 bg-slate-900 text-white border-none shadow-2xl">
                                    <p className="text-xs font-bold">Registration is tied to this initial email ID</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <Input
                            disabled
                            className="h-12 rounded-2xl border-slate-100 bg-slate-200/50 font-bold text-slate-600"
                            value={formData.spocDetails.email}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Designation *</Label>
                        <Input
                            placeholder="e.g. Owner, Manager, Partner"
                            className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                            value={formData.spocDetails.designation}
                            onChange={(e) => updateNestedData('spocDetails', 'designation', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Phone Number *</Label>
                    <Input
                        placeholder="+91"
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
}
