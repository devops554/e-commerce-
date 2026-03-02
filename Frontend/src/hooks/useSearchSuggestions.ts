"use client"

import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'
import { productService } from '../services/product.service'

/**
 * Hook that provides debounced search suggestions from the backend autocomplete API.
 * Architecture: product.service.getSuggestions → useSearchSuggestions → SearchBar component
 */
export function useSearchSuggestions(query: string, debounceMs: number = 300) {
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const debouncedQuery = useDebounce(query, debounceMs)

    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.trim().length < 1) {
            setSuggestions([])
            setIsLoading(false)
            return
        }

        let cancelled = false
        setIsLoading(true)

        productService.getSuggestions(debouncedQuery)
            .then((data) => {
                if (!cancelled) {
                    // Capitalise first letter of each suggestion for display
                    setSuggestions(
                        data.slice(0, 8).map(
                            (s) => s.charAt(0).toUpperCase() + s.slice(1)
                        )
                    )
                }
            })
            .catch(() => {
                if (!cancelled) setSuggestions([])
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [debouncedQuery])

    const clearSuggestions = () => setSuggestions([])

    return { suggestions, isLoading, clearSuggestions }
}
