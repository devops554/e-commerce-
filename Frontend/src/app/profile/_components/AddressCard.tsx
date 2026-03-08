"use client"

import { MapPin, Home, Briefcase, Trash2, Edit2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAddress } from "@/services/user.service"

interface AddressCardProps {
    address: UserAddress;
    onEdit: (address: UserAddress) => void;
    onDelete: (id: string) => void;
    isDeleting?: boolean;
}

export function AddressCard({ address, onEdit, onDelete, isDeleting }: AddressCardProps) {
    const Icon = address.label?.toLowerCase() === 'home'
        ? Home
        : address.label?.toLowerCase() === 'office'
            ? Briefcase
            : MapPin;

    return (
        <div className="group relative bg-white rounded-3xl border border-slate-100 hover:border-[#FF3269]/30 hover:shadow-lg hover:shadow-rose-50 transition-all duration-300 overflow-hidden">
            {/* Default badge strip */}
            {address.isDefault && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF3269] to-pink-400" />
            )}

            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 group-hover:bg-rose-50 transition-colors flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-slate-400 group-hover:text-[#FF3269] transition-colors" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-slate-900 text-sm tracking-tight">{address.label}</h4>
                                {address.isDefault && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Default
                                    </span>
                                )}
                            </div>
                            <p className="text-xs font-bold text-slate-500 mt-0.5">{address.fullName}</p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(address)}
                            className="h-8 w-8 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-90"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(address._id)}
                            disabled={isDeleting}
                            className="h-8 w-8 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Address details */}
                <div className="pl-0 space-y-1.5">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {address.street}
                        {address.landmark ? `, ${address.landmark}` : ""}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                        {address.city}, {address.state} – {address.postalCode}
                    </p>
                    <p className="text-[11px] font-black text-slate-400 tracking-wider font-mono pt-1">
                        📞 {address.phone}
                    </p>
                </div>
            </div>
        </div>
    );
}