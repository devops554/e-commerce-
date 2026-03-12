"use client"

// components/ui/CountryStateCitySelect.tsx
// Usage: import world.json and pass to this component
// Gives 3 linked dropdowns: Country → State → City

import { useState, useMemo } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import worldData from "@/data/world.json"   // ← apna path yahan set karo

// ── Types ─────────────────────────────────────────────────────────────────────

interface City {
    name: string
}

interface State {
    name: string
    state_code: string
    cities: string[]   // world.json mein cities strings hain
}

interface Country {
    name: string
    iso2: string
    iso3: string
    phone_code: string
    emoji: string
    states: State[]
}

export interface LocationValue {
    country: string      // country name
    state: string        // state name
    city: string         // city name
    countryCode: string  // iso2
    phoneCode: string    // e.g. "91"
}

interface CountryStateCitySelectProps {
    value?: Partial<LocationValue>
    onChange: (val: LocationValue) => void
    required?: boolean
    labels?: {
        country?: string
        state?: string
        city?: string
    }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CountryStateCitySelect({
    value = {},
    onChange,
    required,
    labels = {},
}: CountryStateCitySelectProps) {
    const countries = worldData as Country[]

    // ── Derived lists ─────────────────────────────────────────────────────────
    const selectedCountry = useMemo(
        () => countries.find((c) => c.name === value.country) ?? null,
        [value.country]
    )

    const states = useMemo(
        () => selectedCountry?.states ?? [],
        [selectedCountry]
    )

    const selectedState = useMemo(
        () => states.find((s) => s.name === value.state) ?? null,
        [states, value.state]
    )

    const cities = useMemo(
        () => selectedState?.cities ?? [],
        [selectedState]
    )

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleCountryChange = (countryName: string) => {
        const c = countries.find((x) => x.name === countryName)
        onChange({
            country: countryName,
            countryCode: c?.iso2 ?? "",
            phoneCode: c?.phone_code ?? "",
            state: "",
            city: "",
        })
    }

    const handleStateChange = (stateName: string) => {
        onChange({
            country: value.country ?? "",
            countryCode: value.countryCode ?? "",
            phoneCode: value.phoneCode ?? "",
            state: stateName,
            city: "",
        })
    }

    const handleCityChange = (cityName: string) => {
        onChange({
            country: value.country ?? "",
            countryCode: value.countryCode ?? "",
            phoneCode: value.phoneCode ?? "",
            state: value.state ?? "",
            city: cityName,
        })
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* ── Country ── */}
            <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {labels.country ?? "Country"}{required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                <Select value={value.country ?? ""} onValueChange={handleCountryChange}>
                    <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all">
                        <SelectValue placeholder="Select country">
                            {value.country && selectedCountry ? (
                                <span className="flex items-center gap-2 font-medium">
                                    <span className="text-base">{selectedCountry.emoji}</span>
                                    {value.country}
                                </span>
                            ) : (
                                <span className="text-slate-400">Select country</span>
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                        {countries.map((c) => (
                            <SelectItem key={c.iso2} value={c.name}>
                                <span className="flex items-center gap-2">
                                    <span className="text-base">{c.emoji}</span>
                                    <span>{c.name}</span>
                                    <span className="text-slate-400 text-xs">+{c.phone_code}</span>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* ── State ── */}
            <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {labels.state ?? "State"}{required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                <Select
                    value={value.state ?? ""}
                    onValueChange={handleStateChange}
                    disabled={!value.country || states.length === 0}
                >
                    <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all disabled:opacity-50">
                        <SelectValue placeholder={
                            !value.country ? "Select country first" :
                                states.length === 0 ? "No states available" :
                                    "Select state"
                        } />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                        {states.map((s) => (
                            <SelectItem key={s.state_code} value={s.name}>
                                {s.name}
                                <span className="text-slate-400 text-xs ml-1">({s.state_code})</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* ── City ── */}
            <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {labels.city ?? "City"}{required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                <Select
                    value={value.city ?? ""}
                    onValueChange={handleCityChange}
                    disabled={!value.state || cities.length === 0}
                >
                    <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all disabled:opacity-50">
                        <SelectValue placeholder={
                            !value.state ? "Select state first" :
                                cities.length === 0 ? "No cities available" :
                                    "Select city"
                        } />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                        {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                                {city}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

        </div>
    )
}