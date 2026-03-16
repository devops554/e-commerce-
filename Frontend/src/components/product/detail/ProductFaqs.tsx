"use client"

import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle } from 'lucide-react'

interface Faq {
    question: string;
    answer: string;
    isActive: boolean;
}

interface ProductFaqsProps {
    faqs: Faq[];
}

export default function ProductFaqs({ faqs = [] }: ProductFaqsProps) {
    const activeFaqs = faqs.filter(f => f.isActive)

    if (activeFaqs.length === 0) return null

    return (
        <section className="bg-white p-6 md:p-8 border border-slate-200 rounded-[32px] shadow-sm space-y-6 mt-10">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3 border-none">
                {activeFaqs.map((faq, index) => (
                    <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border border-slate-100 rounded-2xl px-4 bg-slate-50/30 hover:bg-slate-50 transition-colors overflow-hidden border-none"
                    >
                        <AccordionTrigger className="hover:no-underline font-bold text-slate-700 py-4 text-left">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-500 leading-relaxed pb-4 text-sm">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    )
}
