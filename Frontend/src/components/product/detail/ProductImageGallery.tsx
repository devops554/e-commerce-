'use client'
import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Share2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductActions } from './ProductActions'

interface Props {
    selectedImage: string
    allImages: { url: string }[]
    productTitle: string
    onImageSelect: (url: string) => void
    onAddToCart: () => void
    disabled: boolean
}

export function ProductImageGallery({ selectedImage, allImages, productTitle, onImageSelect, onAddToCart, disabled }: Props) {
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });
    const containerRef = useRef<HTMLDivElement>(null);

    // Find current index for navigation
    const currentIndex = allImages.findIndex(img => img.url === selectedImage);

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % allImages.length;
        onImageSelect(allImages[nextIndex].url);
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        onImageSelect(allImages[prevIndex].url);
    };

    // Amazon-style Zoom Logic
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setZoomPos({ x, y, show: true });
    };

    return (
        <div className="flex flex-row gap-8 items-start">
            {/* 1. Left Sidebar Thumbnails */}
            <div className="hidden md:flex flex-col items-center gap-4">
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto scrollbar-none py-1 px-1">
                    {allImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => onImageSelect(img.url)}
                            className={`relative h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${selectedImage === img.url
                                ? 'border-slate-900 shadow-md scale-95'
                                : 'border-slate-100 bg-white hover:border-slate-300'
                                }`}
                        >
                            <Image src={img.url} alt={productTitle} fill className="object-contain p-2" unoptimized />
                        </button>
                    ))}
                </div>
                <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
                    <ChevronDown className="h-6 w-6" />
                </Button>
            </div>

            {/* 2. Main Image Container with Zoom & Nav */}
            <div className="relative flex-1 group">
                <motion.div
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setZoomPos({ ...zoomPos, show: false })}
                    className="relative aspect-square rounded-[40px] overflow-hidden bg-white border border-slate-100 shadow-sm cursor-zoom-in"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="relative w-full h-full"
                        >
                            <Image
                                src={selectedImage}
                                alt={productTitle}
                                fill
                                className={`object-contain p-12 transition-transform duration-200 ease-out ${zoomPos.show ? 'scale-[2.5]' : 'scale-100'
                                    }`}
                                style={
                                    zoomPos.show
                                        ? {
                                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                        }
                                        : undefined
                                }
                                unoptimized
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows (Visible on Hover) */}
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <Button
                            onClick={handlePrev}
                            size="icon"
                            variant="secondary"
                            className="rounded-full shadow-xl bg-white/80 backdrop-blur-sm pointer-events-auto hover:bg-white"
                        >
                            <ChevronLeft className="h-6 w-6 text-slate-700" />
                        </Button>
                        <Button
                            onClick={handleNext}
                            size="icon"
                            variant="secondary"
                            className="rounded-full shadow-xl bg-white/80 backdrop-blur-sm pointer-events-auto hover:bg-white"
                        >
                            <ChevronRight className="h-6 w-6 text-slate-700" />
                        </Button>
                    </div>

                    {/* Floating Action Buttons */}
                    <div className="absolute top-6 right-6 flex flex-col gap-3">
                        <Button size="icon" variant="secondary" className="rounded-full bg-white/90 shadow-sm border border-slate-100">
                            <Heart className="h-5 w-5 text-slate-600" />
                        </Button>
                        <Button size="icon" variant="secondary" className="rounded-full bg-white/90 shadow-sm border border-slate-100">
                            <Share2 className="h-5 w-5 text-slate-600" />
                        </Button>
                    </div>
                </motion.div>

                {/* Mobile/Small Screen Indicator (Optional) */}
                <div className="mt-4 flex justify-center gap-1 md:hidden">
                    {allImages.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all ${currentIndex === i ? 'w-6 bg-slate-900' : 'w-2 bg-slate-200'}`} />
                    ))}
                </div>
                <ProductActions onAddToCart={onAddToCart} disabled={disabled} />
            </div>
        </div>

    )
}