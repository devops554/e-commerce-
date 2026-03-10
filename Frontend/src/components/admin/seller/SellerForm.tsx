"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2, Store, User, Mail, Phone, MapPin, CreditCard, ShieldCheck } from 'lucide-react'

interface SellerFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    title: string;
}

export default function SellerForm({ initialData, onSubmit, isLoading, title }: SellerFormProps) {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        email: '',
        phone: '',
        storeName: '',
        storeDescription: '',
        businessType: 'Retailer',
        panNumber: '',
        aadharNumber: '',
        gstNumber: '',
        spocDetails: { name: '', email: '', designation: 'Owner' },
        pickupAddress: { addressLine: '', city: '', state: '', pincode: '', country: 'India' },
        bankDetails: { accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '' },
        productCategories: [],
        topCategories: [],
        retailChannels: ['Web'],
    })

    const handleChange = (path: string, value: any) => {
        const keys = path.split('.')
        if (keys.length === 1) {
            setFormData({ ...formData, [keys[0]]: value })
        } else {
            setFormData({
                ...formData,
                [keys[0]]: {
                    ...formData[keys[0] as keyof typeof formData],
                    [keys[1]]: value
                }
            })
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-slate-900">{title}</h1>
                <Button disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-blue-100">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="mr-2 h-5 w-5" /> Save Seller</>}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Store Info */}
                <Card className="rounded-3xl border-none shadow-sm">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-base font-black flex items-center gap-2">
                            <Store className="h-5 w-5 text-blue-600" /> Store Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Store Name</Label>
                            <Input required value={formData.storeName} onChange={(e) => handleChange('storeName', e.target.value)} placeholder="e.g. Fresh Mart" className="rounded-xl border-slate-100 h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label>Business Type</Label>
                            <Input required value={formData.businessType} onChange={(e) => handleChange('businessType', e.target.value)} placeholder="e.g. Retailer" className="rounded-xl border-slate-100 h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label>Store Description</Label>
                            <Textarea value={formData.storeDescription} onChange={(e) => handleChange('storeDescription', e.target.value)} placeholder="Describe the store..." className="rounded-xl border-slate-100 min-h-[100px]" />
                        </div>
                    </CardContent>
                </Card>

                {/* Owner Info */}
                <Card className="rounded-3xl border-none shadow-sm">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-base font-black flex items-center gap-2">
                            <User className="h-5 w-5 text-purple-600" /> Owner Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input required value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Owner's Name" className="rounded-xl border-slate-100 h-11" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input required type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="owner@example.com" className="rounded-xl border-slate-100 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input required value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+91 ..." className="rounded-xl border-slate-100 h-11" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>PAN Number</Label>
                                <Input required value={formData.panNumber} onChange={(e) => handleChange('panNumber', e.target.value)} placeholder="ABCDE1234F" className="rounded-xl border-slate-100 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Aadhar Number</Label>
                                <Input required value={formData.aadharNumber} onChange={(e) => handleChange('aadharNumber', e.target.value)} placeholder="1234 5678 9012" className="rounded-xl border-slate-100 h-11" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>GST Number</Label>
                            <Input required value={formData.gstNumber} onChange={(e) => handleChange('gstNumber', e.target.value)} placeholder="22AAAAA0000A1Z5" className="rounded-xl border-slate-100 h-11" />
                        </div>
                    </CardContent>
                </Card>

                {/* Pickup Address */}
                <Card className="rounded-3xl border-none shadow-sm">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-base font-black flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-rose-600" /> Pickup Address
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Address Line</Label>
                            <Input required value={formData.pickupAddress.addressLine} onChange={(e) => handleChange('pickupAddress.addressLine', e.target.value)} placeholder="Street name, landmark..." className="rounded-xl border-slate-100 h-11" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input required value={formData.pickupAddress.city} onChange={(e) => handleChange('pickupAddress.city', e.target.value)} placeholder="e.g. Mumbai" className="rounded-xl border-slate-100 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Input required value={formData.pickupAddress.state} onChange={(e) => handleChange('pickupAddress.state', e.target.value)} placeholder="e.g. Maharashtra" className="rounded-xl border-slate-100 h-11" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Pincode</Label>
                                <Input required value={formData.pickupAddress.pincode} onChange={(e) => handleChange('pickupAddress.pincode', e.target.value)} placeholder="400001" className="rounded-xl border-slate-100 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <Input readOnly value={formData.pickupAddress.country} className="rounded-xl border-slate-100 h-11 bg-slate-50" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Details */}
                <Card className="rounded-3xl border-none shadow-sm">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-base font-black flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-emerald-600" /> Bank Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Account Holder Name</Label>
                            <Input required value={formData.bankDetails.accountHolderName} onChange={(e) => handleChange('bankDetails.accountHolderName', e.target.value)} placeholder="As per passbook" className="rounded-xl border-slate-100 h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Number</Label>
                            <Input required value={formData.bankDetails.accountNumber} onChange={(e) => handleChange('bankDetails.accountNumber', e.target.value)} placeholder="Your account number" className="rounded-xl border-slate-100 h-11" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                <Input required value={formData.bankDetails.bankName} onChange={(e) => handleChange('bankDetails.bankName', e.target.value)} placeholder="e.g. SBI, HDFC" className="rounded-xl border-slate-100 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>IFSC Code</Label>
                                <Input required value={formData.bankDetails.ifscCode} onChange={(e) => handleChange('bankDetails.ifscCode', e.target.value)} placeholder="SBIN0001234" className="rounded-xl border-slate-100 h-11" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SPOC Details */}
                <Card className="rounded-3xl border-none shadow-sm md:col-span-2">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-base font-black flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-orange-600" /> SPOC Details (Primary Contact)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>SPOC Name</Label>
                            <Input required value={formData.spocDetails.name} onChange={(e) => handleChange('spocDetails.name', e.target.value)} placeholder="Contact Person" className="rounded-xl border-slate-100 h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label>SPOC Email</Label>
                            <Input required type="email" value={formData.spocDetails.email} onChange={(e) => handleChange('spocDetails.email', e.target.value)} placeholder="email@example.com" className="rounded-xl border-slate-100 h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label>Designation</Label>
                            <Input required value={formData.spocDetails.designation} onChange={(e) => handleChange('spocDetails.designation', e.target.value)} placeholder="e.g. Manager" className="rounded-xl border-slate-100 h-11" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    )
}
