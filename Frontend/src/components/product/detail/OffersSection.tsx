import React from 'react';
import { ChevronRight, RefreshCcw, Zap } from 'lucide-react';

const OffersSection = () => {
    const offers = [
        { id: 1, logo: "IDFC", text: "Flat ₹100 Off with IDFC FIRST Bank Debit Cards" },
        { id: 2, logo: "Fi", text: "Get Flat 20% Discount with MagniFi Fi Federal Credit Card" },
        { id: 3, logo: "Zagg", text: "Get 20% upto ₹100 off with Zagg Rupay credit card" },
        { id: 4, logo: "AU", text: "Get 15% off with AU ivy, Eternity, Royale & 'M' circle linked Debit Cards" },
        { id: 5, logo: "novio", text: "Get flat ₹100 discount with SBM Credilio RuPay Credit Card" },
    ];

    return (
        <div className="max-w-md p-4 bg-white font-sans text-slate-800">
            {/* Top Highlight Banner */}
            <div className="flex items-center justify-between p-3 mb-6 border border-indigo-50 rounded-xl bg-indigo-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-red-700 rounded flex items-center justify-center text-[8px] text-white font-bold leading-tight px-1">
                        IDFC FIRST Bank
                    </div>
                    <div className="text-sm">
                        Get at <span className="font-bold">₹568</span> with coupon offers
                        <div className="text-pink-600 font-semibold text-xs cursor-pointer">View all offers</div>
                    </div>
                </div>
                <ChevronRight size={18} className="text-pink-600" />
            </div>

            {/* Coupons Header */}
            <div className="relative mb-4">
                <h2 className="text-lg font-bold text-slate-700 bg-white pr-4 inline-block relative z-10">
                    Coupons & Offers
                </h2>
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 -z-0"></div>
            </div>

            {/* Offers List */}
            <div className="space-y-5 mb-6">
                {offers.map((offer) => (
                    <div key={offer.id} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 border border-slate-100 rounded-lg flex items-center justify-center bg-white overflow-hidden shrink-0">
                                {/* Placeholder for Logos */}
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{offer.logo}</span>
                            </div>
                            <p className="text-[13px] leading-snug font-medium text-slate-600 pr-2">
                                {offer.text}
                            </p>
                        </div>
                        <ChevronRight size={16} className="text-pink-500 shrink-0 opacity-70 group-hover:opacity-100" />
                    </div>
                ))}
            </div>

            <button className="text-pink-600 font-bold text-sm mb-8 block hover:underline">
                View all coupons
            </button>

            <hr className="border-slate-100 mb-8" />

            {/* Bottom Badges */}
            <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100">
                    <RefreshCcw size={28} className="text-slate-600 mb-2" />
                    <span className="text-[10px] font-bold text-slate-700 text-center px-2">3 Days Exchange</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100">
                    <Zap size={28} className="text-slate-600 mb-2" />
                    <span className="text-[10px] font-bold text-slate-700 text-center px-2">Fast Delivery</span>
                </div>
            </div>
        </div>
    );
};

export default OffersSection;