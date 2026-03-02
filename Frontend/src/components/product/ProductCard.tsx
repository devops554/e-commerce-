"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
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
    stock = 0,
    attributes = [],
}: ProductCardProps) => {
    const { addToCart } = useCart();

    // Calculate Discount Percentage
    const discountPercentage = price > 0 && discountPrice > 0
        ? Math.round(((price - discountPrice) / price) * 100)
        : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (stock <= 0) return;
        addToCart({
            id,
            productId,
            variantId,
            title,
            price: discountPrice > 0 ? discountPrice : price,
            quantity: 1,
            image
        });
        toast.success(`Added to cart`);
    };


    const primaryAttribute = attributes.find(a =>
        ['net volume', 'net weight', 'pack size', 'volume', 'weight', 'size', 'pcs', 'tabs'].includes(a.name.toLowerCase())
    );

    return (
        <Link href={`/product/${slug}`} className="block h-full">
            <Card className="group relative h-full w-full max-w-[190px] border border-slate-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden flex flex-col">

                {/* Discount Badge Overlay */}
                {discountPercentage > 0 && (
                    <div className="absolute top-0 left-2 z-10">
                        <div className="relative bg-[#2563EB] text-white px-1.5 py-1 flex flex-col items-center justify-center rounded-b-sm shadow-md">
                            <span className="text-[10px] font-black leading-none">{discountPercentage}%</span>
                            <span className="text-[8px] font-bold uppercase leading-none mt-0.5">OFF</span>
                            {/* Ribbon Bottom Cutout Effect */}
                            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#2563EB] [clip-path:polygon(0%_0%,100%_0%,50%_100%)]"></div>
                        </div>
                    </div>
                )}

                {/* Image Container */}
                <div className="relative aspect-square w-full mb-3 flex items-center justify-center bg-white">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        sizes="160px"
                    />
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-grow">

                    {/* ETA Badge */}
                    <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
                            <Timer className="w-3 h-3 text-slate-600" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">9 Mins</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 leading-[1.2] line-clamp-2 mb-1 min-h-[34px]">
                        {title}
                    </h3>

                    {/* Weight/Attribute */}
                    <p className="text-xs font-medium text-slate-500 mb-4">
                        {primaryAttribute?.value || "1 unit"}
                    </p>

                    {/* Footer: Price & Add Button */}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">
                                ₹{discountPrice > 0 ? discountPrice : price}
                            </span>
                            {discountPrice > 0 && price > discountPrice && (
                                <span className="text-[10px] text-slate-400 line-through">
                                    ₹{price}
                                </span>
                            )}
                        </div>

                        {stock > 0 ? (
                            <Button
                                onClick={handleAddToCart}
                                variant="outline"
                                className="h-8 px-4 border border-[#318616] text-[#318616] hover:bg-[#318616] hover:text-white bg-white font-bold text-xs uppercase rounded-lg transition-all shadow-sm active:scale-95"
                            >
                                Add
                            </Button>
                        ) : (
                            <span className="text-[9px] font-bold text-red-500 uppercase">Out of Stock</span>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default ProductCard;