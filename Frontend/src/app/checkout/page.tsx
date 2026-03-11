"use client";

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { RootState } from "@/store"
import { useAuth } from "@/providers/AuthContext"
import { usePlaceOrder } from "@/hooks/useOrders"
import { CheckoutStepIndicator } from "@/components/checkout/CheckoutStepIndicator"
import { ShippingAddressStep } from "@/components/checkout/ShippingAddressStep"
import { PaymentMethodStep } from "@/components/checkout/PaymentMethodStep"
import { CheckoutMobileBar } from "@/components/checkout/CheckoutMobileBar"
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary"
import { AddressFormValues } from "@/components/checkout/AddressForm"
import { Button } from "@/components/ui/button"
import { useUserProfile, useAddAddress, useUpdateAddress, useDeleteAddress } from "@/hooks/useUser"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
    const { items, totalAmount } = useSelector((state: RootState) => state.cart)
    const { user, isLoaded } = useAuth()
    const { placeOrder, loading: placingOrder } = usePlaceOrder()
    const router = useRouter()

    const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay")
    const [step, setStep] = useState<"address" | "payment">("address")
    const [address, setAddress] = useState<AddressFormValues | null>(null)
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [saveToProfile, setSaveToProfile] = useState(true)

    const { data: profile, isLoading: loadingProfile } = useUserProfile(isLoaded && !!user)

    // Auto-toggle between list and form based on address availability
    useEffect(() => {
        if (profile?.addresses) {
            if (profile.addresses.length > 0) {
                // If we have addresses and weren't already explicitly adding one, show the list
                if (!showAddressForm && !selectedAddressId) {
                    setShowAddressForm(false)
                }
            } else {
                // No addresses? Must show form
                setShowAddressForm(true)
            }
        }
    }, [profile, selectedAddressId])
    const addAddressMutation = useAddAddress()
    const updateAddressMutation = useUpdateAddress()
    const deleteAddressMutation = useDeleteAddress()

    const invalidItems = items.filter(item => !item.productId || !item.variantId)
    const hasInvalidItems = invalidItems.length > 0

    useEffect(() => {
        if (isLoaded && items.length === 0) {

            router.push("/my-orders")
        }
    }, [isLoaded, items, router])

    useEffect(() => {
        const addresses = profile?.addresses
        if (addresses && addresses.length > 0 && !selectedAddressId && !showAddressForm) {
            const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0]
            if (defaultAddr._id) setSelectedAddressId(defaultAddr._id)
            setAddress({
                label: defaultAddr.label || "Home",
                fullName: defaultAddr.fullName,
                phone: defaultAddr.phone,
                street: defaultAddr.street,
                landmark: defaultAddr.landmark,
                city: defaultAddr.city,
                state: defaultAddr.state,
                postalCode: defaultAddr.postalCode,
                country: defaultAddr.country,
            })
        }
    }, [profile, selectedAddressId, showAddressForm])

    if (!isLoaded || loadingProfile) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )

    const handlePlaceOrder = async () => {
        if (!address) {
            toast.error("Please select or enter a shipping address")
            setStep("address")
            return
        }

        // Address saving is now handled in the ShippingAddressStep 
        // as soon as the user continues to payment.

        // Guard: ensure all items have valid product and variant IDs
        const invalidItems = items.filter(item => !item.productId || !item.variantId)
        if (invalidItems.length > 0) {
            toast.error("Some cart items are invalid. Please remove them and add again.", { duration: 5000 })
            return
        }

        await placeOrder(
            {
                items: items.map(item => ({
                    product: item.productId,
                    variant: item.variantId,
                    quantity: item.quantity,
                })) as any,
                shippingAddress: address,
                paymentMethod,
            },
            {
                fullName: address.fullName,
                email: user?.email,
                phone: address.phone,
            }
        )
    }

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-0">


            <div className="flex-1 container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-7xl">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-white shadow-sm shrink-0">
                            <Link href="/">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
                            <p className="text-xs lg:text-sm font-medium text-slate-500">
                                {step === "address" ? "Step 1: Shipping Details" : "Step 2: Payment & Review"}
                            </p>
                        </div>
                    </div>

                    {/* Step Indicator */}
                    <CheckoutStepIndicator
                        step={step}
                        setStep={setStep}
                        address={address}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                    {/* Left Section: Address & Payment */}
                    <div className="lg:col-span-2 space-y-8">
                        {step === "address" ? (
                            <ShippingAddressStep
                                profile={profile}
                                showAddressForm={showAddressForm}
                                setShowAddressForm={setShowAddressForm}
                                selectedAddressId={selectedAddressId}
                                setSelectedAddressId={setSelectedAddressId}
                                address={address}
                                setAddress={setAddress}
                                setStep={setStep}
                                updateAddressMutation={updateAddressMutation}
                                addAddressMutation={addAddressMutation}
                                deleteAddressMutation={deleteAddressMutation}
                                user={user}
                                saveToProfile={saveToProfile}
                                setSaveToProfile={setSaveToProfile}
                            />
                        ) : (
                            <PaymentMethodStep
                                hasInvalidItems={hasInvalidItems}
                                invalidItems={invalidItems}
                                address={address}
                                setStep={setStep}
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                                handlePlaceOrder={handlePlaceOrder}
                                placingOrder={placingOrder}
                                totalAmount={totalAmount}
                                itemsCount={items.length}
                            />
                        )}
                    </div>

                    {/* Right Section: Order Summary */}
                    <div className="lg:col-span-1">
                        <CheckoutSummary items={items} totalAmount={totalAmount} />

                        {/* Desktop Submit Button (Only in payment step) */}

                    </div>
                </div>
            </div>

            {/* Sticky Mobile Bottom Bar */}
            <CheckoutMobileBar
                step={step}
                handlePlaceOrder={handlePlaceOrder}
                placingOrder={placingOrder}
                itemsCount={items.length}
                totalAmount={totalAmount}
            />


        </main>
    )
}
