"use client"

import { useQuery } from "@tanstack/react-query";
import { orderService, InvoiceData } from "@/services/order.service";

export const useInvoice = (orderId: string) => {
    return useQuery<InvoiceData, Error>({
        queryKey: ['invoice', orderId],
        queryFn: () => orderService.getInvoice(orderId),
        enabled: !!orderId,
    });
};
