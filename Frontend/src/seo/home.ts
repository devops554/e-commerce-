import type { Metadata } from "next";
import { buildMetadata } from "./base";

export const homeMetadata: Metadata = buildMetadata({
    title: "Kiranase - Bazaar se Sasta Har Din | Delivered in 30 Min",
    description:
        "Kiranase delivers fresh groceries at prices cheaper than your local bazaar. Order from 7000+ products across 10,000+ pincodes in India. Free delivery above ₹299. Delivered in 30 minutes.",
    keywords:
        "Kiranase, grocery delivery, online grocery, fresh produce, daily essentials, fast delivery, kirana store, grocery app, online shopping, fresh vegetables, fruits, dairy, staples, snacks, beverages, 30 minute delivery, India, free delivery",
    path: "/",
});