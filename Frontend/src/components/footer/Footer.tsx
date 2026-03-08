"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
    ArrowRight, ShieldCheck, Star, CreditCard,
    Landmark, ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TopFooter from './TopFooter';

import {
    TRUST_ITEMS, BRAND_BADGES, APP_BUTTONS, NAV_COLUMNS,
    CONTACT_ITEMS, SOCIAL_LINKS, PAYMENT_METHODS, SECURITY_CERTS,
    LEGAL_INFO, LEGAL_ADDRESS, BOTTOM_LINKS, COPYRIGHT, BRAND,
} from './Footer.data';

// ─── Animation Variants ───────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Accordion (mobile collapsible) ──────────────────
const FooterAccordion = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 md:border-none">
            <button
                className="w-full flex items-center justify-between py-4 md:py-0 md:cursor-default md:mb-6"
                onClick={() => setOpen(!open)}
            >
                <h4 className="text-slate-900 font-black uppercase tracking-[0.2em] text-[10px]">{title}</h4>
                <ChevronDown size={14} className={`text-slate-400 md:hidden transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 md:max-h-none md:block ${open ? 'max-h-96' : 'max-h-0'}`}>
                <div className="pb-4 md:pb-0">{children}</div>
            </div>
        </div>
    );
};

// ─── App Download Button ──────────────────────────────
const AppDownloadButton = ({ icon, platform, label }: { icon: React.ReactNode; platform: string; label: string }) => (
    <motion.button
        whileHover={{ scale: 1.04, backgroundColor: '#f8fafc' }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm hover:border-slate-300 transition-all"
    >
        <div className="text-[#FF3269]">{icon}</div>
        <div className="text-left">
            <p className="text-[9px] uppercase font-bold text-slate-400 leading-none">{label}</p>
            <p className="text-sm font-bold text-slate-900 leading-tight">{platform}</p>
        </div>
    </motion.button>
);

// ─── Contact Item ─────────────────────────────────────
const ContactItem = ({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) => (
    <a href={href} className="flex items-center gap-3 group justify-center md:justify-start">
        <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#FF3269] group-hover:bg-[#FF3269]/5 group-hover:border-[#FF3269]/20 transition-all flex-shrink-0">
            {icon}
        </div>
        <div className="text-center md:text-left">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight leading-none mb-0.5">{label}</p>
            <p className="text-xs font-bold text-slate-700 group-hover:text-[#FF3269] transition-colors">{value}</p>
        </div>
    </a>
);

// ─── Main Footer ──────────────────────────────────────
export const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = () => {
        if (email.includes('@')) { setSubscribed(true); setEmail(''); }
    };

    return (
        <>
            <TopFooter />

            {/* ── Trust Bar ── */}
            <div className="bg-slate-50 border-y border-slate-100">
                <div className="container mx-auto px-4 lg:px-12 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {TRUST_ITEMS.map(({ icon, title, sub }) => (
                            <div key={title} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 justify-center md:justify-start group">
                                <div className="h-14 w-14 rounded-2xl bg-[#FF3269]/10 flex items-center justify-center text-[#FF3269] flex-shrink-0 group-hover:bg-[#FF3269] group-hover:text-white transition-all duration-300 shadow-sm">
                                    {/* icon size bumped in footer.data.tsx to size={24} */}
                                    {icon}
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-sm font-black text-slate-900 mb-0.5">{title}</p>
                                    <p className="text-xs text-slate-500 leading-snug">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main Footer ── */}
            <footer className="bg-white text-slate-600 pt-14 pb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF3269]/4 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-50 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                <motion.div
                    className="container mx-auto px-4 lg:px-12"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 mb-10">

                        {/* ── Brand Column ── */}
                        <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col items-center md:items-start gap-5 py-6 md:py-0 border-b border-slate-100 md:border-none mb-2 md:mb-0">
                            <Link href={BRAND.href}>
                                <motion.h2 whileHover={{ scale: 1.02 }} className="text-4xl font-black tracking-tighter text-slate-900">
                                    {BRAND.name}<span className="text-[#FF3269]">.</span>
                                </motion.h2>
                            </Link>
                            <p className="text-sm leading-relaxed text-slate-500 text-center md:text-left max-w-xs">
                                {BRAND.tagline}
                            </p>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {BRAND_BADGES.map(({ icon, label }) => (
                                    <span key={label} className="flex items-center gap-1 text-[10px] font-bold text-[#FF3269] bg-[#FF3269]/8 border border-[#FF3269]/20 px-2.5 py-1 rounded-full">
                                        {icon}{label}
                                    </span>
                                ))}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                                </div>
                                <span className="text-xs font-black text-slate-700">{BRAND.rating}</span>
                                <span className="text-xs text-slate-400">({BRAND.reviews} reviews)</span>
                            </div>

                            {/* App Buttons */}
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {APP_BUTTONS.map(({ icon, platform, label }) => (
                                    <AppDownloadButton key={platform} icon={icon} platform={platform} label={label} />
                                ))}
                            </div>
                        </motion.div>

                        {/* ── Nav Link Columns ── */}
                        {NAV_COLUMNS.map(({ title, links }) => (
                            <motion.div key={title} variants={itemVariants} className="lg:col-span-2">
                                <FooterAccordion title={title}>
                                    <ul className="space-y-3 text-center md:text-left">
                                        {links.map(({ label, href }) => (
                                            <li key={label}>
                                                <Link href={href} className="text-sm text-slate-500 hover:text-[#FF3269] font-medium transition-colors duration-200 inline-block">
                                                    {label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </FooterAccordion>
                            </motion.div>
                        ))}

                        {/* ── Contact + Newsletter + Social ── */}
                        <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col items-center md:items-start gap-7 py-6 md:py-0 border-t border-slate-100 md:border-none mt-2 md:mt-0">

                            {/* Contact */}
                            <div className="w-full">
                                <h4 className="text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] mb-5 text-center md:text-left">Get In Touch</h4>
                                <div className="space-y-3">
                                    {CONTACT_ITEMS.map((item) => (
                                        <ContactItem key={item.label} {...item} />
                                    ))}
                                </div>
                            </div>

                            {/* Newsletter */}
                            <div className="w-full">
                                <h4 className="text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] mb-2 text-center md:text-left">Stay in the Loop</h4>
                                <p className="text-xs text-slate-500 mb-3 text-center md:text-left">Secret deals & early launches — straight to your inbox.</p>
                                {subscribed ? (
                                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                                        <ShieldCheck size={15} className="text-green-500" />
                                        <span className="text-sm font-bold text-green-700">You're subscribed!</span>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Input
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                                            placeholder="your@email.com"
                                            className="h-12 bg-slate-50 border-slate-200 rounded-2xl pl-4 pr-14 text-slate-900 placeholder:text-slate-400 text-sm focus:ring-[#FF3269]/20 focus:border-[#FF3269]/40"
                                        />
                                        <Button
                                            onClick={handleSubscribe}
                                            size="icon"
                                            className="absolute right-1.5 top-1.5 h-9 w-9 rounded-xl bg-[#FF3269] hover:bg-[#E62E5F] text-white shadow-md shadow-[#FF3269]/25"
                                        >
                                            <ArrowRight size={15} />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Social */}
                            <div className="w-full">
                                <h4 className="text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] mb-3 text-center md:text-left">Follow Us</h4>
                                <div className="flex gap-2.5 justify-center md:justify-start">
                                    {SOCIAL_LINKS.map(({ Icon, color, label, href }) => (
                                        <motion.a
                                            key={label}
                                            href={href}
                                            whileHover={{ y: -3, scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            title={label}
                                            className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 transition-all"
                                            onMouseEnter={e => {
                                                const el = e.currentTarget as HTMLElement;
                                                el.style.color = color;
                                                el.style.borderColor = color + '40';
                                                el.style.background = color + '10';
                                            }}
                                            onMouseLeave={e => {
                                                const el = e.currentTarget as HTMLElement;
                                                el.style.color = '';
                                                el.style.borderColor = '';
                                                el.style.background = '';
                                            }}
                                        >
                                            <Icon size={16} />
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Payment Methods ── */}
                    {/* <motion.div variants={itemVariants} className="py-6 border-t border-slate-100">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                            <div className="flex flex-col items-center md:items-start gap-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">We Accept</p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {PAYMENT_METHODS.map(method => (
                                        <span key={method} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                                            <CreditCard size={9} className="text-slate-400" />
                                            {method}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col items-center md:items-end gap-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certified & Secure</p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                                    {SECURITY_CERTS.map(cert => (
                                        <span key={cert} className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg">
                                            <ShieldCheck size={9} />
                                            {cert}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div> */}

                    {/* ── Legal ── */}
                    {/* <motion.div variants={itemVariants} className="py-5 border-t border-slate-100">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {LEGAL_INFO.map(({ label }) => (
                                    <span key={label} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                        <Landmark size={9} /> {label}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 text-center md:text-right">{LEGAL_ADDRESS}</p>
                        </div>
                    </motion.div> */}

                    {/* ── Bottom Bar ── */}
                    <motion.div
                        variants={itemVariants}
                        className="pt-5 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4"
                    >
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center md:text-left">
                            {COPYRIGHT}
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {BOTTOM_LINKS.map(({ label, href }) => (
                                <Link key={label} href={href} className="text-[10px] font-bold text-slate-400 hover:text-[#FF3269] transition-colors uppercase tracking-widest whitespace-nowrap">
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </footer>
        </>
    );
};