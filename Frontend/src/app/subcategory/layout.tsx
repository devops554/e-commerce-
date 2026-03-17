"use client"

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer/Footer";

export default function SubCategoryLayout({
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
