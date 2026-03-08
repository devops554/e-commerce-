"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, ShoppingCart, ArrowLeft, RefreshCw } from 'lucide-react';

// Floating grocery emoji items
const FLOATING_ITEMS = [
    { emoji: '🥦', x: 8, y: 15, size: 38, delay: 0, duration: 6 },
    { emoji: '🍎', x: 88, y: 10, size: 44, delay: 0.8, duration: 7 },
    { emoji: '🥛', x: 5, y: 60, size: 36, delay: 1.5, duration: 5.5 },
    { emoji: '🍋', x: 92, y: 55, size: 40, delay: 0.3, duration: 6.5 },
    { emoji: '🥕', x: 15, y: 82, size: 34, delay: 2, duration: 7.5 },
    { emoji: '🍇', x: 82, y: 78, size: 42, delay: 1.2, duration: 5 },
    { emoji: '🧀', x: 50, y: 5, size: 36, delay: 0.6, duration: 8 },
    { emoji: '🍓', x: 75, y: 30, size: 30, delay: 2.5, duration: 6 },
    { emoji: '🥚', x: 25, y: 25, size: 28, delay: 1.8, duration: 7 },
    { emoji: '🧅', x: 60, y: 88, size: 32, delay: 0.4, duration: 5.5 },
];

const QUICK_LINKS = [
    { label: 'Fresh Produce', href: '/category/fresh', emoji: '🥬' },
    { label: 'Dairy & Eggs', href: '/category/dairy', emoji: '🥛' },
    { label: 'Snacks', href: '/category/snacks', emoji: '🍿' },
    { label: 'Beverages', href: '/category/beverages', emoji: '🧃' },
];

