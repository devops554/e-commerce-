import React from 'react'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { StepProps } from './types'

export const DocumentStep = ({ formData, updateFormData, updateNestedData }: StepProps) => {
    const docs = [
        { label: 'Aadhar Card *', field: 'aadhar' },
        { label: 'PAN Card *', field: 'pan' },
        { label: 'License Card *', field: 'license' },
        { label: 'Bank Passbook / Cancelled Cheque *', field: 'passbook' },
        { label: 'Digital Signature (Image) *', field: 'digitalSignature' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4 p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[#FF3269]" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 leading-none">Aadhar Verification</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">12-Digit Unique Identification</p>
                    </div>
                </div>
                <div className="space-y-2 group">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#FF3269] ml-2">Aadhar Number</Label>
                    <input
                        type="text"
                        placeholder="0000 0000 0000"
                        value={formData.aadharNumber}
                        onChange={(e) => updateFormData('aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
                        className="w-full h-14 px-6 rounded-2xl border-none bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#FF3269]/5 transition-all font-bold text-slate-900 placeholder:text-slate-300 tracking-[0.2em]"
                    />
                </div>
            </div>

            <p className="text-sm font-bold text-rose-500 bg-rose-50 p-4 rounded-2xl border border-rose-100">
                Please upload clear scanned copies of your documents. Max size 5MB per file.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {docs.map(doc => (
                    <div key={doc.field} className="space-y-3">
                        <Label className="font-bold text-slate-700">{doc.label}</Label>
                        <div className="relative h-24 rounded-[24px] border-2 border-dashed border-slate-200 hover:border-[#FF3269]/30 hover:bg-rose-50/30 transition-all group flex flex-col items-center justify-center cursor-pointer">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        // Mocking upload for now
                                        updateNestedData('documentPaths', doc.field as any, file.name)
                                        toast.success(`${doc.label} uploaded successfully`)
                                    }
                                }}
                            />
                            {formData.documentPaths[doc.field as keyof typeof formData.documentPaths] ? (
                                <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-500 truncate max-w-[150px]">
                                        {formData.documentPaths[doc.field as keyof typeof formData.documentPaths]}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-[#FF3269] transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">Upload File</span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
