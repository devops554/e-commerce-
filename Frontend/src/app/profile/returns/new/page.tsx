"use client"

import React, { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    ArrowLeft,
    ArrowRight,
    RotateCcw,
    CheckCircle2,
    Camera,
    Banknote,
    CreditCard,
    Info,
    Loader2,
    Building2,
    User as UserIcon,
    Hash,
    Fingerprint
} from 'lucide-react'
import SimpleImageUpload from '@/components/SimpleImageUpload'
import { toast } from 'sonner'
import { useOrderById } from '@/hooks/useOrders'
import { useCreateReturn } from '@/hooks/useReturns'
import { Input } from '@/components/ui/input'
import { RefundMethod } from '@/services/return.service'
import { useUserProfile, useAddBankAccount } from '@/hooks/useUser'

// ─────────────────────────────────────────────
// INNER COMPONENT — uses useSearchParams()
// Must be wrapped in <Suspense> by the parent.
// ─────────────────────────────────────────────

function NewReturnWizardInner() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')
    const orderItemId = searchParams.get('orderItemId')

    const { data: order, isLoading: isLoadingOrder } = useOrderById(orderId || '')
    const { mutate: createReturn, isPending: isSubmittingReturn } = useCreateReturn()
    const { data: userProfile } = useUserProfile()
    const { mutateAsync: addBankAccount } = useAddBankAccount()

    const [step, setStep] = React.useState(1)
    const [selectedBankOption, setSelectedBankOption] = React.useState<string>('new')
    const [saveToProfile, setSaveToProfile] = React.useState(true)
    const [formData, setFormData] = React.useState({
        reason: '',
        reasonDescription: '',
        evidenceMedia: [] as string[],
        refundMethod: 'ORIGINAL_SOURCE' as RefundMethod,
        quantity: 1,
        bankDetails: {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: '',
        }
    })

    const isCOD = order?.paymentMethod === 'cod'
    const bankAccounts = userProfile?.bankAccounts || []

    React.useEffect(() => {
        if (bankAccounts.length > 0 && selectedBankOption === 'new') {
            setSelectedBankOption(bankAccounts[0]._id)
        }
    }, [bankAccounts, selectedBankOption])

    // Adjust default refund method if COD
    React.useEffect(() => {
        if (order && order.paymentMethod === 'cod') {
            setFormData(prev => ({ ...prev, refundMethod: 'BANK_TRANSFER' as RefundMethod }))
        }
    }, [order])

    // Update formData based on selected bank option
    React.useEffect(() => {
        if (selectedBankOption !== 'new') {
            const acc = bankAccounts.find(a => a._id === selectedBankOption)
            if (acc) {
                setFormData(prev => ({
                    ...prev,
                    bankDetails: {
                        accountHolderName: acc.accountHolderName,
                        accountNumber: acc.accountNumber,
                        ifscCode: acc.ifscCode,
                        bankName: acc.bankName,
                    }
                }))
            }
        } else {
            setFormData(prev => ({
                ...prev,
                bankDetails: { accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '' }
            }))
        }
    }, [selectedBankOption, userProfile])


    const handleSubmit = async () => {
        if (!orderId || !orderItemId) return

        const item = order?.items.find((i: any) => i._id === orderItemId)
        if (!item) {
            toast.error('Item not found in order')
            return
        }

        if (formData.refundMethod === 'BANK_TRANSFER' && selectedBankOption === 'new' && saveToProfile) {
            try {
                await addBankAccount(formData.bankDetails)
            } catch (err) {
                toast.error('Failed to save new bank account')
            }
        }

        const submissionData = {
            orderId,
            orderItemId,
            productId: item.product?._id || item.product,
            variantId: item.variant?._id || item.variant,
            quantity: formData.quantity,
            reason: formData.reason,
            reasonDescription: formData.reasonDescription,
            evidenceMedia: formData.evidenceMedia.map(url => ({ url })),
            refundMethod: formData.refundMethod,
            bankDetails: formData.refundMethod === 'BANK_TRANSFER' ? formData.bankDetails : undefined
        }

        createReturn(submissionData, {
            onSuccess: () => {
                router.push(`/my-orders/${orderId}`)
            }
        })
    }

    const nextStep = () => setStep(s => s + 1)
    const prevStep = () => setStep(s => s - 1)

    return (
        <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">

            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <RotateCcw className="h-6 w-6 text-blue-600" />
                        Request a Return
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Order #{orderId?.slice(-6).toUpperCase()}
                    </p>
                </div>
            </div>

            {/* Step progress */}
            <div className="flex items-center gap-2">
                {[1, 2, 3].map(s => (
                    <div
                        key={s}
                        className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden relative"
                    >
                        <div
                            className={`absolute inset-0 bg-blue-600 transition-all duration-500 ${step >= s ? 'translate-x-0' : '-translate-x-full'}`}
                        />
                    </div>
                ))}
            </div>

            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white">
                <CardContent className="p-8">

                    {/* ── Step 1: Reason ── */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-900">Why are you returning this?</h3>
                                <p className="text-sm text-slate-500">Please select a reason to help us process your request faster.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'DAMAGED', label: 'Item is damaged / Defective', icon: '💥' },
                                    { id: 'WRONG_ITEM', label: 'Received wrong item', icon: '📦' },
                                    { id: 'NOT_AS_DESCRIBED', label: 'Item not as described', icon: '🔍' },
                                    { id: 'SIZE_ISSUE', label: 'Size/Fit issue', icon: '📏' },
                                    { id: 'CHANGED_MIND', label: 'Changed my mind', icon: '🤔' },
                                ].map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => setFormData({ ...formData, reason: r.id })}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                                            ${formData.reason === r.id
                                                ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50'
                                                : 'border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <span className="text-2xl">{r.icon}</span>
                                        <span className={`font-bold ${formData.reason === r.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                            {r.label}
                                        </span>
                                        {formData.reason === r.id && (
                                            <CheckCircle2 className="ml-auto h-5 w-5 text-blue-600" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-lg"
                                disabled={!formData.reason}
                                onClick={nextStep}
                            >
                                Next Step
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    )}

                    {/* ── Step 2: Evidence ── */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-900">Provide more details</h3>
                                <p className="text-sm text-slate-500">Add a description and photos to help our team review your request.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">Description (Optional)</Label>
                                    <Textarea
                                        placeholder="Describe the issue in more detail..."
                                        className="rounded-2xl border-slate-200 min-h-[120px] focus-visible:ring-blue-500"
                                        value={formData.reasonDescription}
                                        onChange={(e) => setFormData({ ...formData, reasonDescription: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="font-bold text-slate-700 flex items-center gap-2">
                                        <Camera className="h-4 w-4 text-blue-600" />
                                        Upload Evidence
                                    </Label>
                                    <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                                        <SimpleImageUpload
                                            value={formData.evidenceMedia}
                                            multiple
                                            onValueChange={(urls) =>
                                                setFormData({
                                                    ...formData,
                                                    evidenceMedia: Array.isArray(urls) ? urls : [urls],
                                                })
                                            }
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">
                                            Clear photos of the product and its packaging help in faster approval.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    className="h-14 rounded-2xl font-bold border-2 border-transparent hover:border-slate-200"
                                    onClick={prevStep}
                                >
                                    Back
                                </Button>
                                <Button
                                    className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-lg"
                                    onClick={nextStep}
                                >
                                    Review Refund
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Refund method ── */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-900">Refund Method</h3>
                                <p className="text-sm text-slate-500">How would you like to receive your refund?</p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-3">
                                    {isCOD && (
                                        <button
                                            onClick={() => setFormData({ ...formData, refundMethod: 'BANK_TRANSFER' as RefundMethod })}
                                            className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left
                                                ${formData.refundMethod === 'BANK_TRANSFER'
                                                    ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50'
                                                    : 'border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="p-3 rounded-xl bg-white shadow-sm">
                                                <Building2 className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className={`font-bold ${formData.refundMethod === 'BANK_TRANSFER' ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                    Bank Transfer
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                                    Refund directly to your bank account. Recommended for COD orders.
                                                </p>
                                            </div>
                                            {formData.refundMethod === 'BANK_TRANSFER' && (
                                                <CheckCircle2 className="ml-auto h-5 w-5 text-indigo-600 shrink-0 mt-1" />
                                            )}
                                        </button>
                                    )}

                                    {!isCOD && (
                                        <button
                                            onClick={() => setFormData({ ...formData, refundMethod: 'ORIGINAL_SOURCE' as RefundMethod })}
                                            className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left
                                                ${formData.refundMethod === 'ORIGINAL_SOURCE'
                                                    ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50'
                                                    : 'border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="p-3 rounded-xl bg-white shadow-sm">
                                                <CreditCard className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className={`font-bold ${formData.refundMethod === 'ORIGINAL_SOURCE' ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    Original Source
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                                    Refund to your original payment method. May take 5–7 business days.
                                                </p>
                                            </div>
                                            {formData.refundMethod === 'ORIGINAL_SOURCE' && (
                                                <CheckCircle2 className="ml-auto h-5 w-5 text-blue-600 shrink-0 mt-1" />
                                            )}
                                        </button>
                                    )}

                                    {/* <button
                                        onClick={() => setFormData({ ...formData, refundMethod: 'WALLET' as RefundMethod })}
                                        className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left
                                            ${formData.refundMethod === 'WALLET'
                                                ? 'border-emerald-600 bg-emerald-50/50 ring-4 ring-emerald-50'
                                                : 'border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="p-3 rounded-xl bg-white shadow-sm">
                                            <Banknote className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className={`font-bold ${formData.refundMethod === 'WALLET' ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                Store Wallet
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 font-medium">
                                                Instant refund to your store wallet. Can be used for future orders.
                                            </p>
                                        </div>
                                        {formData.refundMethod === 'WALLET' && (
                                            <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-600 shrink-0 mt-1" />
                                        )}
                                    </button> */}
                                </div>

                                {/* Saved Bank Accounts Selection */}
                                {formData.refundMethod === 'BANK_TRANSFER' && bankAccounts.length > 0 && (
                                    <div className="space-y-3 mt-4">
                                        <h4 className="text-sm font-bold text-slate-700">Select Bank Account</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {bankAccounts.map((acc: any) => (
                                                <button
                                                    key={acc._id}
                                                    onClick={() => setSelectedBankOption(acc._id)}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                                                        ${selectedBankOption === acc._id
                                                            ? 'border-indigo-600 bg-indigo-50/50'
                                                            : 'border-slate-100 hover:border-slate-200'
                                                        }`}
                                                >
                                                    <Building2 className={`h-5 w-5 ${selectedBankOption === acc._id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                                    <div className="flex-1">
                                                        <p className="font-bold text-slate-800 text-sm">{acc.bankName} - {acc.accountHolderName}</p>
                                                        <p className="text-xs text-slate-500 font-medium">Ac/No: {acc.accountNumber?.slice(-4).padStart(acc.accountNumber?.length || 4, '•')} | IFSC: {acc.ifscCode}</p>
                                                    </div>
                                                    {selectedBankOption === acc._id && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                                                </button>
                                            ))}
                                            
                                            <button
                                                onClick={() => setSelectedBankOption('new')}
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left bg-slate-50
                                                    ${selectedBankOption === 'new'
                                                        ? 'border-indigo-600 bg-indigo-50/50'
                                                        : 'border-slate-100 hover:border-slate-200'
                                                    }`}
                                            >
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-800 text-sm">+ Add New Bank Account</p>
                                                </div>
                                                {selectedBankOption === 'new' && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Bank Details Form */}
                                {formData.refundMethod === 'BANK_TRANSFER' && selectedBankOption === 'new' && (
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 mt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="h-4 w-4 text-indigo-600" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">New Bank Account Details</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Account Holder</Label>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Name on account"
                                                        className="rounded-xl border-slate-200 pl-10 h-11"
                                                        value={formData.bankDetails.accountHolderName}
                                                        onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value } })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Bank Name</Label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="e.g. HDFC Bank"
                                                        className="rounded-xl border-slate-200 pl-10 h-11"
                                                        value={formData.bankDetails.bankName}
                                                        onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Account Number</Label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="0000 0000 0000"
                                                        className="rounded-xl border-slate-200 pl-10 h-11"
                                                        value={formData.bankDetails.accountNumber}
                                                        onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">IFSC Code</Label>
                                                <div className="relative">
                                                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="SBIN0001234"
                                                        className="rounded-xl border-slate-200 pl-10 h-11 uppercase"
                                                        value={formData.bankDetails.ifscCode}
                                                        onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value.toUpperCase() } })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-2 flex items-center space-x-2">
                                            <input 
                                                type="checkbox" 
                                                id="saveProfile"
                                                checked={saveToProfile}
                                                onChange={(e) => setSaveToProfile(e.target.checked)}
                                                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 ml-1"
                                            />
                                            <label htmlFor="saveProfile" className="text-sm font-medium text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Save these bank details to my profile for future returns
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex gap-3">
                                    <Info className="h-5 w-5 text-blue-600 shrink-0" />
                                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                        Once your request is approved, our delivery partner will contact you for pickup.
                                        Refund will be processed after the item reaches our warehouse and passes quality check.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    className="h-14 rounded-2xl font-bold border-2 border-transparent hover:border-slate-200"
                                    onClick={prevStep}
                                    disabled={isSubmittingReturn}
                                >
                                    Back
                                </Button>
                                <Button
                                    className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-100"
                                    onClick={handleSubmit}
                                    disabled={isSubmittingReturn || (formData.refundMethod === 'BANK_TRANSFER' && (!formData.bankDetails.accountNumber || !formData.bankDetails.ifscCode))}
                                >
                                    {isSubmittingReturn ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Request'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    )
}

// ─────────────────────────────────────────────
// PAGE EXPORT — wraps inner component in Suspense
//
// Next.js requires any component that calls useSearchParams()
// to be wrapped in <Suspense> so it can bail out of static
// pre-rendering correctly. The fallback shows while the
// client bundle hydrates and the search params become available.
// ─────────────────────────────────────────────

function ReturnWizardFallback() {
    return (
        <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                <div className="space-y-2">
                    <div className="h-6 w-48 rounded-lg bg-slate-100 animate-pulse" />
                    <div className="h-4 w-24 rounded-lg bg-slate-100 animate-pulse" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                {[1, 2, 3].map(s => (
                    <div key={s} className="flex-1 h-1.5 rounded-full bg-slate-100 animate-pulse" />
                ))}
            </div>
            <div className="h-[400px] rounded-[32px] bg-slate-100 animate-pulse flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
            </div>
        </div>
    )
}

export default function NewReturnWizardPage() {
    return (
        <Suspense fallback={<ReturnWizardFallback />}>
            <NewReturnWizardInner />
        </Suspense>
    )
}