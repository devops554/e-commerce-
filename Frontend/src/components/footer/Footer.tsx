"use client";

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight, AppWindow, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TopFooter from './TopFooter';

// Animation Variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const Footer = () => {
    return (
        <>
            <TopFooter />
            <footer className="bg-white text-slate-600 pt-24 pb-12 relative overflow-hidden border-t border-slate-100">
                {/* Soft Pink Glow Accent */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF3269]/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />

                <motion.div
                    className="container mx-auto px-4 lg:px-12"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">

                        {/* Brand & App Section */}
                        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">
                            <Link href="/">
                                <motion.h2
                                    whileHover={{ scale: 1.02 }}
                                    className="text-4xl font-black tracking-tighter text-slate-900"
                                >
                                    Bivha<span className="text-[#FF3269]">.</span>
                                </motion.h2>
                            </Link>
                            <p className="text-base leading-relaxed max-w-sm text-slate-500">
                                Freshness delivered in 10 minutes. Join the revolution of instant, premium grocery shopping designed for your busy life.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <AppDownloadButton icon={<AppWindow size={20} />} platform="App Store" label="Download on" />
                                <AppDownloadButton icon={<Play size={20} fill="currentColor" />} platform="Google Play" label="Get it on" />
                            </div>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div variants={itemVariants} className="lg:col-span-2">
                            <h4 className="text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] mb-8">Shop</h4>
                            <ul className="space-y-4">
                                {['Fresh Produce', 'Dairy & Eggs', 'Beverages', 'Snacks', 'Household'].map((item) => (
                                    <li key={item}>
                                        <Link href="#" className="text-sm font-bold hover:text-[#FF3269] transition-all hover:pl-1 duration-300 block text-slate-600">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div variants={itemVariants} className="lg:col-span-3">
                            <h4 className="text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] mb-8">Contact</h4>
                            <div className="space-y-6">
                                <ContactItem icon={<Phone size={18} />} label="Call Us" value="+91 800 123 4567" />
                                <ContactItem icon={<Mail size={18} />} label="Email" value="support@bivha.com" />
                            </div>
                        </motion.div>

                        {/* Newsletter */}
                        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
                            <h4 className="text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] mb-8">Stay in Loop</h4>
                            <p className="text-sm text-slate-500">Get secret deals and early access to new launches.</p>
                            <div className="relative">
                                <Input
                                    placeholder="email@example.com"
                                    className="h-14 bg-slate-50 border-slate-200 rounded-2xl pl-5 pr-14 text-slate-900 placeholder:text-slate-400 focus:ring-[#FF3269]/20 focus:border-[#FF3269]/30"
                                />
                                <Button size="icon" className="absolute right-1.5 top-1.5 h-11 w-11 rounded-xl bg-[#FF3269] hover:bg-[#E62E5F] text-white transition-all shadow-md shadow-[#FF3269]/20">
                                    <ArrowRight size={20} />
                                </Button>
                            </div>
                            <div className="flex gap-4">
                                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                                    <motion.a
                                        key={i}
                                        href="#"
                                        whileHover={{ y: -3, color: '#FF3269' }}
                                        className="text-slate-400 transition-colors"
                                    >
                                        <Icon size={20} />
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Footer Bottom */}
                    <motion.div
                        variants={itemVariants}
                        className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6"
                    >
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            © 2026 BIVHA TECHNOLOGY. ALL RIGHTS RESERVED.
                        </p>
                        <div className="flex gap-8">
                            {['Privacy', 'Terms', 'Security'].map((link) => (
                                <Link key={link} href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                                    {link}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </footer>
        </>
    );
};

// Helper Components
const AppDownloadButton = ({ icon, platform, label }: any) => (
    <motion.button
        whileHover={{ scale: 1.05, backgroundColor: '#f8fafc' }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-all hover:border-slate-300 shadow-sm"
    >
        <div className="text-[#FF3269]">{icon}</div>
        <div className="text-left">
            <p className="text-[9px] uppercase font-bold text-slate-400 leading-none">{label}</p>
            <p className="text-sm font-bold text-slate-900">{platform}</p>
        </div>
    </motion.button>
);

const ContactItem = ({ icon, label, value }: any) => (
    <div className="flex gap-4 group cursor-pointer">
        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:text-[#FF3269] group-hover:border-[#FF3269]/20 group-hover:bg-[#FF3269]/5 transition-all">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
            <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{value}</p>
        </div>
    </div>
);