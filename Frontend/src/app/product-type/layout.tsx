"use client"

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer/Footer";

export default function ProductTypeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
}
