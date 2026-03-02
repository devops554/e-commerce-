'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, ShieldCheck, Clock, Truck, RotateCcw } from 'lucide-react'

interface Props {
    onAddToCart: () => void
    disabled?: boolean
}

export function ProductActions({ onAddToCart, disabled }: Props) {
    return (
        <div className="space-y-4 mt-8">
            <Button
                onClick={onAddToCart}
                disabled={disabled}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-[#E62E5F] text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] group disabled:opacity-50"
            >
                <ShoppingCart className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                {disabled ? 'OUT OF STOCK' : 'ADD TO CART'}
            </Button>

            {/* <div className="grid grid-cols-2 gap-3">
                {[
                    { icon: ShieldCheck, label: '100% Genuine', color: 'text-green-600' },
                    { icon: Clock, label: 'Flash Delivery', color: 'text-blue-600' },
                    { icon: Truck, label: 'Free Delivery', color: 'text-purple-600' },
                    { icon: RotateCcw, label: 'Easy Returns', color: 'text-orange-600' },
                ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50">
                        <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{label}</span>
                    </div>
                ))}
            </div> */}
        </div>
    )
}
