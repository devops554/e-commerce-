"use client"

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Faq {
    question: string;
    answer: string;
    isActive: boolean;
}

interface FaqSectionProps {
    data: {
        faqs?: Faq[];
    }
    onChange: (field: string, value: any) => void
}

export default function FaqSection({ data, onChange }: FaqSectionProps) {
    const faqs = data.faqs || []

    const addFaq = () => {
        onChange('faqs', [...faqs, { question: '', answer: '', isActive: true }])
    }

    const removeFaq = (index: number) => {
        const newFaqs = faqs.filter((_, i) => i !== index)
        onChange('faqs', newFaqs)
    }

    const updateFaq = (index: number, field: keyof Faq, value: any) => {
        const newFaqs = [...faqs]
        newFaqs[index] = { ...newFaqs[index], [field]: value }
        onChange('faqs', newFaqs)
    }

    return (
        <Card className="border-none shadow-sm bg-blue-50/30 rounded-3xl overflow-hidden">
            <CardHeader className="p-6 bg-white flex flex-row items-center justify-between border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <HelpCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Product FAQs</CardTitle>
                        <p className="text-xs text-slate-500 font-medium">Add commonly asked questions about this product.</p>
                    </div>
                </div>
                <Button 
                    type="button" 
                    onClick={addFaq}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-bold shadow-lg shadow-blue-100"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add FAQ
                </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {faqs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                        <HelpCircle className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No FAQs added yet.</p>
                        <Button 
                            variant="link" 
                            type="button" 
                            onClick={addFaq}
                            className="text-blue-600 font-bold"
                        >
                            Click here to add the first one.
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm relative group animate-in fade-in slide-in-from-top-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFaq(index)}
                                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white border border-red-100 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Question</Label>
                                            <Input
                                                placeholder="e.g. Is this product suitable for babies?"
                                                value={faq.question}
                                                onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:ring-blue-500 h-10 font-bold"
                                            />
                                        </div>
                                        <div className="flex flex-col items-center gap-2 pt-6">
                                            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Active</Label>
                                            <Switch 
                                                checked={faq.isActive}
                                                onCheckedChange={(val) => updateFaq(index, 'isActive', val)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Answer</Label>
                                        <Textarea
                                            placeholder="Provide a detailed answer here..."
                                            value={faq.answer}
                                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                            className="rounded-xl border-slate-200 focus:ring-blue-500 min-h-[80px] text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
