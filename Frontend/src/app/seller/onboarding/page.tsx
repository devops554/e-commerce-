"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronRight, ArrowLeft,
    Building2, User, ShoppingBag, FileText, MapPin, Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuth } from '@/providers/AuthContext'
import { sellerService } from '@/services/seller.service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Modular Components
import { OnboardingSidebar } from '@/components/seller/onboarding/OnboardingSidebar'
import { BusinessStep } from '@/components/seller/onboarding/BusinessStep'
import { SalesStep } from '@/components/seller/onboarding/SalesStep'
import { ContactStep } from '@/components/seller/onboarding/ContactStep'
import { DocumentStep } from '@/components/seller/onboarding/DocumentStep'
import { LocationStep } from '@/components/seller/onboarding/LocationStep'
import { SellerFormData } from '@/components/seller/onboarding/types'

const steps = [
    { id: 'business', label: 'Business & Categories', icon: <Building2 className="w-5 h-5" /> },
    { id: 'sales', label: 'Sales Details', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'contacts', label: 'Contact & Login', icon: <User className="w-5 h-5" /> },
    { id: 'documents', label: 'Documentation', icon: <FileText className="w-5 h-5" /> },
    { id: 'location', label: 'Bank & Location', icon: <MapPin className="w-5 h-5" /> },
]

export default function PartnerWithUsPage() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [formData, setFormData] = useState<SellerFormData>({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        storeName: '',
        storeDescription: '',
        businessType: '',
        panNumber: '',
        aadharNumber: '',
        gstNumber: '',
        productTypes: [],
        productCategories: [],
        topCategories: [],
        retailChannels: [],
        referenceLinks: [''],
        monthlySales: '',
        socialChannels: [],
        socialMediaLinks: [],
        userCounts: [],
        spocDetails: {
            name: user?.name || '',
            email: user?.email || '',
            designation: 'owner',
        },
        documentPaths: {
            aadhar: '',
            pan: '',
            license: '',
            passbook: '',
            digitalSignature: '',
        },
        bankDetails: {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: '',
        },
        pickupAddress: {
            addressLine: '',
            country: 'India',
            state: '',
            city: '',
            pincode: '',
        }
    })

    const updateFormData = (field: keyof SellerFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const updateNestedData = (section: 'bankDetails' | 'pickupAddress' | 'spocDetails' | 'documentPaths', field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }))
    }

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0))

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await sellerService.register(formData as any)
            toast.success('Registration submitted successfully! Admin will review your application.')
            router.push('/profile')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit registration')
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-8 h-8 text-[#FF3269]" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Sell on Our Platform</h1>
                    <p className="text-slate-500 mb-8">Please login to start your seller registration process.</p>
                    <Button
                        className="w-full h-12 rounded-2xl bg-[#FF3269] hover:bg-[#e8215a] font-bold text-lg"
                        onClick={() => router.push(`/login?redirect=${encodeURIComponent('/partner-with-us')}`)}
                    >
                        Log in to Continue
                    </Button>
                </div>
            </div>
        )
    }

    const commonProps = { formData, updateFormData, updateNestedData }

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
                {/* Desktop Sidebar */}
                <OnboardingSidebar
                    steps={steps}
                    currentStep={currentStep}
                    userEmail={user.email}
                    onLogout={logout}
                />

                {/* Mobile Drawer */}
                <AnimatePresence>
                    {isDrawerOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDrawerOpen(false)}
                                className="fixed inset-0 bg-pink-950/20 backdrop-blur-sm z-40 md:hidden"
                            />
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 left-0 z-50 md:hidden"
                            >
                                <OnboardingSidebar
                                    steps={steps}
                                    currentStep={currentStep}
                                    userEmail={user.email}
                                    onLogout={logout}
                                    isMobile
                                    onClose={() => setIsDrawerOpen(false)}
                                />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto">
                    {/* Mobile Header */}
                    <div className="md:hidden bg-white border-b border-pink-100 p-4 sticky top-0 z-30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsDrawerOpen(true)}
                                className="p-2 -ml-2 text-pink-600 hover:bg-pink-50 rounded-xl"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-sm font-black text-pink-950 uppercase tracking-wider">Seller Hub</h1>
                                <p className="text-[10px] font-bold text-pink-500 uppercase tracking-tighter">{steps[currentStep].label}</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-[10px] font-black text-pink-600 border border-pink-100 uppercase">
                            {user.name.charAt(0)}
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto p-4 md:p-12 pb-24">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="hidden md:block">
                                    <h2 className="text-4xl font-black text-pink-950 mb-2 tracking-tight italic">
                                        {steps[currentStep].label}
                                    </h2>
                                    <p className="text-pink-800/60 font-medium">Step {currentStep + 1} of {steps.length}: Please provide accurate business information.</p>
                                </div>

                                <div className="bg-white rounded-[40px] border border-pink-100 p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(255,182,193,0.15)] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 h-1.5 bg-pink-50 w-full">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                            className="h-full bg-pink-600 rounded-r-full shadow-[0_0_10px_rgba(219,39,119,0.3)]"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        {currentStep === 0 && <BusinessStep {...commonProps} />}
                                        {currentStep === 1 && <SalesStep {...commonProps} />}
                                        {currentStep === 2 && <ContactStep {...commonProps} />}
                                        {currentStep === 3 && <DocumentStep {...commonProps} />}
                                        {currentStep === 4 && <LocationStep {...commonProps} />}
                                    </div>

                                    <div className="mt-12 flex items-center justify-between">
                                        <Button
                                            variant="ghost"
                                            className={`rounded-2xl px-6 font-bold text-pink-400 hover:text-pink-600 hover:bg-pink-50 gap-2 ${currentStep === 0 ? 'invisible' : ''}`}
                                            onClick={prevStep}
                                        >
                                            <ArrowLeft className="w-5 h-5" /> Previous
                                        </Button>

                                        {currentStep === steps.length - 1 ? (
                                            <Button
                                                loading={loading}
                                                onClick={handleSubmit}
                                                className="rounded-2xl bg-pink-600 hover:bg-pink-700 px-10 h-14 font-black text-white text-lg shadow-xl shadow-pink-200 gap-2 transition-all active:scale-[0.98]"
                                            >
                                                Finish Application <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={nextStep}
                                                className="rounded-2xl bg-pink-950 hover:bg-black px-10 h-14 font-black text-white text-lg gap-2 shadow-xl shadow-pink-900/10 transition-all active:scale-[0.98]"
                                            >
                                                Save & continue <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}
