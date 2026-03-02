"use client";

import React, { useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { usePublicBanners } from "@/hooks/useBanner";
import { Banner, BANNER_TYPE, BannerType } from "@/services/banner.service";

const CARD_COLORS = [
    "bg-blue-600",
    "bg-indigo-700",
    "bg-slate-900",
    "bg-emerald-700",
    "bg-purple-700",
    "bg-rose-700",
];

export const DynamicBanner = ({ type }: { type: BannerType }) => {
    const { data: banners = [], isLoading: loading } = usePublicBanners(type);

    const autoplayOptions = {
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true
    };

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: "start",
            skipSnaps: false
        },
        [Autoplay(autoplayOptions)]
    );

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    // SEO: JSON-LD for Promotions
    const bannerSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Featured Promotions",
        "itemListElement": banners.map((banner: Banner, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "CreativeWork",
                "name": banner.title,
                "description": banner.description,
                "image": banner.backgroundImage,
                "url": banner.primaryButton?.link || "#"
            }
        }))
    };

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader /></div>;
    if (banners.length === 0) return null;

    return (
        <section className="relative w-full bg-white py-10 group/section select-none">
            <div className="container mx-auto px-4 relative">

                {/* Navigation Buttons - Show if more than 2 banners */}
                {banners.length > 2 && (
                    <>
                        <button
                            onClick={scrollPrev}
                            className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white rounded-full shadow-lg border hover:bg-slate-50 transition-all opacity-0 group-hover/section:opacity-100 hidden md:flex"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white rounded-full shadow-lg border hover:bg-slate-50 transition-all opacity-0 group-hover/section:opacity-100 hidden md:flex"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex -ml-4">
                        {banners.map((banner: Banner, idx: number) => (
                            <div
                                key={banner._id}
                                // MOBILE: 100% (1 card)
                                // TABLET/DESKTOP: 50% (2 cards)
                                className="flex-[0_0_100%] md:flex-[0_0_50%] min-w-0 pl-4"
                            >
                                <BannerCard
                                    banner={banner}
                                    colorClass={CARD_COLORS[idx % CARD_COLORS.length]}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const BannerCard = ({ banner, colorClass }: { banner: Banner; colorClass: string }) => {
    return (
        <div className={`relative min-h-[320px] rounded-[2rem] overflow-hidden p-8 flex flex-col justify-between transition-all duration-500 hover:shadow-2xl h-full group/card ${colorClass}`}>

            {/* Background Image / Graphic */}
            <div className="absolute top-0 right-0 w-full h-full opacity-40 pointer-events-none transition-transform duration-700 group-hover/card:scale-110">
                {banner.backgroundImage ? (
                    <Image
                        src={banner.backgroundImage}
                        alt={banner.title || "Banner Background"}
                        fill
                        className="object-cover"
                        style={{ maskImage: 'linear-gradient(to left, rgba(0,0,0,1), transparent)' }}
                        priority={false}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
                )}
            </div>

            <article className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                    {banner.subtitle || "Trending"}
                </span>
                <h3 className="text-white text-xl md:text-2xl font-bold leading-tight mb-4">
                    {banner.title}
                </h3>
                <p className="text-white/80 text-sm mb-6 line-clamp-2">
                    {banner.description}
                </p>

                <Link
                    href={banner.primaryButton?.link || "#"}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:gap-4 transition-all focus:ring-2 focus:ring-white/50"
                >
                    {banner.primaryButton?.text || "View Details"}
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </article>

            {banner.stats && banner.stats[0] && (
                <div className="relative z-10 mt-4 flex items-baseline gap-2 bg-black/10 self-start px-3 py-1 rounded-lg">
                    <span className="text-white/60 text-[10px] font-medium uppercase">{banner.stats[0].label}:</span>
                    <span className="text-white text-xs font-bold">{banner.stats[0].value}</span>
                </div>
            )}
        </div>
    );
};


export const Banners = ({ type }: { type: BannerType }) => {
    return <DynamicBanner type={type} />;
};

export default Banners;

const Loader = () => (
    <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
        ))}
    </div>
);
