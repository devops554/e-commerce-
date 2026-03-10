"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface MultiSelectOption {
    label: string
    value: string
}

interface MultiSelectProps {
    options: (string | MultiSelectOption)[]
    selected: string[]
    onChange: (val: string[]) => void
    placeholder: string
}

export const MultiSelect = ({ options, selected, onChange, placeholder }: MultiSelectProps) => {
    const [search, setSearch] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    const normalizedOptions = options.map(opt =>
        typeof opt === 'string' ? { label: opt, value: opt } : opt
    )

    const filtered = normalizedOptions.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase()) && !selected.includes(opt.value)
    )

    const getLabel = (value: string) => {
        return normalizedOptions.find(opt => opt.value === value)?.label || value
    }

    return (
        <div className="relative">
            <div
                className="min-h-[3.5rem] p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-wrap gap-2 cursor-pointer transition-all hover:bg-white hover:border-[#FF3269]/30"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selected.length === 0 && <span className="text-slate-400 p-1 text-sm">{placeholder}</span>}
                {selected.map(val => (
                    <div key={val} className="px-3 py-1.5 bg-rose-50 text-[#FF3269] text-xs font-bold rounded-xl flex items-center gap-2 animate-in zoom-in-95 duration-200">
                        {getLabel(val)}
                        <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-700 transition-colors" onClick={(e) => {
                            e.stopPropagation()
                            onChange(selected.filter(v => v !== val))
                        }} />
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[24px] shadow-2xl p-4 space-y-3"
                        >
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-10 rounded-xl border-slate-100 bg-slate-50 focus:bg-white"
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                                {filtered.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-slate-400 text-sm">No items found</p>
                                    </div>
                                ) : (
                                    filtered.map(opt => (
                                        <div
                                            key={opt.value}
                                            className="p-3 hover:bg-rose-50 hover:text-[#FF3269] rounded-xl text-sm font-bold text-slate-600 transition-all cursor-pointer flex items-center justify-between group"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onChange([...selected, opt.value])
                                            }}
                                        >
                                            {opt.label}
                                            <span className="opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-widest font-black">Add</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
