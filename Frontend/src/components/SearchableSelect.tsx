"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { ChevronDown, Search, Check, X } from 'lucide-react'

export interface SelectItem { _id: string; name: string }

export interface SearchableSelectProps {
    label: string;
    placeholder: string;
    items: SelectItem[];
    selectedId: string | null | undefined;
    onSelect: (id: string | null) => void;
    disabled?: boolean;
    emptyMessage?: string;
    className?: string;
}

export function SearchableSelect({
    label,
    placeholder,
    items,
    selectedId,
    onSelect,
    disabled = false,
    emptyMessage = "No items found.",
    className = "",
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const selectedItem = items.find(i => i._id === selectedId)
    const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                setSearch("")
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleOpen = () => {
        if (disabled) return
        setIsOpen(true)
        setSearch("")
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    const handleSelect = (id: string) => {
        onSelect(id)
        setIsOpen(false)
        setSearch("")
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onSelect(null)
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <Label className="font-bold text-sm text-slate-700 ml-1">{label}</Label>
            <div ref={containerRef} className="relative">
                {/* Trigger */}
                <button
                    type="button"
                    onClick={handleOpen}
                    disabled={disabled}
                    className={`
                        w-full h-12 px-4 rounded-xl text-left flex items-center justify-between border transition-all duration-200
                        ${disabled
                            ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                            : isOpen
                                ? 'border-blue-400 ring-2 ring-blue-50 bg-white shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }
                    `}
                >
                    <span className={selectedItem ? 'text-slate-900 font-medium text-sm' : 'text-slate-400 text-sm'}>
                        {selectedItem ? selectedItem.name : placeholder}
                    </span>
                    <div className="flex items-center gap-1.5">
                        {selectedItem && !disabled && (
                            <span
                                role="button"
                                onClick={handleClear}
                                className="h-5 w-5 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <X className="h-3 w-3" />
                            </span>
                        )}
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* Search */}
                        <div className="p-2 border-b border-slate-100">
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Type to search..."
                                    className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
                                />
                                {search && (
                                    <button type="button" onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-52 overflow-y-auto p-1.5">
                            {filtered.length === 0 ? (
                                <div className="py-6 text-center text-sm text-slate-400">{emptyMessage}</div>
                            ) : (
                                filtered.map(item => (
                                    <button
                                        key={item._id}
                                        type="button"
                                        onClick={() => handleSelect(item._id)}
                                        className={`
                                            w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors
                                            ${selectedId === item._id
                                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                                : 'text-slate-700 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        <span className="flex-1">{item.name}</span>
                                        {selectedId === item._id && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
