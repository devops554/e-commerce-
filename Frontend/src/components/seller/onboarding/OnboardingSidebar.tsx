import React from 'react'
import { CheckCircle2, Store, LogOut, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Step {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface OnboardingSidebarProps {
    steps: Step[];
    currentStep: number;
    userEmail?: string;
    onLogout: () => void;
    isMobile?: boolean;
    onClose?: () => void;
}

export const OnboardingSidebar = ({ steps, currentStep, userEmail, onLogout, isMobile, onClose }: OnboardingSidebarProps) => {
    return (
        <div className={`
            ${isMobile ? 'w-80 h-full' : 'hidden md:flex w-80 h-screen sticky top-0'} 
            bg-white border-r border-slate-100 flex flex-col overflow-y-auto shrink-0 transition-all duration-300
        `}>
            {isMobile && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500"
                >
                    <X className="w-6 h-6" />
                </button>
            )}

            <div className="p-6">
                <div className="flex items-center gap-3 mb-8 pt-2">
                    <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-100">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-black text-pink-950 text-lg">seller hub</h1>
                        {/* <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest leading-none">by bloommart</p> */}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 mb-4 px-2 uppercase tracking-[0.2em]">Onboarding Progress</p>
                    {steps.map((step, idx) => (
                        <div
                            key={step.id}
                            className={`flex items-center gap-4 p-3.5 rounded-[20px] transition-all duration-300 ${idx === currentStep ? 'bg-rose-50 text-[#FF3269]' :
                                idx < currentStep ? 'text-emerald-500' : 'text-slate-400'
                                }`}
                        >
                            <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${idx === currentStep ? 'border-[#FF3269] bg-white ring-4 ring-rose-50' :
                                idx < currentStep ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50'
                                }`}>
                                {idx < currentStep ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <span className="text-xs font-black">{idx + 1}</span>}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[11px] font-black uppercase tracking-[0.1em] ${idx === currentStep ? 'text-[#FF3269]' : 'text-inherit'}`}>{step.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto p-6 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-pink-600 shadow-sm">
                        {userEmail?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant Account</p>
                        <p className="text-[11px] font-bold text-slate-700 truncate">{userEmail}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 gap-2 h-10 text-xs font-bold transition-all"
                    onClick={onLogout}
                >
                    <LogOut className="w-4 h-4" /> Sign out
                </Button>
            </div>
        </div>
    )
}
