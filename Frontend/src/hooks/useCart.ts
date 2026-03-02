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
import { useEffect } from "react"

export const useCart = () => {
    const dispatch = useDispatch()
    const { items, totalAmount } = useSelector((state: RootState) => state.cart)
    const { user, isLoaded } = useAuth()
    const queryClient = useQueryClient()

    // Sync remote cart to local state when logged in
    const { data: remoteCart, isLoading: isLoadingRemote } = useQuery({
        queryKey: ['cart'],
        queryFn: () => cartService.getCart(),
        enabled: isLoaded && !!user,
    })

    // Update local state when remote cart is fetched
    useEffect(() => {
        if (remoteCart && isLoaded && user) {
            // remoteCart is an object { variantId: item }
            const remoteItems = Object.values(remoteCart) as any[];

            // Map to frontend CartItem format
            const formattedItems = remoteItems.map(item => ({
                id: item.variantId, // id is used as the key in frontend
                productId: item.productId,
                variantId: item.variantId,
                title: item.title || "Product",
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
                image: item.image || ""
            }));

            const totalAmount = formattedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

            dispatch(setCart({
                items: formattedItems,
                totalAmount
            }));
        }
    }, [remoteCart, isLoaded, user, dispatch]);

    const addItemMutation = useMutation({
        mutationFn: ({ productId, variantId, quantity, title, price, image }: { productId: string, variantId: string, quantity: number, title?: string, price?: number, image?: string }) =>
            cartService.addItem(productId, variantId, quantity, title, price, image),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] })
    })

    const removeItemMutation = useMutation({
        mutationFn: (variantId: string) => cartService.removeItem(variantId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] })
    })

    const clearCartMutation = useMutation({
        mutationFn: () => cartService.clearCart(),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] })
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
