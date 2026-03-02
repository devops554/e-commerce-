"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, ShoppingCart, Truck, ArrowRight } from "lucide-react";

const steps = [
    {
        title: "Open the app",
        description: "Choose from over 7000 products across groceries, fresh fruits, beauty items & more.",
        icon: <Smartphone className="w-8 h-8 text-indigo-600" />,
        gradient: "from-indigo-500/20 to-purple-500/20",
        iconBg: "bg-indigo-50",
        number: "01"
    },
    {
        title: "Place an order",
        description: "Add your favourite items to the cart and avail the best offers in the market.",
        icon: <ShoppingCart className="w-8 h-8 text-amber-500" />,
        gradient: "from-amber-500/20 to-orange-500/20",
        iconBg: "bg-amber-50",
        number: "02"
    },
    {
        title: "Instant Delivery",
        description: "Experience lightning-fast speed with items delivered to your doorstep in minutes.",
        icon: <Truck className="w-8 h-8 text-rose-500" />,
        gradient: "from-rose-500/20 to-pink-500/20",
        iconBg: "bg-rose-50",
        number: "03"
    }
];

export default function TopFooter() {
    return (
        <section className="py-24 px-6 relative overflow-hidden bg-white">
            {/* Soft Background Accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-24 left-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute bottom-24 right-10 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-[#FF3269] font-black uppercase tracking-[0.2em] text-xs"
                    >
                        Easy Process
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-slate-900 mt-4"
                    >
                        How it works<span className="text-[#FF3269]">.</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connection Arrows (Desktop Only) */}
                    <div className="hidden lg:block absolute top-1/4 left-[30%] right-[30%] z-0">
                        <div className="flex justify-between items-center opacity-20">
                            <ArrowRight className="w-12 h-12 text-slate-400 animate-pulse" />
                            <ArrowRight className="w-12 h-12 text-slate-400 animate-pulse" />
                        </div>
                    </div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="group relative"
                        >
                            {/* Card Container */}
                            <div className="relative z-10 bg-white border border-slate-100 p-10 rounded-[2.5rem] transition-all duration-500 hover:border-transparent hover:shadow-2xl hover:shadow-slate-200/50">
                                {/* Large Background Number */}
                                <span className="absolute top-6 right-8 text-6xl font-black text-slate-50 group-hover:text-slate-100 transition-colors">
                                    {step.number}
                                </span>

                                {/* Icon Wrapper */}
                                <div className={`w-20 h-20 rounded-3xl ${step.iconBg} flex items-center justify-center mb-8 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                    {step.icon}
                                </div>

                                <h3 className="text-2xl font-black text-slate-800 mb-4">
                                    {step.title}
                                </h3>

                                <p className="text-slate-500 leading-relaxed font-medium">
                                    {step.description}
                                </p>

                                {/* Decorative Gradient Blobs on Hover */}
                                <div className={`absolute inset-0 bg-linear-to-br ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-[2.5rem]`} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}