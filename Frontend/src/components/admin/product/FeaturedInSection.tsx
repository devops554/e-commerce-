"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { X } from 'lucide-react'

const FeaturedInSection = ({
    data,
    onChange
}: {
    data: any,
    onChange: (field: string, value: any) => void
}) => {

    const [featuredIn, setFeaturedIn] = useState<string[]>(
        data.featuredIn || []
    )

    const [newValue, setNewValue] = useState("")

    const addFeature = () => {
        if (!newValue.trim()) return
        const updated = [...featuredIn, newValue.trim()]
        setFeaturedIn(updated)
        onChange("featuredIn", updated)
        setNewValue("")
    }

    const removeFeature = (index: number) => {
        const updated = featuredIn.filter((_, i) => i !== index)
        setFeaturedIn(updated)
        onChange("featuredIn", updated)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Featured In</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

                {/* Existing Tags */}
                <div className="flex flex-wrap gap-2">
                    {featuredIn.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm"
                        >
                            {item}
                            <X
                                size={14}
                                className="cursor-pointer text-red-500"
                                onClick={() => removeFeature(index)}
                            />
                        </div>
                    ))}
                </div>

                {/* Add New */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter section name (e.g. Home Page)"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                    />
                    <Button type='button' className='bg-green-700 hover:bg-green-800 text-white font-bold rounded-2xl h-11 px-6 shadow-lg shadow-green-100' onClick={addFeature}>
                        Add
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}

export default FeaturedInSection