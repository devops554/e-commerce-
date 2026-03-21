"use client"
import React, { useState } from 'react'
import { useAuth } from '@/providers/AuthContext'
import { userService } from '@/services/user.service'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCircle, Shield, KeyRound, Save, Loader2 } from 'lucide-react'

export default function ManagerProfilePage() {
    const { user, mutate } = useAuth()

    // Profile Edit State
    const [name, setName] = useState(user?.name || '')
    const [isSavingProfile, setIsSavingProfile] = useState(false)

    // Password Edit State
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return toast.error('Name is required')

        try {
            setIsSavingProfile(true)
            await userService.updateProfile({ name })
            await mutate() // refresh auth context
            toast.success('Profile updated successfully')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile')
        } finally {
            setIsSavingProfile(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentPassword || !newPassword || !confirmPassword) {
            return toast.error('All password fields are required')
        }
        if (newPassword !== confirmPassword) {
            return toast.error('New passwords do not match')
        }
        if (newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters')
        }

        try {
            setIsChangingPassword(true)
            await userService.changePassword({ currentPassword, newPassword })
            toast.success('Password changed successfully')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to change password')
        } finally {
            setIsChangingPassword(false)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <UserCircle className="w-8 h-8 text-rose-500" />
                    Account Settings
                </h1>
                <p className="text-slate-500 font-medium">Manage your personal profile and security preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Details Card */}
                <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-rose-400 to-rose-600" />
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <Shield className="w-5 h-5 text-rose-500" />
                            Personal Details
                        </CardTitle>
                        <CardDescription className="font-medium">
                            Update your display name and contact information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Email Address</Label>
                                <Input
                                    value={user?.email || ''}
                                    disabled
                                    className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed rounded-xl font-medium font-mono text-sm"
                                />
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Email cannot be changed</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Display Name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Full Name"
                                    className="rounded-xl border-slate-200 focus:border-rose-400 focus:ring-rose-400 font-medium"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSavingProfile || name === user?.name}
                                className="w-full mt-2 rounded-xl bg-slate-900 hover:bg-black text-white font-black shadow-lg shadow-slate-200 active:scale-[0.98] transition-all h-11"
                            >
                                {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-violet-400 to-violet-600" />
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <KeyRound className="w-5 h-5 text-violet-500" />
                            Change Password
                        </CardTitle>
                        <CardDescription className="font-medium">
                            Ensure your account is using a long, random password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Current Password</Label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    className="rounded-xl border-slate-200 focus:border-violet-400 focus:ring-violet-400 font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">New Password</Label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="rounded-xl border-slate-200 focus:border-violet-400 focus:ring-violet-400 font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Confirm New Password</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="rounded-xl border-slate-200 focus:border-violet-400 focus:ring-violet-400 font-medium"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                                className="w-full mt-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black shadow-lg shadow-violet-200 active:scale-[0.98] transition-all h-11"
                            >
                                {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Shield className="w-4 h-4 mr-2" /> Update Password</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
