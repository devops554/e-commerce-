"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import useEmblaCarousel, { UseEmblaCarouselType } from "embla-carousel-react";
import type { EmblaCarouselType, EmblaPluginType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";

// ─── shadcn/ui Carousel (self-contained) ─────────────────────────────────────
interface CarouselContextType {
    emblaRef: UseEmblaCarouselType[0];
    scrollPrev: () => void;
    scrollNext: () => void;
    canScrollPrev: boolean;
    canScrollNext: boolean;
    orientation: "horizontal" | "vertical";
}
const CarouselContext = createContext<CarouselContextType | null>(null);
function useCarousel() {
    const ctx = useContext(CarouselContext);
    if (!ctx) throw new Error("useCarousel must be inside <Carousel>");
    return ctx;
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "horizontal" | "vertical";
    opts?: Record<string, unknown>;
    plugins?: EmblaPluginType[];
    setApi?: (api: unknown) => void;
}
function Carousel({ orientation = "horizontal", opts, plugins, setApi, className, children, ...props }: CarouselProps) {
    const autoplayPlugin = useRef(Autoplay({ delay: 3500, stopOnInteraction: true }));
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { ...opts, axis: orientation === "horizontal" ? "x" : "y", loop: true },
        plugins ?? [autoplayPlugin.current]
    );
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on("reInit", onSelect);
        emblaApi.on("select", onSelect);
        setApi?.(emblaApi);
    }, [emblaApi, onSelect, setApi]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    return (
        <CarouselContext.Provider value={{ emblaRef, scrollPrev, scrollNext, canScrollPrev, canScrollNext, orientation }}>
            <div className={`relative ${className ?? ""}`} {...props}>
                {children}
            </div>
        </CarouselContext.Provider>
    );
}

function CarouselContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const { emblaRef, orientation } = useCarousel();
    return (
        <div ref={emblaRef} className="overflow-hidden">
            <div
                className={`flex ${orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col"} ${className ?? ""}`}
                {...props}
            />
        </div>
    );
}

function CarouselItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const { orientation } = useCarousel();
    return (
        <div
            className={`min-w-0 shrink-0 grow-0 basis-full ${orientation === "horizontal" ? "pl-4" : "pt-4"} ${className ?? ""}`}
            {...props}
        />
    );
}

