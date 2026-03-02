"use client"

import { useState } from "react"
import axiosClient from "@/lib/axiosClient"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { clearCart } from "@/store/slices/cartSlice"
import axios from "axios"

export function useRazorpay() {
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    const loadScript = (src: string) => {
        return new Promise((resolve) => {
            const script = document.createElement("script")
            script.src = src
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const initPayment = async (orderData: any, userData: any) => {
        setLoading(true)
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")

        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?")
            setLoading(false)
            return
        }

        try {
            // 1. Create order on backend
            const { data: order } = await axios.post("/api/orders", orderData)

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.totalAmount * 100,
                currency: "INR",
                name: "BivhaShop.",
                description: "Order Payment",
                order_id: order.razorpayOrderId,
                handler: async (response: any) => {
                    try {
                        // 3. Verify payment on backend
                        await axios.post("/api/orders/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        })
                        toast.success("Payment successful! Your order is confirmed.")
                        dispatch(clearCart())
                    } catch (error) {
                        toast.error("Payment verification failed.")
                    }
                },
                prefill: {
                    name: userData.fullName,
                    email: userData.email,
                    contact: userData.phone,
                },
                theme: {
                    color: "#15803d", // green-700
                },
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.open()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return { initPayment, loading }
}
