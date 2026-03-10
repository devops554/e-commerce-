"use client"

import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import {
    addToCart as addToCartAction,
    removeFromCart as removeFromCartAction,
    updateQuantity as updateQuantityAction,
    decrementCart as decrementCartAction,
    clearCart as clearCartAction,
    setCart
} from "@/store/slices/cartSlice"
import { useAuth } from "@/providers/AuthContext"
import { cartService } from "@/services/cart.service"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

export const useCart = () => {
    const dispatch = useDispatch()
    const { items, totalAmount } = useSelector((state: RootState) => state.cart)
    const { user, isLoaded } = useAuth()
    const queryClient = useQueryClient()

    // Track whether we've already synced once to avoid re-syncing on every mutation refetch
    const hasSynced = useRef(false)

    // Fetch remote cart only once when user logs in
    const { data: remoteCart, isLoading: isLoadingRemote } = useQuery({
        queryKey: ['cart'],
        queryFn: () => cartService.getCart(),
        enabled: isLoaded && !!user,
        // Only fetch once — mutations will optimistically update local state
        // without needing to refetch the entire cart each time
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    // Sync remote cart to local Redux state — only on first load
    useEffect(() => {
        if (!remoteCart || !isLoaded || !user || hasSynced.current) return

        hasSynced.current = true

        const remoteItems = Object.values(remoteCart) as any[]

        const formattedItems = remoteItems.map(item => ({
            id: item.variantId,
            productId: item.productId,
            variantId: item.variantId,
            title: item.title || "Product",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            image: item.image || ""
        }))

        const total = formattedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

        dispatch(setCart({ items: formattedItems, totalAmount: total }))
    }, [remoteCart, isLoaded, user, dispatch])

    // Reset sync flag on logout so next login re-syncs
    useEffect(() => {
        if (!user) {
            hasSynced.current = false
        }
    }, [user])

    const addItemMutation = useMutation({
        mutationFn: ({ productId, variantId, quantity, title, price, image }: {
            productId: string, variantId: string, quantity: number,
            title?: string, price?: number, image?: string
        }) => cartService.addItem(productId, variantId, quantity, title, price, image),
        // No invalidateQueries — we manage local state ourselves
    })

    const removeItemMutation = useMutation({
        mutationFn: (variantId: string) => cartService.removeItem(variantId),
        // No invalidateQueries
    })

    const addToCart = (item: any) => {
        dispatch(addToCartAction(item))
        if (user) {
            addItemMutation.mutate({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                title: item.title,
                price: item.price,
                image: item.image
            })
        }
    }

    const removeFromCart = (variantId: string) => {
        dispatch(removeFromCartAction(variantId))
        if (user) {
            removeItemMutation.mutate(variantId)
        }
    }

    const incrementQuantity = (item: any) => {
        dispatch(addToCartAction({ ...item, quantity: 1 }))
        if (user) {
            addItemMutation.mutate({
                productId: item.productId,
                variantId: item.variantId,
                quantity: 1,
                title: item.title,
                price: item.price,
                image: item.image
            })
        }
    }

    const decrementQuantity = (variantId: string) => {
        const item = items.find(i => i.variantId === variantId)
        if (!item) return

        dispatch(decrementCartAction({ variantId }))
        if (user) {
            addItemMutation.mutate({
                productId: item.productId,
                variantId: item.variantId,
                quantity: -1,
                title: item.title,
                price: item.price,
                image: item.image
            })
        }
    }

    return {
        items,
        totalAmount,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        isLoading: isLoaded && !!user ? isLoadingRemote : false
    }
}