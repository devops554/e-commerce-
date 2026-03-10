"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useStoreConfig, useSettingsActions } from '@/hooks/useSettings'
import { Globe, Save, Loader2, Building2, MapPin, Mail, Phone, ShieldCheck } from 'lucide-react'

export default function AdminSettingsPage() {
    const { data: config, isLoading: isFetching } = useStoreConfig()
    const { updateStoreConfig, isUpdating } = useSettingsActions()
    const [formData, setFormData] = useState({
        legalName: '',
        gstin: '',
        stateCode: '',
        address: '',
        email: '',
        phone: '',
    })

    useEffect(() => {
        if (config) {
            setFormData({
                legalName: config.legalName || '',
                gstin: config.gstin || '',
                stateCode: config.stateCode || '',
                address: config.address || '',
                email: config.email || '',
                phone: config.phone || '',
            })
        }
    }, [config])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateStoreConfig(formData)
    }

    if (isFetching) return (
        <div className="flex h-[400px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600/20 border-t-blue-600" />
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Settings</h1>
                    <p className="text-slate-500 font-medium">Manage your store's global configuration and tax details</p>
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-12 px-8 shadow-lg shadow-blue-100"
                >
                    {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="mr-2 h-5 w-5" /> Save Changes</>}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900">Store Identity</CardTitle>
                                <CardDescription className="font-medium">Information used on invoices and tax reports</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Legal Business Name</Label>
                                <Input
                                    value={formData.legalName}
                                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                                    placeholder="Enter full legal name"
                                    className="rounded-xl border-slate-100 h-12 font-bold focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-400">GSTIN / Tax ID</Label>
                                <Input
                                    value={formData.gstin}
                                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                    placeholder="e.g. 27AABCU9603R1ZX"
                                    className="rounded-xl border-slate-100 h-12 font-bold focus:ring-blue-500"
                                />
                                <p className="text-[10px] text-slate-400 font-medium italic">Standard 15-digit GSTIN used for India tax calculation</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-50 pt-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-400">State / State Code</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input
                                        value={formData.stateCode}
                                        onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                                        placeholder="e.g. Maharashtra or 27"
                                        className="pl-11 rounded-xl border-slate-100 h-12 font-bold focus:ring-blue-500"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium italic">Used to differntiate CGST/SGST vs IGST</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Registered Address</Label>
                                <Textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Enter full business address..."
                                    className="rounded-xl border-slate-100 min-h-[100px] font-bold focus:ring-blue-500 shadow-none ring-0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-50 pt-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Support Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="tax@yourstore.com"
                                        className="pl-11 rounded-xl border-slate-100 h-12 font-bold focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Contact Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91..."
                                        className="pl-11 rounded-xl border-slate-100 h-12 font-bold focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-start gap-4 p-6 bg-amber-50 rounded-3xl border border-amber-100">
                    <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
                    <div>
                        <h4 className="font-black text-amber-900">Automatic Initialization</h4>
                        <p className="text-xs font-bold text-amber-700 mt-1 leading-relaxed">
                            If dynamic settings are not found in the database, the system automatically falls back to environment variables defined in <code className="bg-amber-100/50 px-1 rounded">seller.config.ts</code>. Saving changes here will override environment-based values.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
