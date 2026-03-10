"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'
import SimpleImageUpload from '@/components/SimpleImageUpload'
import { CheckIcon, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import GstBreakdownCard from './GstBreakdownCard'

interface VariantDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
    isLoading?: boolean;
    availableImages?: { url: string; publicId: string }[];
    productAttributes?: { name: string; value: string }[];
    productGst?: { gstRate?: number; includedInPrice?: boolean };
}

export default function VariantDialog({ isOpen, onClose, onSave, initialData, isLoading, availableImages = [], productAttributes = [], productGst }: VariantDialogProps) {
    const [formData, setFormData] = React.useState<any>(initialData || {
        price: 0,
        isActive: true,
        isFeatured: [],
        attributes: productAttributes.length > 0 ? productAttributes.map(a => ({ name: a.name, value: '' })) : [],
        images: []
    })

    React.useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData, isFeatured: initialData.isFeatured || [], attributes: initialData.attributes || [] })
        } else {
            setFormData({
                price: 0, isActive: true, isFeatured: [],
                attributes: productAttributes.length > 0 ? productAttributes.map(a => ({ name: a.name, value: '' })) : [],
                images: []
            })
        }
    }, [initialData, isOpen, productAttributes])

    const [newFeature, setNewFeature] = React.useState("")

    const addFeature = () => {
        if (!newFeature.trim()) return
        const current = formData.isFeatured || []
        if (current.includes(newFeature.trim())) return
        handleChange('isFeatured', [...current, newFeature.trim()])
        setNewFeature("")
    }

    const removeFeature = (feat: string) => {
        const current = formData.isFeatured || []
        handleChange('isFeatured', current.filter((f: string) => f !== feat))
    }

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleAttrChange = (index: number, field: 'name' | 'value', value: string) => {
        const currentAttrs = [...(formData.attributes || [])]
        currentAttrs[index] = { ...currentAttrs[index], [field]: value }
        setFormData({ ...formData, attributes: currentAttrs })
    }

    const addAttribute = () => {
        setFormData({ ...formData, attributes: [...(formData.attributes || []), { name: '', value: '' }] })
    }

    const removeAttribute = (index: number) => {
        const currentAttrs = [...(formData.attributes || [])]
        currentAttrs.splice(index, 1)
        setFormData({ ...formData, attributes: currentAttrs })
    }

    const syncFromProduct = () => {
        if (!productAttributes?.length) return

        const currentAttrs = [...(formData.attributes || [])]
        productAttributes.forEach(pAttr => {
            if (!currentAttrs.find(a => a.name.toLowerCase() === pAttr.name.toLowerCase())) {
                currentAttrs.push({ name: pAttr.name, value: '' })
            }
        })
        setFormData({ ...formData, attributes: currentAttrs })
    }

    const toggleAvailableImage = (img: { url: string, publicId: string }) => {
        const currentImages = formData.images || []
        const exists = currentImages.find((i: any) => i.url === img.url)

        if (exists) {
            handleChange('images', currentImages.filter((i: any) => i.url !== img.url))
        } else {
            handleChange('images', [...currentImages, img])
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] rounded-3xl overflow-hidden p-0 border-none shadow-2xl">
                <DialogHeader className="p-6 bg-slate-900 text-white">
                    <DialogTitle className="text-2xl font-black">{initialData ? 'Edit Variant' : 'Add New Variant'}</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase text-slate-500">Price (₹)</Label>
                            <Input
                                type="number"
                                value={formData.price}
                                onChange={(e) => {
                                    const val = +e.target.value
                                    handleChange('price', val)
                                    // Auto calculate discountPrice if discount exists
                                    if (formData.discount) {
                                        const disc = (val * formData.discount) / 100
                                        handleChange('discountPrice', val - disc)
                                    }
                                }}
                                className="rounded-xl border-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase text-slate-500">Discount (%)</Label>
                            <Input
                                type="number"
                                value={formData.discount || ''}
                                placeholder="0"
                                onChange={(e) => {
                                    const val = +e.target.value
                                    handleChange('discount', val)
                                    if (formData.price) {
                                        const disc = (formData.price * val) / 100
                                        handleChange('discountPrice', formData.price - disc)
                                    }
                                }}
                                className="rounded-xl border-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase text-slate-500">Disc. Price</Label>
                            <Input
                                type="number"
                                value={formData.discountPrice || ''}
                                readOnly
                                className="rounded-xl bg-slate-50 border-slate-100 font-bold text-blue-600"
                            />
                        </div>
                    </div>

                    {/* Live GST breakdown — shown if product has GST config */}
                    <GstBreakdownCard
                        price={formData.discountPrice || formData.price || 0}
                        gstRate={productGst?.gstRate}
                        includedInPrice={productGst?.includedInPrice}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase text-slate-400">Total Stock (All Warehouses)</Label>
                            <div className="h-10 px-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                                <span className="font-black text-slate-900">{formData.stock || 0}</span>
                                <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-tight">Read Only</Badge>
                            </div>
                            <p className="text-[9px] text-slate-400 italic">Managed via Warehouse Inventory</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase text-slate-500">SKU Code</Label>
                            <Input
                                placeholder="PROD-VAR-SKU"
                                value={formData.sku || ''}
                                onChange={(e) => handleChange('sku', e.target.value)}
                                className="rounded-xl font-mono text-sm border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <div className="space-y-1">
                            <Label className="font-bold text-slate-900">Featured In</Label>
                            <p className="text-[10px] text-slate-500 italic">Add locations where this variant should be highlighted (e.g., 'Home Page', 'Flash Sale').</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(formData.isFeatured || []).map((feat: string, i: number) => (
                                <div key={i} className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                                    {feat}
                                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeFeature(feat)} />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. Home Page"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                className="rounded-xl bg-white h-10 text-sm"
                            />
                            <Button type="button" onClick={addFeature} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-3">
                                <Plus size={18} />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="font-bold text-sm text-slate-700">Variant Attributes</Label>
                            {productAttributes.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={syncFromProduct}
                                    className="text-[10px] h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold uppercase tracking-wider"
                                >
                                    <RefreshCw size={12} className="mr-1" />
                                    Sync from Product
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {(formData.attributes || []).map((attr: { name: string; value: string }, index: number) => {
                                // Find if this attribute exists in product attributes for suggestions
                                const pAttr = productAttributes.find(pa => pa.name.toLowerCase() === attr.name.toLowerCase())
                                const valueSuggestions = pAttr?.value ? pAttr.value.split(',').map(v => v.trim()).filter(Boolean) : []

                                return (
                                    <div key={index} className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="space-y-1.5">
                                                    <Input
                                                        placeholder="Name (e.g. Size)"
                                                        value={attr.name}
                                                        onChange={(e) => handleAttrChange(index, 'name', e.target.value)}
                                                        className="h-9 text-xs rounded-xl border-slate-200 font-bold"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="space-y-1.5">
                                                    <Input
                                                        placeholder="Value (e.g. XL)"
                                                        value={attr.value}
                                                        onChange={(e) => handleAttrChange(index, 'value', e.target.value)}
                                                        className="h-9 text-xs rounded-xl border-slate-200"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                                onClick={() => removeAttribute(index)}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>

                                        {/* Suggestions for Names if empty */}
                                        {!attr.name && productAttributes.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                <span className="text-[9px] text-slate-400 uppercase font-black mr-1 mt-1">Suggested:</span>
                                                {productAttributes.map((pa, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="outline"
                                                        className="text-[9px] cursor-pointer hover:bg-blue-50 border-slate-200"
                                                        onClick={() => handleAttrChange(index, 'name', pa.name)}
                                                    >
                                                        {pa.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {/* Suggestions for Values if name is set */}
                                        {attr.name && valueSuggestions.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                <span className="text-[9px] text-slate-400 uppercase font-black mr-1 mt-1">Quick Select:</span>
                                                {valueSuggestions.map((val, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        variant={attr.value === val ? "default" : "outline"}
                                                        className={`text-[9px] cursor-pointer ${attr.value === val ? "bg-blue-600" : "hover:bg-blue-50 border-slate-200"}`}
                                                        onClick={() => handleAttrChange(index, 'value', val)}
                                                    >
                                                        {val}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addAttribute}
                                className="w-full border-dashed border-2 border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 h-10 rounded-xl"
                            >
                                <Plus size={16} className="mr-2" />
                                Add Extra Attribute
                            </Button>
                        </div>
                    </div>

                    {/* Available Images Selection */}
                    {availableImages.length > 0 && (
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                            <Label className="font-bold text-sm text-slate-700">Select from Product Gallery</Label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {availableImages.map((img, idx) => {
                                    const isSelected = (formData.images || []).some((i: any) => i.url === img.url)
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => toggleAvailableImage(img)}
                                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-100 scale-95' : 'border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300'}`}
                                        >
                                            <img src={img.url} alt="" className="object-cover h-full w-full" />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                                                    <div className="bg-blue-600 text-white rounded-full p-0.5 shadow-lg">
                                                        <CheckIcon className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <p className="text-[10px] text-slate-400 italic">Quickly reuse images uploaded to the main product media section.</p>
                        </div>
                    )}

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <Label className="font-bold text-slate-700">Add Color-Specific Images</Label>
                        <SimpleImageUpload
                            value={(formData.images || []).map((img: any) => img.url)}
                            multiple
                            onImagesUploaded={(urls) => {
                                const newImages = urls.map(url => ({ url, publicId: 'manual' }))
                                handleChange('images', [...(formData.images || []), ...newImages])
                            }}
                            onValueChange={(val) => {
                                if (Array.isArray(val)) {
                                    handleChange('images', val.map(url => ({ url, publicId: 'manual' })))
                                }
                            }}
                        />
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancel</Button>
                    <Button
                        onClick={() => onSave(formData)}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 shadow-lg shadow-blue-100"
                    >
                        {isLoading ? "Saving..." : "Save Variant"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