function CarouselPrevious({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { scrollPrev, canScrollPrev } = useCarousel();
    return (
        <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous"
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-rose-200 shadow-md flex items-center justify-center text-rose-500 hover:bg-rose-50 disabled:opacity-30 transition-all ${className ?? ""}`}
            {...props}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    );
}

function CarouselNext({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { scrollNext, canScrollNext } = useCarousel();
    return (
        <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next"
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-rose-200 shadow-md flex items-center justify-center text-rose-500 hover:bg-rose-50 disabled:opacity-30 transition-all ${className ?? ""}`}
            {...props}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

const testimonials = [
    {
        name: "Riya Sharma",
        role: "Seller Partner",
        img: "https://randomuser.me/api/portraits/women/44.jpg",
        text: "Joining as a seller changed my life. My handmade jewelry now reaches thousands of customers across India. The support team is phenomenal!",
        stars: 5,
    },
    {
        name: "Arjun Mehta",
        role: "Delivery Partner",
        img: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Flexible hours, great payouts, and an amazing app. I earn more than my previous job while choosing my own schedule.",
        stars: 5,
    },
    {
        name: "Priya Nair",
        role: "Seller Partner",
        img: "https://randomuser.me/api/portraits/women/68.jpg",
        text: "The platform helped me scale from a small home kitchen to a full-blown online brand. Truly life-changing opportunity!",
        stars: 5,
    },
    {
        name: "Karan Singh",
        role: "Delivery Partner",
        img: "https://randomuser.me/api/portraits/men/75.jpg",
        text: "Best decision I made. Weekly payments, dedicated support, and a community that genuinely cares about partners.",
        stars: 5,
    },
    {
        name: "Meera Pillai",
        role: "Seller Partner",
        img: "https://randomuser.me/api/portraits/women/12.jpg",
        text: "From zero to 500+ orders a month. The seller dashboard is intuitive and analytics are top-notch!",
        stars: 5,
    },
    {
        name: "Dev Patel",
        role: "Delivery Partner",
        img: "https://randomuser.me/api/portraits/men/54.jpg",
        text: "I cover just my neighborhood and still make a solid income. The route optimization saves so much time.",
        stars: 5,
    },
];

const partnerImages = [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=200&fit=crop",
];

function StarRating({ count }: { count: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: count }).map((_, i) => (
                <svg key={i} className="w-4 h-4 text-rose-400 fill-rose-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function TestimonialCarousel() {
    return (
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent>
                {testimonials.map((t, i) => (
                    <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 h-full flex flex-col justify-between" style={{ minHeight: "220px" }}>
                            <div>
                                <StarRating count={t.stars} />
                                <p className="mt-3 text-rose-900/70 text-sm leading-relaxed font-light italic">
                                    "{t.text}"
                                </p>
                            </div>
                            <div className="flex items-center gap-3 mt-5">
                                <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-200" />
                                <div>
                                    <p className="text-rose-900 font-semibold text-sm">{t.name}</p>
                                    <p className="text-rose-400 text-xs">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
}

function ImageCarousel() {
    return (
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent>
                {partnerImages.map((src, i) => (
                    <CarouselItem key={i} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                        <img
                            src={src}
                            alt="partner"
                            className="w-full h-36 object-cover rounded-2xl shadow-sm opacity-90 hover:opacity-100 transition-opacity"
                        />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
}

export default function PartnerWithUs() {
    const [activeCard, setActiveCard] = useState<"seller" | "delivery" | null>(null);
    const router = useRouter();

    return (
        <div
            className="min-h-screen"
            style={{
                background: "linear-gradient(160deg, #fff0f3 0%, #ffe4ec 40%, #ffd6e7 100%)",
                fontFamily: "'Georgia', 'Times New Roman', serif",
            }}
        >
            {/* HERO */}
            <section className="max-w-7xl mx-auto px-8 pt-16 pb-20 text-center">
                <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-rose-200 rounded-full px-4 py-1.5 text-rose-600 text-xs font-medium mb-6 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    Now accepting partners across India
                </div>
                <h1 className="text-5xl md:text-7xl text-rose-900 leading-tight mb-6" style={{ letterSpacing: "-1.5px" }}>
                    Grow Together,<br />
                    <span className="text-rose-400">Thrive Together</span>
                </h1>
                <p className="max-w-2xl mx-auto text-rose-800/60 text-lg leading-relaxed mb-10 font-light">
                    BloomMart is India's fastest-growing community marketplace. Whether you sell unique
                    products or love delivering smiles — there's a place for you in our ecosystem.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => router.push("/seller/login")} className="bg-rose-400 hover:bg-rose-500 text-white px-8 py-3.5 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all">
                        Join as Partner →
                    </button>
                    <button onClick={() => router.push("/partner-with-us#opportunities")} className="bg-white/80 hover:bg-white text-rose-700 px-8 py-3.5 rounded-full text-sm font-medium border border-rose-200 transition-all">
                        Learn More
                    </button>
                </div>
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                    {[
                        { n: "2.4M+", l: "Happy Customers" },
                        { n: "85K+", l: "Active Sellers" },
                        { n: "12K+", l: "Delivery Partners" },
                        { n: "420+", l: "Cities Covered" },
                    ].map((s) => (
                        <div key={s.l} className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-rose-100">
                            <p className="text-3xl font-bold text-rose-500">{s.n}</p>
                            <p className="text-rose-700/60 text-xs mt-1">{s.l}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ABOUT COMPANY */}
            <section className="max-w-7xl mx-auto px-8 py-16">
                <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-10 md:p-14 border border-rose-100 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <p className="text-rose-400 text-xs font-semibold uppercase tracking-widest mb-3">About BloomMart</p>
                        <h2 className="text-4xl text-rose-900 leading-tight mb-6">
                            We're building the future of community commerce
                        </h2>
                        <p className="text-rose-800/60 leading-relaxed mb-4 font-light">
                            Founded in 2021, BloomMart started with a simple belief: every person with talent or
                            drive deserves a platform to succeed. We've grown from a small team in Bengaluru to a
                            nationwide network connecting buyers, sellers, and delivery heroes.
                        </p>
                        <p className="text-rose-800/60 leading-relaxed font-light">
                            Our technology empowers micro-entrepreneurs — from home bakers to artisan craftspeople —
                            while giving delivery partners the freedom and income they deserve. We're not just a
                            marketplace; we're a movement.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: "🌸", title: "Community First", desc: "Every decision puts our partner community at the center." },
                            { icon: "⚡", title: "Fast Growth", desc: "Partners see 3x revenue growth within the first 6 months." },
                            { icon: "🤝", title: "Full Support", desc: "Dedicated account managers for every partner tier." },
                            { icon: "📱", title: "Smart Tech", desc: "AI-powered tools to manage orders, routes, and analytics." },
                        ].map((item) => (
                            <div key={item.title} className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm">
                                <span className="text-2xl">{item.icon}</span>
                                <p className="text-rose-900 font-semibold text-sm mt-2 mb-1">{item.title}</p>
                                <p className="text-rose-700/50 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* OPPORTUNITIES */}
            <section id="opportunities" className="max-w-7xl mx-auto px-8 py-10">
                <div className="text-center mb-12">
                    <p className="text-rose-400 text-xs font-semibold uppercase tracking-widest mb-2">Opportunities</p>
                    <h2 className="text-4xl text-rose-900">Choose Your Path to Growth</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Seller */}
                    <div
                        className={`relative rounded-3xl p-8 border cursor-pointer transition-all duration-300 overflow-hidden ${activeCard === "seller" ? "border-rose-400 bg-rose-50 shadow-xl scale-[1.02]" : "border-rose-100 bg-white/70 hover:shadow-lg hover:scale-[1.01]"}`}
                        onClick={() => setActiveCard(activeCard === "seller" ? null : "seller")}
                    >
                        <div className="absolute -top-6 -right-6 w-28 h-28 bg-rose-100 rounded-full opacity-50" />
                        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-2xl mb-5">🛍️</div>
                        <h3 className="text-2xl text-rose-900 font-bold mb-2">Become a Seller</h3>
                        <p className="text-rose-700/60 text-sm leading-relaxed mb-5 font-light">
                            List your products and reach millions of customers. From handmade goods to bulk items —
                            your store, your rules. Zero listing fees to start.
                        </p>
                        <ul className="space-y-2 mb-6">
                            {["Free storefront setup", "Real-time sales dashboard", "Marketing & SEO tools", "Dedicated seller support"].map((f) => (
                                <li key={f} className="flex items-center gap-2 text-rose-700/70 text-sm">
                                    <span className="w-4 h-4 rounded-full bg-rose-200 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-2.5 h-2.5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={(e) => { e.stopPropagation(); router.push("/seller/login"); }}
                            className="w-full bg-rose-400 hover:bg-rose-500 text-white py-3 rounded-2xl text-sm font-medium transition-colors shadow-sm"
                        >
                            Start Selling Today →
                        </button>
                    </div>

                    {/* Delivery */}
                    <div
                        className={`relative rounded-3xl p-8 border cursor-pointer transition-all duration-300 overflow-hidden ${activeCard === "delivery" ? "border-rose-400 bg-rose-50 shadow-xl scale-[1.02]" : "border-rose-100 bg-white/70 hover:shadow-lg hover:scale-[1.01]"}`}
                        onClick={() => setActiveCard(activeCard === "delivery" ? null : "delivery")}
                    >
                        <div className="absolute -top-6 -right-6 w-28 h-28 bg-pink-100 rounded-full opacity-50" />
                        <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-2xl mb-5">🚴</div>
                        <h3 className="text-2xl text-rose-900 font-bold mb-2">Delivery Partner</h3>
                        <p className="text-rose-700/60 text-sm leading-relaxed mb-5 font-light">
                            Deliver happiness on your schedule. Earn competitive pay per delivery with weekly
                            payouts and performance bonuses. Be your own boss.
                        </p>
                        <ul className="space-y-2 mb-6">
                            {["Flexible working hours", "Weekly guaranteed payouts", "Fuel & insurance benefits", "24/7 rider support line"].map((f) => (
                                <li key={f} className="flex items-center gap-2 text-rose-700/70 text-sm">
                                    <span className="w-4 h-4 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-2.5 h-2.5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={(e) => { e.stopPropagation(); router.push("/delivery-signup"); }}
                            className="w-full bg-rose-400 hover:bg-rose-500 text-white py-3 rounded-2xl text-sm font-medium transition-colors shadow-sm"
                        >
                            Join as Rider →
                        </button>
                    </div>
                </div>
            </section>

            {/* IMAGE CAROUSEL */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-8 mb-6">
                    <p className="text-rose-400 text-xs font-semibold uppercase tracking-widest mb-1">Our Community</p>
                    <h3 className="text-2xl text-rose-900">Partners at work across India</h3>
                </div>
                <div className="max-w-7xl mx-auto px-10">
                    <ImageCarousel />
                </div>
            </section>

            {/* TESTIMONIALS CAROUSEL */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-8 mb-8 text-center">
                    <p className="text-rose-400 text-xs font-semibold uppercase tracking-widest mb-2">Testimonials</p>
                    <h2 className="text-4xl text-rose-900">Hear from Our Partners</h2>
                    <p className="text-rose-700/50 text-sm mt-2 font-light">Real stories from real people in our community</p>
                </div>
                <div className="max-w-7xl mx-auto px-10">
                    <TestimonialCarousel />
                </div>
            </section>

            {/* MORE ABOUT COMPANY */}
            <section className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white/60 backdrop-blur-sm rounded-3xl p-10 border border-rose-100">
                        <p className="text-rose-400 text-xs font-semibold uppercase tracking-widest mb-3">More About Us</p>
                        <h2 className="text-3xl text-rose-900 mb-5">A company built on trust & inclusion</h2>
                        <p className="text-rose-800/60 leading-relaxed font-light mb-4">
                            BloomMart believes commerce should be accessible to everyone. Our platform is designed
                            with rural entrepreneurs, urban hustlers, and everyday delivery heroes in mind. We
                            provide the infrastructure so you can focus on what you do best.
                        </p>
                        <p className="text-rose-800/60 leading-relaxed font-light mb-4">
                            With operations in 420+ cities and partnerships with 50+ logistics companies, we've
                            built a seamless experience from listing to last-mile delivery. Our proprietary AI
                            matches products to the right buyers, increasing average seller revenue by 40%.
                        </p>
                        <p className="text-rose-800/60 leading-relaxed font-light">
                            We are Series B funded and backed by India's leading venture firms. In 2024, we were
                            recognized as one of India's Top 10 Startups by Economic Times. Our mission: a million
                            livelihoods by 2027.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        {[
                            { label: "Year Founded", value: "2021", icon: "🏢" },
                            { label: "Total Funding", value: "₹420 Cr", icon: "💰" },
                            { label: "Partner Satisfaction", value: "4.9 / 5", icon: "⭐" },
                            { label: "Orders Delivered", value: "18M+", icon: "📦" },
                        ].map((item) => (
                            <div key={item.label} className="bg-white/70 rounded-2xl p-5 border border-rose-100 flex items-center gap-4">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <p className="text-rose-500/60 text-xs">{item.label}</p>
                                    <p className="text-rose-900 font-bold text-xl">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA BANNER */}
            <section className="max-w-7xl mx-auto px-8 pb-20">
                <div className="bg-rose-400 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-4 left-8 w-24 h-24 rounded-full bg-white" />
                        <div className="absolute bottom-4 right-8 w-36 h-36 rounded-full bg-white" />
                        <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white" />
                    </div>
                    <p className="text-rose-100 text-xs font-semibold uppercase tracking-widest mb-3">Ready to Begin?</p>
                    <h2 className="text-4xl font-bold mb-4">Your growth story starts here</h2>
                    <p className="text-rose-100 text-sm mb-8 max-w-lg mx-auto font-light">
                        Join over 97,000 partners who've already transformed their lives with BloomMart.
                        Application takes less than 5 minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={(e) => { e.stopPropagation(); router.push("/seller/login"); }} className="bg-white text-rose-500 hover:bg-rose-50 px-8 py-3.5 rounded-full text-sm font-semibold transition-colors shadow-md">
                            Apply as Seller →
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-3.5 rounded-full text-sm font-medium border border-white/40 transition-colors">
                            Become a Rider →
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}