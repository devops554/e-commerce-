"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions"
import { cn } from "@/lib/utils"

interface SearchBarProps {
    /** Additional class names for the wrapper */
    className?: string
    /** Input placeholder text */
    placeholder?: string
    /** Height of the input — defaults to "h-11" */
    inputClassName?: string
}

export function SearchBar({ className, placeholder = 'Search for "fresh milk", "bread"...', inputClassName }: SearchBarProps) {
    const router = useRouter()
    const [inputValue, setInputValue] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const { suggestions, isLoading, clearSuggestions } = useSearchSuggestions(inputValue, 300)

    // Show dropdown when there are suggestions or when loading
    useEffect(() => {
        setIsOpen((isLoading || suggestions.length > 0) && inputValue.trim().length > 0)
        setActiveIndex(-1)
    }, [suggestions, isLoading, inputValue])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const navigate = useCallback((term: string) => {
        const q = term.trim()
        if (!q) return
        setIsOpen(false)
        setInputValue(q)
        clearSuggestions()
        router.push(`/search?q=${encodeURIComponent(q)}`)
    }, [router, clearSuggestions])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        navigate(inputValue)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActiveIndex((prev) => Math.max(prev - 1, -1))
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault()
            navigate(suggestions[activeIndex])
        } else if (e.key === "Escape") {
            setIsOpen(false)
        }
    }

    const handleClear = () => {
        setInputValue("")
        clearSuggestions()
        setIsOpen(false)
        inputRef.current?.focus()
    }

    return (
        <div ref={wrapperRef} className={cn("relative w-full", className)}>
            <form onSubmit={handleSubmit} role="search">
                <div className="relative group">
                    {/* Search Icon */}
                    <Search
                        className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors pointer-events-none",
                            isOpen ? "text-[#FF3269]" : "text-slate-400 group-focus-within:text-[#FF3269]"
                        )}
                    />

                    {/* Input */}
                    <input
                        ref={inputRef}
                        type="search"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={isOpen}
                        aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (suggestions.length > 0 && inputValue.trim()) setIsOpen(true)
                        }}
                        placeholder={placeholder}
                        autoComplete="off"
                        className={cn(
                            "w-full border border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl",
                            "pl-11 pr-10 h-11 text-sm",
                            "focus:bg-white focus:border-[#FF3269]/40 focus:ring-4 focus:ring-[#FF3269]/8",
                            "focus:outline-none transition-all placeholder:text-slate-400",
                            isOpen && "rounded-b-none border-b-transparent",
                            inputClassName
                        )}
                    />

                    {/* Right-side: loader or clear */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                        ) : inputValue ? (
                            <button
                                type="button"
                                onClick={handleClear}
                                aria-label="Clear search"
                                className="text-slate-400 hover:text-slate-600 transition-colors active:scale-90"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {isOpen && (
                <ul
                    role="listbox"
                    aria-label="Search suggestions"
                    className={cn(
                        "absolute z-50 left-0 right-0 top-full",
                        "bg-white border border-slate-200 border-t-0 rounded-b-xl",
                        "shadow-xl shadow-slate-200/60 overflow-hidden",
                        "divide-y divide-slate-50"
                    )}
                >
                    {isLoading && suggestions.length === 0 ? (
                        <li className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Searching...
                        </li>
                    ) : suggestions.length === 0 ? (
                        <li className="px-4 py-3 text-sm text-slate-400">
                            No suggestions found
                        </li>
                    ) : (
                        suggestions.map((suggestion, idx) => (
                            <li
                                key={suggestion}
                                id={`suggestion-${idx}`}
                                role="option"
                                aria-selected={idx === activeIndex}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onMouseDown={(e) => {
                                    e.preventDefault() // prevent input blur before click
                                    navigate(suggestion)
                                }}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm",
                                    idx === activeIndex
                                        ? "bg-[#FF3269]/5 text-[#FF3269]"
                                        : "text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span className="flex-1 truncate font-medium">{suggestion}</span>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    )
}
