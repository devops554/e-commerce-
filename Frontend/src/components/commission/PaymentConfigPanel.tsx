"use client"
import React, { useEffect, useState } from "react"
import { commissionService, CommissionConfig } from "@/services/commission.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Save, Shield, CreditCard, Info } from "lucide-react"

export function PaymentConfigPanel() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<Partial<CommissionConfig>>({
    payoutMode: 'MANUAL',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    razorpayXAccountNumber: '',
    minPayoutAmount: 500,
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const data = await commissionService.getConfig()
      setConfig(data)
    } catch {
      toast.error("Failed to load payout settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await commissionService.updateConfig(config)
      toast.success("Payout settings updated successfully")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-10 text-center text-slate-400">Loading settings...</div>

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <CardTitle>Payout Mode</CardTitle>
          </div>
          <CardDescription>Choose how you want to process delivery partner payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition ${config.payoutMode === 'MANUAL' ? "border-indigo-600 bg-indigo-50" : "border-slate-100 bg-slate-50 hover:border-slate-200"}`}
              onClick={() => setConfig({ ...config, payoutMode: 'MANUAL' })}
            >
              <p className="font-bold text-slate-900">Manual Payouts</p>
              <p className="text-xs text-slate-500 mt-1">Admin manually transfers money and enters transaction IDs.</p>
            </div>
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition ${config.payoutMode === 'RAZORPAY' ? "border-indigo-600 bg-indigo-50" : "border-slate-100 bg-slate-50 hover:border-slate-200"}`}
              onClick={() => setConfig({ ...config, payoutMode: 'RAZORPAY' })}
            >
              <p className="font-bold text-slate-900">RazorpayX (Automatic)</p>
              <p className="text-xs text-slate-500 mt-1">Automatic payouts via RazorpayX integration.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {config.payoutMode === 'RAZORPAY' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <CardTitle>Razorpay Credentials</CardTitle>
            </div>
            <CardDescription>Configure your Razorpay API keys and account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Razorpay Key ID</Label>
                <Input
                  value={config.razorpayKeyId}
                  onChange={e => setConfig({ ...config, razorpayKeyId: e.target.value })}
                  placeholder="rzp_live_..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Razorpay Key Secret</Label>
                <Input
                  type="password"
                  value={config.razorpayKeySecret}
                  onChange={e => setConfig({ ...config, razorpayKeySecret: e.target.value })}
                  placeholder="••••••••••••"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Razorpay X Account Number</Label>
                <Input
                  value={config.razorpayXAccountNumber}
                  onChange={e => setConfig({ ...config, razorpayXAccountNumber: e.target.value })}
                  placeholder="232323000..."
                />
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 text-blue-700 text-xs">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>These credentials will be used globally for all automated commission payouts. Ensure they have sufficient permissions for Payouts.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>General Payout Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs space-y-1.5">
            <Label>Minimum Payout Amount (₹)</Label>
            <Input
              type="number"
              value={config.minPayoutAmount}
              onChange={e => setConfig({ ...config, minPayoutAmount: Number(e.target.value) })}
            />
            <p className="text-[10px] text-slate-400">Partners can only request payouts when their balance exceeds this amount.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving} className="gap-2 px-8">
          {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Settings</>}
        </Button>
      </div>
    </div>
  )
}
