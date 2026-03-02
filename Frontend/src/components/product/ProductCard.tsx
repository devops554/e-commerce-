import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { toast } from 'sonner'

interface ProductCardProps {
    id: string;
    productId: string;  // parent product _id
    variantId: string;  // variant _id
    slug: string;
    title: string;
    brand: string;
    price: number;
    discountPrice: number;
    image: string;
    weight?: string;
    rating: number;
    tag?: string[];
    images?: string[];
    reviewCount: number;
    attributes?: { name: string; value: string }[];
    stock?: number;
}

export const ProductCard = ({
    id,
    productId,
    variantId,
    slug,
    title,
    brand,
    price,
    discountPrice,
    image,
    weight,
    rating,
    reviewCount,
    tag,
    attributes = [],
    stock = 0,
    images = []
}: ProductCardProps) => {
    const { addToCart } = useCart();
    const [currentImage, setCurrentImage] = React.useState(image);

    // Reset current image if the main image prop changes
    React.useEffect(() => {
        setCurrentImage(image);
    }, [image]);

    // Use provided images or fallback to the main image
    const displayImages = images.length > 0 ? images.slice(0, 4) : [image];

    const savings = price - discountPrice;

    const effectivePrice = discountPrice > 0 ? discountPrice : price;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (stock <= 0) return;
        addToCart({
            id,
            productId,
            variantId,
            title,
            price: effectivePrice,
            quantity: 1,
            image
        });
        toast.success(`Added ${title} to cart`);
    };

    // Find primary attribute for display (Net Volume, Net Weight, etc.)
    const primaryAttribute = attributes.find(a =>
        ['net volume', 'net weight', 'pack size', 'volume', 'weight', 'size'].includes(a.name.toLowerCase())
    );

    return (
        <Link href={`/product/${slug}`} className="block h-full group">
            <Card className="w-full max-w-[180px] mx-auto bg-transparent border-none p-0 shadow-none">
                <div className="relative w-full h-[180px] overflow-hidden rounded-xl border border-slate-100 p-2">
                    <Image
                        src={currentImage}
                        alt={title}
                        fill
                        sizes="180px"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        priority={false}
                    />

                    {/* Thumbnail Gallery overlay on hover */}
                    {/* {displayImages.length > 1 && (
                        <div className="absolute inset-x-0 bottom-0 p-2 flex justify-center gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 bg-linear-to-t from-black/20 to-transparent">
                            {displayImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    onMouseEnter={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setCurrentImage(img);
                                    }}
                                    className={`w-8 h-8 rounded-md overflow-hidden border-2 cursor-pointer transition-colors bg-white ${currentImage === img ? 'border-primary' : 'border-transparent hover:border-slate-300'
                                        }`}
                                >
                                    <div className="relative w-full h-full">
                                        <Image src={img} alt={`${title} ${idx}`} fill className="object-cover" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )} */}

                    {/* Custom ADD Button / Stock Status */}
                    <div className="absolute bottom-2 right-2">
                        {stock > 0 ? (
                            <Button
                                onClick={handleAddToCart}
                                variant="outline"
                                className="h-8 w-16 border-2 border-primary text-primary hover:bg-primary hover:text-white text-base font-medium rounded-sm shadow-sm hover:shadow-md transition-all bg-white"
                            >
                                ADD
                            </Button>
                        ) : (
                            <div className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-bold border border-red-100 shadow-sm">
                                OUT OF STOCK
                            </div>
                        )}
                    </div>
                </div>

                <CardContent className="p-3 space-y-2">
                    {/* Pricing Section */}
                    {price > 0 || discountPrice > 0 ? (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="bg-[#329537] text-white px-2 py-0.5 rounded-lg flex items-center justify-center shadow-sm shadow-[#329537]/20">
                                    <span className="text-lg font-black">
                                        ₹{(discountPrice > 0 ? discountPrice : price).toFixed(2)}
                                    </span>
                                </div>
                                {discountPrice > 0 && price > discountPrice && (
                                    <span className="text-sm text-slate-500 line-through decoration-slate-400">
                                        ₹{price.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Savings Tag */}
                            {discountPrice > 0 && price > discountPrice && (
                                <div className="text-[#329537] font-bold text-xs mt-1">
                                    ₹{(price - discountPrice).toFixed(2)} OFF
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-sm font-bold text-slate-400 py-1">
                            Price Unavailable
                        </div>
                    )}

                    <div className="border-t border-dashed border-slate-200 my-1 w-full" />

                    {/* Title and Weight */}
                    <div className="space-y-0.5">
                        {brand && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{brand}</p>}
                        <h3 className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2 min-h-[40px]">
                            {title}
                        </h3>
                        {primaryAttribute && (
                            <p className="text-xs font-bold text-slate-500">{primaryAttribute.value}</p>
                        )}
                    </div>

                    {/* Tag Badge */}
                    {tag && tag.length > 0 && (
                        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                            {tag.map((t, idx) => (
                                <div key={idx} className="whitespace-nowrap bg-[#EDFAFB] text-[#177582] px-1.5 py-0.5 rounded-[2px] text-[10px] font-medium shrink-0">
                                    {t}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-1 pt-0.5">
                        <div className="bg-primary/90 p-0.5 rounded-sm">
                            <Star className="h-2.5 w-2.5 fill-white text-white" />
                        </div>
                        <span className="text-xs font-medium text-primary">{rating}</span>
                        <span className="text-[10px] text-slate-400">({reviewCount})</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export default ProductCard;
