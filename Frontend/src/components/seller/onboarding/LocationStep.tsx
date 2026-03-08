import React, { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import worldData from '@/data/world.json'
import { StepProps } from './types'

export const LocationStep = ({ formData, updateNestedData }: StepProps) => {
    const countries = useMemo(() => (worldData as any[]).map(c => c.name), [])
    const selectedCountry = useMemo(() => (worldData as any[]).find(c => c.name === formData.pickupAddress.country), [formData.pickupAddress.country])
    const states = useMemo(() => selectedCountry?.states.map((s: any) => s.name) || [], [selectedCountry])
    const selectedState = useMemo(() => selectedCountry?.states.find((s: any) => s.name === formData.pickupAddress.state), [selectedCountry, formData.pickupAddress.state])
    const cities = useMemo(() => selectedState?.cities || [], [selectedState])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest border-l-4 border-[#FF3269] pl-3">Pickup Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Country *</Label>
                        <Select
                            value={formData.pickupAddress.country}
                            onValueChange={(v) => {
                                updateNestedData('pickupAddress', 'country', v)
                                updateNestedData('pickupAddress', 'state', '')
                                updateNestedData('pickupAddress', 'city', '')
                            }}
                        >
                            <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50">
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 max-h-60">
                                {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">State *</Label>
                        <Select
                            value={formData.pickupAddress.state}
                            onValueChange={(v) => {
                                updateNestedData('pickupAddress', 'state', v)
                                updateNestedData('pickupAddress', 'city', '')
                            }}
                            disabled={!formData.pickupAddress.country}
                        >
                            <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50">
                                <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 max-h-60">
                                {states.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">City *</Label>
                        <Select
                            value={formData.pickupAddress.city}
                            onValueChange={(v) => updateNestedData('pickupAddress', 'city', v)}
                            disabled={!formData.pickupAddress.state}
                        >
                            <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50">
                                <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 max-h-60">
                                {cities.map((city: string) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Pincode *</Label>
                        <Input
                            placeholder="000000"
                            className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                            value={formData.pickupAddress.pincode}
                            onChange={(e) => updateNestedData('pickupAddress', 'pincode', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Detailed Address (House/Plot No, Street, Landmark) *</Label>
                    <Input
                        placeholder="Full pickup address"
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                        value={formData.pickupAddress.addressLine}
                        onChange={(e) => updateNestedData('pickupAddress', 'addressLine', e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-6">
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest border-l-4 border-emerald-500 pl-3">Bank Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Account Holder Name *</Label>
                        <Input
                            placeholder="As per bank records"
                            className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                            value={formData.bankDetails.accountHolderName}
                            onChange={(e) => updateNestedData('bankDetails', 'accountHolderName', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Bank Name *</Label>
                        <Input
                            placeholder="e.g. HDFC Bank"
                            className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                            value={formData.bankDetails.bankName}
                            onChange={(e) => updateNestedData('bankDetails', 'bankName', e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Account Number *</Label>
                        <Input
                            placeholder="Your account number"
                            className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                            value={formData.bankDetails.accountNumber}
                            onChange={(e) => updateNestedData('bankDetails', 'accountNumber', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">IFSC Code *</Label>
                        <Input
                            placeholder="HDFC0001234"
                            className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 uppercase"
                            value={formData.bankDetails.ifscCode}
                            onChange={(e) => updateNestedData('bankDetails', 'ifscCode', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
