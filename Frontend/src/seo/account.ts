import type { Metadata } from "next";
import { buildMetadata } from "./base";

export const cartMetadata: Metadata = buildMetadata({
    title: "Your Cart | Kiranase",
    description:
        "Review your grocery cart on Kiranase. Check item prices, apply coupons, and place your order for 30-minute delivery.",
    keywords: "cart, grocery cart, checkout, Kiranase",
    path: "/cart",
    noIndex: true,
});

export const checkoutMetadata: Metadata = buildMetadata({
    title: "Checkout | Kiranase",
    description:
        "Complete your grocery order on Kiranase. Fast, secure checkout with multiple payment options. Delivered in 30 minutes.",
    keywords: "checkout, place order, grocery order, Kiranase checkout",
    path: "/checkout",
    noIndex: true,
});

export const ordersMetadata: Metadata = buildMetadata({
    title: "My Orders | Kiranase",
    description:
        "Track your current and past grocery orders on Kiranase. View order status, delivery updates, and order history.",
    keywords: "my orders, order history, track order, Kiranase orders",
    path: "/orders",
    noIndex: true,
});

export const loginMetadata: Metadata = buildMetadata({
    title: "Login | Kiranase",
    description:
        "Log in to your Kiranase account to order fresh groceries at bazaar-beating prices. Delivered in 30 minutes.",
    keywords: "login, sign in, Kiranase account",
    path: "/login",
    noIndex: true,
});

export const signupMetadata: Metadata = buildMetadata({
    title: "Sign Up | Kiranase",
    description:
        "Create your Kiranase account and get fresh groceries at prices cheaper than your local bazaar. Free delivery above ₹299.",
    keywords: "sign up, register, create account, Kiranase",
    path: "/signup",
    noIndex: true,
});

export const profileMetadata: Metadata = buildMetadata({
    title: "My Profile | Kiranase",
    description: "Manage your Kiranase account — update your address, view wallet balance, and edit personal details.",
    keywords: "profile, account settings, Kiranase account",
    path: "/profile",
    noIndex: true,
});