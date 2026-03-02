"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SimpleImageUpload from '@/components/SimpleImageUpload'
import { Label } from '@/components/ui/label'

interface MediaSectionProps {
    data: any;
    onChange: (field: string, value: any) => void;
}

export default function MediaSection({ data, onChange }: MediaSectionProps) {
    return (
        <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Product Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <Label className="font-bold text-slate-700">Display Thumbnail</Label>
                    <SimpleImageUpload
                        label="Main Display Image"
                        value={data.thumbnail?.url || ''}
                        onChange={(url) => onChange('thumbnail', { url, publicId: 'manually_set' })}
                        className="w-full"
                    />
                    <p className="text-[10px] text-slate-400">This image will be shown on product cards and search results.</p>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <Label className="font-bold text-slate-700">Gallery Images</Label>
                    <SimpleImageUpload
                        label="Add more images to the gallery"
                        multiple
                        onImagesUploaded={(urls) => {
                            const newImages = urls.map(url => ({ url, publicId: 'manually_set' }))
                            onChange('images', [...(data.images || []), ...newImages])
                        }}
                        onValueChange={(val) => {
                            if (Array.isArray(val)) {
                                const newImages = val.map(url => ({ url, publicId: 'manually_set' }))
                                onChange('images', newImages)
                            }
                        }}
                        value={(data.images || []).map((img: any) => img.url)}
                        className="w-full"
                    />
                    <p className="text-[10px] text-slate-400">Add up to 8 images for the product gallery carousel.</p>
                </div>
            </CardContent>
        </Card>
    )
}
