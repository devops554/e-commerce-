"use client"

import React from 'react'
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TopFooter from './TopFooter'

export const Footer = () => {
    return (
        <>
            <TopFooter />
            <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        {/* Brand Section */}
                        <div className="space-y-6">
                            <Link href="/" className="inline-block transform transition-transform hover:scale-105">
                                <h2 className="text-3xl font-black tracking-tighter text-white">
                                    Bivha<span className="text-primary">.</span>
                                </h2>
                            </Link>
                            <p className="text-sm font-medium leading-relaxed text-slate-400">
                                Experience the future of grocery shopping. 10-minute delivery, premium products, and a seamless shopping experience designed for your lifestyle.
                            </p>
                            <div className="flex gap-4">
                                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                                    <Link key={i} href="#" className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
                                        <Icon className="h-5 w-5" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-8">Department</h4>
                            <ul className="space-y-4">
                                {['Fresh Produce', 'Dairy & Eggs', 'Beverages', 'Snacks', 'Household'].map((item) => (
                                    <li key={item}>
                                        <Link href="#" className="text-sm font-bold hover:text-white transition-colors flex items-center gap-2 group">
                                            <div className="h-1 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-8">Support</h4>
                            <ul className="space-y-4">
                                {[
                                    { icon: Phone, text: '+91 800 123 4567' },
                                    { icon: Mail, text: 'support@bivha.com' },
                                    { icon: MapPin, text: 'Silicon Valley, Bangalore, KA' }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold hover:text-white transition-colors cursor-pointer group">
                                        <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-primary transition-colors">
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div className="space-y-6">
                            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-8">Stay Updated</h4>
                            <p className="text-sm font-medium text-slate-400">
                                Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                            </p>
                            <div className="relative group">
                                <Input
                                    placeholder="Enter your email"
                                    className="h-12 bg-slate-800 border-none rounded-xl pl-4 pr-12 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                                <Button size="icon" className="absolute right-1 top-1 h-10 w-10 rounded-lg bg-primary hover:bg-[#E62E5F] text-white">
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            © 2026 BIVHA SHOP. ALL RIGHTS RESERVED.
                        </p>
                        <div className="flex gap-8">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                                <Link key={item} href="#" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}
