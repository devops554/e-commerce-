import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, ShoppingCart, Truck } from "lucide-react";

const steps = [
    {
        title: "Open the app",
        description: "Choose from over 7000 products across groceries, fresh fruits & veggies, meat, pet care, beauty items & more",
        icon: <Smartphone className="w-12 h-12 text-purple-600" />,
        color: "bg-purple-50"
    },
    {
        title: "Place an order",
        description: "Add your favourite items to the cart & avail the best offers",
        icon: <ShoppingCart className="w-12 h-12 text-orange-500" />,
        color: "bg-orange-50"
    },
    {
        title: "Get free delivery",
        description: "Experience lighting-fast speed & get all your items delivered in minutes",
        icon: <Truck className="w-12 h-12 text-pink-500" />,
        color: "bg-pink-50"
    }
];

export default function TopFooter() {
    return (
        <section className="py-16 px-4 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
                How it Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="flex items-center justify-center pt-10">
                            <div className={`p-4 rounded-2xl ${step.color} mb-4`}>
                                {/* Replace these with your specific .png assets if needed */}
                                {step.icon}
                            </div>
                            <CardTitle className="text-xl font-bold text-slate-800">
                                {step.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center px-8 pb-10">
                            <p className="text-slate-500 leading-relaxed">
                                {step.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}