"use client";

import { useState } from "react"
import { useMyOrders } from "@/hooks/useOrders"
import { Button } from "@/components/ui/button"
import { Loader2, ShoppingBag, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { OrderCard } from "@/components/order/OrderCard"


export default function MyOrdersPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useMyOrders({ page, limit: 10 });
    const orders = data?.orders || [];

    return (
        <main className="max-w-2xl mx-auto px-4 py-10">

            {/* Page heading */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-[#f0ebe0] rounded-2xl border border-[#e0d8c8]">
                    <ClipboardList className="w-5 h-5 text-[#9b7f52]" />
                </div>
                <div>
                    <h1
                        className="text-2xl font-black text-[#3b2e1e] tracking-tight"
                        style={{ fontFamily: "'Georgia', serif" }}
                    >
                        My Orders
                    </h1>
                    <p className="text-sm text-[#a09070] mt-0.5">
                        Track and manage your recent purchases
                    </p>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#9b7f52]" />
                    <p className="text-sm text-[#b5a48a]">Fetching your orders…</p>
                </div>
            )}

            {/* Error */}
            {isError && (
                <div className="text-center py-16">
                    <p className="text-sm font-semibold text-rose-500">
                        Failed to load orders. Please try again.
                    </p>
                </div>
            )}

            {/* Empty */}
            {!isLoading && !isError && orders.length === 0 && (
                <div className="flex flex-col items-center py-20 gap-5">
                    <div className="w-20 h-20 rounded-3xl bg-[#f0ebe0] border border-[#e0d8c8] flex items-center justify-center">
                        <ShoppingBag className="w-9 h-9 text-[#c5b48a]" />
                    </div>
                    <div className="text-center">
                        <p
                            className="text-lg font-black text-[#3b2e1e]"
                            style={{ fontFamily: "'Georgia', serif" }}
                        >
                            No orders yet
                        </p>
                        <p className="text-sm text-[#a09070] mt-1">
                            Start shopping to see your orders here
                        </p>
                    </div>
                    <Link href="/products">
                        <Button className="bg-[#3b2e1e] hover:bg-[#2a2010] text-[#f5f0e8] rounded-2xl px-6 font-semibold">
                            Browse Products
                        </Button>
                    </Link>
                </div>
            )}

            {/* Orders list */}
            {!isLoading && orders.length > 0 && (
                <div className="space-y-6">
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderCard key={order._id} order={order} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-6 border-t border-[#e0d8c8]">
                            <p className="text-xs text-[#a09070] font-medium">
                                Page {data.page} of {data.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setPage(p => Math.max(1, p - 1));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={page === 1}
                                    className="rounded-xl border-[#e0d8c8] text-[#3b2e1e] hover:bg-[#f0ebe0]"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setPage(p => Math.min(data.totalPages, p + 1));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={page === data.totalPages}
                                    className="rounded-xl border-[#e0d8c8] text-[#3b2e1e] hover:bg-[#f0ebe0]"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>



    )
}