export default function NotFoundPage() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
        };
        window.addEventListener('mousemove', handle);
        return () => window.removeEventListener('mousemove', handle);
    }, []);

    return (
        <div
            className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-20"
            style={{
                background: 'linear-gradient(135deg, #fff5f8 0%, #ffffff 45%, #fff0f5 100%)',
                fontFamily: "'Nunito', sans-serif",
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Righteous&display=swap');

                @keyframes floatY {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-18px) rotate(6deg); }
                }
                @keyframes floatY2 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-22px) rotate(-5deg); }
                }
                @keyframes spin404 {
                    0%   { transform: rotate(-3deg) scale(1); }
                    50%  { transform: rotate(3deg) scale(1.02); }
                    100% { transform: rotate(-3deg) scale(1); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.3; }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .float-item { animation: floatY var(--dur, 6s) ease-in-out infinite; animation-delay: var(--delay, 0s); }
                .float-item:nth-child(even) { animation-name: floatY2; }
                .num-404 { animation: spin404 4s ease-in-out infinite; font-family: 'Righteous', cursive; }
                .dot-blink { animation: blink 1.2s ease-in-out infinite; }
                .fade-up { animation: fadeUp 0.7s ease-out forwards; opacity: 0; }
                .fade-up-1 { animation-delay: 0.1s; }
                .fade-up-2 { animation-delay: 0.25s; }
                .fade-up-3 { animation-delay: 0.4s; }
                .fade-up-4 { animation-delay: 0.55s; }
                .fade-up-5 { animation-delay: 0.7s; }
            `}</style>

            {/* Parallax background blobs */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -12}px)`,
                    transition: 'transform 0.15s ease-out',
                }}
            >
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,50,105,0.07)', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,50,105,0.05)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', top: '40%', right: '20%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(251,191,36,0.06)', filter: 'blur(50px)' }} />
            </div>

            {/* Floating grocery items */}
            {FLOATING_ITEMS.map(({ emoji, x, y, size, delay, duration }) => (
                <div
                    key={emoji + x}
                    className="float-item"
                    style={{
                        position: 'absolute',
                        left: `${x}%`,
                        top: `${y}%`,
                        fontSize: size,
                        '--delay': `${delay}s`,
                        '--dur': `${duration}s`,
                        opacity: 0.55,
                        userSelect: 'none',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))',
                    } as React.CSSProperties}
                >
                    {emoji}
                </div>
            ))}

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

                {/* Cart illustration */}
                <div className="fade-up fade-up-1 mb-4">
                    <div style={{
                        width: 90, height: 90,
                        borderRadius: '28px',
                        background: 'linear-gradient(135deg, #FF3269 0%, #ff6b9d 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 20px 60px rgba(255,50,105,0.35)',
                        margin: '0 auto',
                    }}>
                        <span style={{ fontSize: 44 }}>🛒</span>
                    </div>
                </div>

                {/* 404 number */}
                <div className="fade-up fade-up-2 num-404 mb-2" style={{
                    fontSize: 'clamp(90px, 22vw, 160px)',
                    fontWeight: 900,
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #FF3269 0%, #ff8fb3 50%, #FF3269 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-4px',
                    filter: 'drop-shadow(0 8px 24px rgba(255,50,105,0.2))',
                }}>
                    4<span className="dot-blink" style={{ WebkitTextFillColor: '#FF3269' }}>0</span>4
                </div>

                {/* Heading */}
                <h1 className="fade-up fade-up-2 mb-3" style={{
                    fontSize: 'clamp(20px, 5vw, 30px)',
                    fontWeight: 900,
                    color: '#1e293b',
                    lineHeight: 1.2,
                }}>
                    Oops! This aisle doesn't exist 🛍️
                </h1>

                {/* Sub text */}
                <p className="fade-up fade-up-3 mb-8" style={{
                    fontSize: 15,
                    color: '#64748b',
                    lineHeight: 1.7,
                    maxWidth: 360,
                }}>
                    Looks like this page went out of stock. Don't worry — your cart is safe and we'll get you back on track!
                </p>

                {/* CTA Buttons */}
                <div className="fade-up fade-up-4 flex flex-wrap gap-3 justify-center mb-10">
                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'linear-gradient(135deg, #FF3269 0%, #e8215a 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '13px 26px',
                                borderRadius: 16,
                                fontWeight: 800,
                                fontSize: 14,
                                cursor: 'pointer',
                                boxShadow: '0 8px 24px rgba(255,50,105,0.35)',
                                fontFamily: 'inherit',
                            }}
                        >
                            <Home size={17} /> Go to Homepage
                        </motion.button>
                    </Link>

                    <Link href="/search">
                        <motion.button
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'white',
                                color: '#FF3269',
                                border: '2px solid #FF3269',
                                padding: '13px 26px',
                                borderRadius: 16,
                                fontWeight: 800,
                                fontSize: 14,
                                cursor: 'pointer',
                                boxShadow: '0 4px 16px rgba(255,50,105,0.1)',
                                fontFamily: 'inherit',
                            }}
                        >
                            <Search size={17} /> Search Products
                        </motion.button>
                    </Link>
                </div>

                {/* Divider */}
                <div className="fade-up fade-up-4 w-full flex items-center gap-4 mb-8">
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #e2e8f0)' }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
                        Or explore categories
                    </span>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #e2e8f0)' }} />
                </div>

                {/* Quick category links */}
                <div className="fade-up fade-up-5 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                    {QUICK_LINKS.map(({ label, href, emoji }) => (
                        <Link key={label} href={href}>
                            <motion.div
                                whileHover={{ scale: 1.06, y: -3 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    background: 'white',
                                    border: '1.5px solid #f1f5f9',
                                    borderRadius: 16,
                                    padding: '14px 10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 6,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#FF3269';
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(255,50,105,0.15)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9';
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
                                }}
                            >
                                <span style={{ fontSize: 28 }}>{emoji}</span>
                                <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', textAlign: 'center' }}>{label}</span>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Back link */}
                <div className="fade-up fade-up-5 mt-8">
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#94a3b8', fontSize: 13, fontWeight: 700,
                            fontFamily: 'inherit',
                        }}
                    >
                        <ArrowLeft size={14} /> Go back to previous page
                    </button>
                </div>
            </div>
        </div>
    );
}