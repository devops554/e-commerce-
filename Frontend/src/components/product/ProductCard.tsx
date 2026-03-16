"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';

interface ProductCardProps {
    id: string;
    productId: string;
    variantId: string;
    slug: string;
    title: string;
    brand: string;
    price: number;
    discountPrice: number;
    image: string;
    stock?: number;
    attributes?: { name: string; value: string }[];
    gstRate?: number;
    hsnCode?: string;
}

export const ProductCard = ({
    id,
    productId,
    variantId,
    slug,
    title,
    price,
    discountPrice,
    image,
    stock: initialStock = 0,
    attributes = [],
    gstRate,
    hsnCode,
}: ProductCardProps) => {
    const { addToCart } = useCart();
    const [liveStock, setLiveStock] = useState(initialStock);

    useEffect(() => { setLiveStock(initialStock) }, [initialStock]);

    useSocket('stock.updated', (data) => {
        if (data.variantId === variantId) setLiveStock(data.stock);
    });

    const discountPct = price > 0 && discountPrice > 0
        ? Math.round(((price - discountPrice) / price) * 100)
        : 0;

    const effectivePrice = discountPrice > 0 ? discountPrice : price;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (liveStock <= 0) return;
        addToCart({ id, productId, variantId, title, price: effectivePrice, quantity: 1, image, gstRate, hsnCode });
        toast.success('Added to cart');
    };

    const primaryAttr = attributes.find(a =>
        ['net volume', 'net weight', 'pack size', 'volume', 'weight', 'size', 'pcs', 'tabs']
            .includes(a.name.toLowerCase())
    );

    return (
        // w-full makes the card fill its grid cell completely.
        // h-full + flex flex-col ensures all cards in a row are the same height.
        <Link href={`/product/${slug}`} className="block w-full h-full">
            <Card className="
                group relative w-full h-full
                border border-slate-100 bg-white
                rounded-2xl overflow-hidden
                p-3 shadow-sm hover:shadow-md
                transition-shadow duration-200
                flex flex-col
            ">

                {/* Discount badge */}
                {discountPct > 0 && (
                    <div className="absolute top-0 left-2 z-10">
                        <div className="relative bg-[#2563EB] text-white px-1.5 py-1 flex flex-col items-center justify-center rounded-b-sm shadow-md">
                            <span className="text-[10px] font-black leading-none">{discountPct}%</span>
                            <span className="text-[8px] font-bold uppercase leading-none mt-0.5">OFF</span>
                            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#2563EB] [clip-path:polygon(0%_0%,100%_0%,50%_100%)]" />
                        </div>
                    </div>
                )}

                {/* Image — square aspect ratio, fills full card width */}
                <div className="relative w-full aspect-square bg-white mb-3">
                    {image ? (
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 text-xs font-medium rounded-xl">
                            No image
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                    {/* Title — fixed 2-line height so all cards align */}
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[40px] mb-1">
                        {title}
                    </h3>

                    {/* Attribute / unit */}
                    <p className="text-xs font-medium text-slate-400 mb-3">
                        {primaryAttr?.value || '1 unit'}
                    </p>

                    {/* Price + Add button — pinned to bottom */}
                    <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex flex-col leading-none">
                            <span className="text-sm font-black text-slate-900">
                                ₹{effectivePrice}
                            </span>
                            {discountPrice > 0 && price > discountPrice && (
                                <span className="text-[10px] text-slate-400 line-through mt-0.5">
                                    ₹{price}
                                </span>
                            )}
                        </div>

                        {liveStock > 0 ? (
                            <Button
                                onClick={handleAddToCart}
                                variant="outline"
                                size="sm"
                                className="h-8 px-4 border border-[#318616] text-[#318616] hover:bg-[#318616] hover:text-white bg-white font-bold text-xs uppercase rounded-lg transition-all shrink-0"
                            >
                                Add
                            </Button>
                        ) : (
                            <span className="text-[9px] font-bold text-red-500 uppercase shrink-0">
                                Out of stock
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default ProductCard;