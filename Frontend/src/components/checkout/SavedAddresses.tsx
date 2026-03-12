"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, CheckCircle2, Plus, Pencil, Trash2, Home, Briefcase, Building } from "lucide-react"

interface Address {
    _id: string;
    label: string;
    fullName: string;
    phone: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    location?: { latitude: number; longitude: number };


}

interface SavedAddressesProps {
    addresses: Address[];
    selectedId: string | null;
    onSelect: (address: Address) => void;
    onAddNew: () => void;
    onEdit: (address: Address) => void;
    onDelete: (addressId: string) => void;
}

export function SavedAddresses({ addresses, selectedId, onSelect, onAddNew, onEdit, onDelete }: SavedAddressesProps) {
    const getLabelIcon = (label: string) => {
        const l = label?.toLowerCase() || '';
        if (l === 'home') return <Home className="w-5 h-5" />;
        if (l === 'work' || l === 'office') return <Briefcase className="w-5 h-5" />;
        return <Building className="w-5 h-5" />;
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => {
                    const isSelected = selectedId === address._id;
                    return (
                        <Card
                            key={address._id}
                            className={`cursor-pointer transition-all duration-300 rounded-[32px] overflow-hidden border-2 group relative ${isSelected
                                ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.02] z-10"
                                : "border-slate-100 hover:border-slate-300 bg-white hover:shadow-lg hover:shadow-slate-200/50"
                                }`}
                            onClick={() => onSelect(address)}
                        >
                            <CardContent className="p-6 relative">
                                {isSelected && (
                                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                                        <div className="bg-primary text-white rounded-full p-1 shadow-lg shadow-primary/20 animate-in zoom-in duration-300">
                                            <CheckCircle2 className="w-5 h-5 fill-primary text-white" />
                                        </div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Deliver Here</span>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
                                        {getLabelIcon(address.label)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-black text-slate-900">{address.fullName}</p>
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[10px] font-black underline underline-offset-4 decoration-primary/30 uppercase px-2 h-5 gap-1">
                                                {getLabelIcon(address.label)}
                                                {address.label || 'Home'}
                                            </Badge>
                                            {address.isDefault && (
                                                <Badge className="bg-slate-900 text-[8px] font-black uppercase tracking-widest h-5">Default</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 tracking-tight">{address.phone}</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                        {address.street}
                                        {address.landmark && <span className="text-slate-400">, {address.landmark}</span>}
                                    </p>
                                    <p className="text-sm font-black text-slate-700">
                                        {address.city}, {address.state} - {address.postalCode}
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(address);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/5"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(address._id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                <Card
                    className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-slate-50/50 transition-all rounded-[32px] flex flex-col items-center justify-center p-8 min-h-[160px] group"
                    onClick={onAddNew}
                >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-black text-slate-500 group-hover:text-primary transition-colors uppercase tracking-widest">Add New Address</p>
                </Card>
            </div>
        </div>
    );
}
