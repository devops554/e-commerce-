"use client"

import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, X, Loader2, Link as LinkIcon, UploadCloud } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axiosClient from '@/lib/axiosClient'

interface SimpleImageUploadProps {
    value?: string | string[];
    onChange?: (url: string) => void;
    onValueChange?: (value: string | string[]) => void;
    label?: string;
    className?: string;
    multiple?: boolean;
    onImagesUploaded?: (urls: string[]) => void;
}

export default function SimpleImageUpload({ value, onChange, onValueChange, onImagesUploaded, label = "Upload Image", className, multiple }: SimpleImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [activeTab, setActiveTab] = useState("upload")
    const [urlInput, setUrlInput] = useState("")
    const [isImageBroken, setIsImageBroken] = useState(false)
    const [sessionUploadedUrls, setSessionUploadedUrls] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (value && typeof value === 'string' && activeTab === 'url' && urlInput !== value) {
            setUrlInput(value);
        }
    }, [value, activeTab, urlInput]);

    // Reset error state when value changes
    useEffect(() => {
        setIsImageBroken(false);
    }, [value]);


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        if (!multiple && files.length > 1) {
            toast.error("Please upload only one image")
            return
        }

        // Validate all files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) {
                toast.error(`File ${file.name} is not an image`)
                return
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error(`File ${file.name} exceeds 5MB limit`)
                return
            }
        }

        setIsUploading(true)
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData()
                formData.append('file', file)
                const response = await axiosClient.post('/upload/single', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })

                const data = response.data
                return data.url || data.secure_url || data.data?.url
            })

            const uploadedUrls = await Promise.all(uploadPromises)
            const validUrls = uploadedUrls.filter(Boolean)

            if (validUrls.length > 0) {
                // Track these URLs as uploaded in this session
                setSessionUploadedUrls(prev => {
                    const next = new Set(prev);
                    validUrls.forEach(url => next.add(url));
                    return next;
                });

                if (multiple && onImagesUploaded) {
                    onImagesUploaded(validUrls)
                    toast.success(`${validUrls.length} images uploaded`)
                } else if (multiple && onValueChange && Array.isArray(value)) {
                    onValueChange([...value, ...validUrls])
                    toast.success(`${validUrls.length} images uploaded`)
                } else if (validUrls[0]) {
                    if (onChange) onChange(validUrls[0])
                    if (onValueChange) onValueChange(validUrls[0])
                    toast.success("Image uploaded")
                }
                setActiveTab("upload")
            } else {
                throw new Error("No valid URLs received")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to upload image(s)")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const validateImageUrl = (url: string) => {
        if (!url) return false;
        // Basic pattern check for common image extensions or direct data-urls
        const imagePattern = /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i;
        const isDataUrl = url.startsWith('data:image/');
        return imagePattern.test(url) || isDataUrl;
    };

    const handleApplyUrl = () => {
        if (!urlInput.trim()) {
            toast.error("Please enter a URL");
            return;
        }

        if (multiple) {
            // Split by comma or newline and filter out empty strings
            const urls = urlInput.split(/[,\n]+/).map(u => u.trim()).filter(Boolean);

            if (urls.length === 0) {
                toast.error("No valid URLs found");
                return;
            }

            const invalidUrls = urls.filter(u => !validateImageUrl(u));
            if (invalidUrls.length > 0) {
                toast.warning(`${invalidUrls.length} URL(s) might not be valid image links.`);
            }

            if (onImagesUploaded) {
                onImagesUploaded(urls);
            } else if (onValueChange && Array.isArray(value)) {
                onValueChange([...value, ...urls]);
            } else {
                // Fallback if neither is provided but multiple is true
                if (onChange) onChange(urls[0]);
                if (onValueChange) onValueChange(urls[0]);
            }

            toast.success(`${urls.length} URL(s) applied`);
            setUrlInput('');
        } else {
            if (!validateImageUrl(urlInput)) {
                toast.error("The URL doesn't look like a direct image link (e.g., .jpg, .png). It might not display correctly.");
            }

            if (onChange) onChange(urlInput);
            if (onValueChange) onValueChange(urlInput);
            toast.info("URL applied. If the image is broken, please check the link.");
        }
    };

    const handleRemoveItem = async (urlToRemove: string, index?: number) => {
        // If this URL was uploaded in the current session, delete it from Cloudinary
        if (urlToRemove && sessionUploadedUrls.has(urlToRemove)) {
            try {
                await axiosClient.delete('/upload/delete', { data: { imageUrl: urlToRemove } });
                setSessionUploadedUrls(prev => {
                    const next = new Set(prev);
                    next.delete(urlToRemove);
                    return next;
                });
                toast.success("Removed from storage");
            } catch (error) {
                console.error('Failed to delete from Cloudinary:', error);
                // We still remove it from the UI even if the backend call fails
            }
        }

        if (multiple && onValueChange && Array.isArray(value) && index !== undefined) {
            const newUrls = [...value];
            newUrls.splice(index, 1);
            onValueChange(newUrls);
        } else {
            if (onChange) onChange('')
            if (onValueChange) onValueChange('')
            setUrlInput('')
            setIsImageBroken(false)
        }
    }

    const handleRemove = () => {
        const urlToRemove = typeof value === 'string' ? value : '';
        handleRemoveItem(urlToRemove);
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                </label>
            </div>

            <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                        <UploadCloud className="h-4 w-4" /> Upload
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" /> URL
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-0 space-y-4">
                    {/* Preview for Upload Tab */}
                    {value && (typeof value === 'string' ? value : value.length > 0) ? (
                        <div className="space-y-4">
                            {Array.isArray(value) ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {value.map((url, index) => (
                                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-slate-100">
                                            <Image
                                                src={url}
                                                alt={`Uploaded content ${index + 1}`}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                                unoptimized={typeof url === 'string' && url.startsWith('http')}
                                            />
                                            <div className="absolute top-1 right-1">
                                                <button
                                                    type="button"
                                                    className="h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm transition-colors"
                                                    onClick={() => handleRemoveItem(url, index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-video rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors bg-white/50 group"
                                    >
                                        <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                        <span className="text-[10px] text-slate-500 mt-1">Add File</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 group bg-slate-100 flex items-center justify-center">
                                    {isImageBroken ? (
                                        <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                                            <ImagePlus className="h-10 w-10 mb-2 opacity-20" />
                                            <p className="text-xs font-medium">Unable to load image</p>
                                        </div>
                                    ) : (
                                        <Image
                                            src={typeof value === 'string' ? value : ''}
                                            alt="Uploaded content"
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                            onError={() => setIsImageBroken(true)}
                                            unoptimized={typeof value === 'string' && value.startsWith('http')}
                                        />
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="h-8 rounded-full shadow-md bg-white/90 hover:bg-white"
                                            onClick={handleRemove}
                                        >
                                            <X className="h-4 w-4 mr-1" /> Remove
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors bg-white/50"
                        >
                            {isUploading ? (
                                <div className="flex flex-col items-center text-slate-500">
                                    <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-600" />
                                    <span className="text-xs">Uploading...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-slate-500">
                                    <ImagePlus className="h-8 w-8 mb-2" />
                                    <span className="text-xs font-medium">Click to upload</span>
                                    <span className="text-[10px] text-slate-400 mt-1">Max 5MB (JPG, PNG)</span>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="url" className="mt-0 space-y-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://example.com/image.jpg"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleApplyUrl();
                                    }
                                }}
                            />
                            <Button type="button" onClick={handleApplyUrl} variant="outline" className="shrink-0 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">
                                {multiple ? "Add URLs" : "Apply"}
                            </Button>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-md">
                            <p className="text-[11px] text-amber-700 leading-relaxed">
                                <strong>Tip:</strong> Paste direct image links.
                                {multiple && " You can enter multiple URLs separated by commas or new lines."}
                            </p>
                        </div>
                    </div>

                    {/* Preview for URL Tab (Multiple mode only) */}
                    {multiple && Array.isArray(value) && value.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                            {value.map((url, index) => (
                                <div key={index} className="relative aspect-[4/3] rounded-md overflow-hidden border border-slate-200">
                                    <Image src={url} alt="" fill className="object-cover" unoptimized />
                                    <button
                                        type="button"
                                        className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/50 text-white flex items-center justify-center"
                                        onClick={() => handleRemoveItem(url, index)}
                                    >
                                        <X className="h-2 w-2" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                multiple={multiple}
            />
        </div>
    )
}
