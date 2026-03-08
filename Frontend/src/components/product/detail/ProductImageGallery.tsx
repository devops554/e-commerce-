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

    // Touch swipe state
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);

    const currentIndex = allImages.findIndex(img => img.url === selectedImage);

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % allImages.length;
        onImageSelect(allImages[nextIndex].url);
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        onImageSelect(allImages[prevIndex].url);
    };

    // Zoom — only desktop (pointer: fine)
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setZoomPos({ x, y, show: true });
    };

    // Touch swipe handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        // Only swipe if horizontal movement is dominant
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
            dx < 0 ? handleNext() : handlePrev();
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">

            {/* ── Desktop: Left Sidebar Thumbnails ── */}
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

            {/* ── Main Column ── */}
            <div className="flex-1 w-full">

                {/* ── Mobile: Horizontal thumbnail scroll strip ── */}
                <div className="flex md:hidden gap-2 overflow-x-auto scrollbar-none pb-2 px-1 mb-3 snap-x snap-mandatory">
                    {allImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => onImageSelect(img.url)}
                            className={`relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden border-2 snap-start transition-all duration-200 ${selectedImage === img.url
                                ? 'border-slate-900 shadow-md scale-95'
                                : 'border-slate-100 bg-white'
                                }`}
                        >
                            <Image src={img.url} alt={productTitle} fill className="object-contain p-1.5" unoptimized />
                        </button>
                    ))}
                </div>

                {/* ── Main Image Container ── */}
                <div className="relative group">
                    <motion.div
                        ref={containerRef}
                        // Zoom only on desktop hover
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setZoomPos({ ...zoomPos, show: false })}
                        // Swipe on mobile
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        className="relative aspect-square rounded-[32px] md:rounded-[40px] overflow-hidden bg-white border border-slate-100 shadow-sm md:cursor-zoom-in touch-pan-y"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedImage}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src={selectedImage}
                                    alt={productTitle}
                                    fill
                                    // Only scale/zoom on desktop (zoomPos.show is only set via mouse)
                                    className={`object-contain p-8 md:p-12 transition-transform duration-200 ease-out ${zoomPos.show ? 'scale-[2.5]' : 'scale-100'}`}
                                    style={
                                        zoomPos.show
                                            ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                                            : undefined
                                    }
                                    unoptimized
                                    draggable={false}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Nav Arrows — desktop hover only */}
                        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 hidden md:flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <Button onClick={handlePrev} size="icon" variant="secondary"
                                className="rounded-full shadow-xl bg-white/80 backdrop-blur-sm pointer-events-auto hover:bg-white">
                                <ChevronLeft className="h-6 w-6 text-slate-700" />
                            </Button>
                            <Button onClick={handleNext} size="icon" variant="secondary"
                                className="rounded-full shadow-xl bg-white/80 backdrop-blur-sm pointer-events-auto hover:bg-white">
                                <ChevronRight className="h-6 w-6 text-slate-700" />
                            </Button>
                        </div>

                        {/* Mobile tap-zone arrows (subtle, always visible) */}
                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex md:hidden justify-between items-center pointer-events-none">
                            <Button onClick={handlePrev} size="icon" variant="secondary"
                                className="rounded-full shadow-md bg-white/70 backdrop-blur-sm pointer-events-auto h-8 w-8">
                                <ChevronLeft className="h-4 w-4 text-slate-600" />
                            </Button>
                            <Button onClick={handleNext} size="icon" variant="secondary"
                                className="rounded-full shadow-md bg-white/70 backdrop-blur-sm pointer-events-auto h-8 w-8">
                                <ChevronRight className="h-4 w-4 text-slate-600" />
                            </Button>
                        </div>

                        {/* Floating Action Buttons */}
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex flex-col gap-2 md:gap-3">
                            <Button size="icon" variant="secondary" className="rounded-full bg-white/90 shadow-sm border border-slate-100 h-8 w-8 md:h-10 md:w-10">
                                <Heart className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                            </Button>
                            <Button size="icon" variant="secondary" className="rounded-full bg-white/90 shadow-sm border border-slate-100 h-8 w-8 md:h-10 md:w-10">
                                <Share2 className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                            </Button>
                        </div>
                    </motion.div>

                    {/* Mobile dot indicators */}
                    <div className="mt-3 flex justify-center gap-1.5 md:hidden">
                        {allImages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => onImageSelect(allImages[i].url)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-6 bg-slate-900' : 'w-2 bg-slate-300'}`}
                            />
                        ))}
                    </div>
                </div>

                <ProductActions onAddToCart={onAddToCart} disabled={disabled} />
            </div>
        </div>
    )
}