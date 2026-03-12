"use client"

import { Button } from "@/components/ui/button"
import { SavedAddresses } from "./SavedAddresses"
import { AddressForm, AddressFormValues } from "./AddressForm"
import { toast } from "sonner"

interface ShippingAddressStepProps {
    profile: any;
    showAddressForm: boolean;
    setShowAddressForm: (show: boolean) => void;
    selectedAddressId: string | null;
    setSelectedAddressId: (id: string | null) => void;
    address: AddressFormValues | null;
    setAddress: (addr: AddressFormValues | null) => void;
    setStep: (step: "address" | "payment") => void;
    updateAddressMutation: any;
    addAddressMutation: any;
    deleteAddressMutation: any;
    user: any;
    saveToProfile: boolean;
    setSaveToProfile: (save: boolean) => void;
}

export function ShippingAddressStep({
    profile,
    showAddressForm,
    setShowAddressForm,
    selectedAddressId,
    setSelectedAddressId,
    address,
    setAddress,
    setStep,
    updateAddressMutation,
    addAddressMutation,
    deleteAddressMutation,
    user,
    saveToProfile,
    setSaveToProfile
}: ShippingAddressStepProps) {
    return (
        <div className="space-y-6">
            {profile?.addresses && profile.addresses.length > 0 && !showAddressForm ? (
                <SavedAddresses
                    addresses={profile.addresses as any}
                    selectedId={selectedAddressId}
                    onSelect={(addr) => {
                        setSelectedAddressId(addr._id)
                        setAddress({
                            label: addr.label,
                            fullName: addr.fullName,
                            phone: addr.phone,
                            street: addr.street,
                            landmark: addr.landmark,
                            city: addr.city,
                            state: addr.state,
                            postalCode: addr.postalCode,
                            country: addr.country,
                            location: addr.location,
                        })
                        // Auto-proceed to payment step
                        setStep("payment")
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    onAddNew={() => {
                        setShowAddressForm(true)
                        setSelectedAddressId(null)
                        setAddress(null)
                    }}
                    onEdit={(addr) => {
                        setSelectedAddressId(addr._id)
                        setAddress({
                            label: addr.label,
                            fullName: addr.fullName,
                            phone: addr.phone,
                            street: addr.street,
                            landmark: addr.landmark,
                            city: addr.city,
                            state: addr.state,
                            postalCode: addr.postalCode,
                            country: addr.country,
                            location: addr.location,
                        })
                        setShowAddressForm(true)
                    }}
                    onDelete={async (id) => {
                        if (confirm("Are you sure you want to delete this address?")) {
                            try {
                                await deleteAddressMutation.mutateAsync(id)
                                toast.success("Address deleted")
                                if (selectedAddressId === id) {
                                    setSelectedAddressId(null)
                                    setAddress(null)
                                }
                            } catch (err) {
                                toast.error("Failed to delete address")
                            }
                        }
                    }}
                />
            ) : (
                <div className="space-y-4">
                    {profile?.addresses && profile.addresses.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAddressForm(false)}
                            className="text-primary font-bold hover:bg-primary/5 rounded-full"
                        >
                            Back to saved addresses
                        </Button>
                    )}
                    <AddressForm
                        onSubmit={async (values) => {
                            try {
                                if (selectedAddressId) {
                                    // Update existing
                                    await updateAddressMutation.mutateAsync({ ...values, _id: selectedAddressId } as any)
                                    toast.success("Address updated successfully")
                                    setAddress(values)
                                    setStep("payment")
                                } else if (saveToProfile && user) {
                                    // Save new to profile
                                    const result = await addAddressMutation.mutateAsync(values as any)
                                    toast.success("Address saved to profile")

                                    // The backend returns the updated user, we need the new address _id
                                    const newAddress = result.addresses[result.addresses.length - 1]
                                    if (newAddress?._id) setSelectedAddressId(newAddress._id)

                                    setAddress(values)
                                    setStep("payment")
                                } else {
                                    // Just use locally (guest or don't save)
                                    setAddress(values)
                                    setStep("payment")
                                    if (!user) toast.info("Address used for this order (not logged in)")
                                }
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                setShowAddressForm(false)
                            } catch (err) {
                                console.error(err)
                                toast.error("Failed to save address")
                            }
                        }}
                        defaultValues={address || {
                            fullName: user?.name,
                            phone: "",
                        }}
                    />
                    <div className="flex items-center space-x-2 px-4 py-2">
                        <input
                            type="checkbox"
                            id="save-profile"
                            checked={saveToProfile}
                            onChange={(e) => setSaveToProfile(e.target.checked)}
                            className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <label htmlFor="save-profile" className="text-sm font-bold text-slate-600 cursor-pointer">
                            Save this address to my profile
                        </label>
                    </div>
                </div>
            )}

            {profile?.addresses && profile.addresses.length > 0 && !showAddressForm && address && (
                <Button
                    onClick={() => {
                        setStep("payment")
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                >
                    Deliver to this Address
                </Button>
            )}
        </div>
    )
}
