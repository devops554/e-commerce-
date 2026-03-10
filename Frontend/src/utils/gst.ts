/**
 * Utility for GST calculations in the frontend.
 * Mirrors backend logic to ensure consistency.
 */

export interface GstBreakdown {
    basePrice: number;
    gstAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
}

/**
 * Calculates GST breakdown for a single item.
 * @param price Total selling price (incl. GST)
 * @param gstRate Tax percentage (e.g. 18)
 * @param quantity Number of units
 * @returns Breakdown of tax components
 */
export function getOrderItemGst(price: number, gstRate: number = 0, quantity: number = 1): GstBreakdown {
    const totalAmount = price * quantity;

    // Reverse calculation for base price: Base = Total / (1 + Rate/100)
    const basePriceTotal = totalAmount / (1 + gstRate / 100);
    const gstAmountTotal = totalAmount - basePriceTotal;

    // Note: We don't split CGST/SGST/IGST here as customer-facing UI 
    // usually just shows "GST" totaling both.
    // If needed specifically for display, it would be 50/50 split for Intra-state.
    return {
        basePrice: Number(basePriceTotal.toFixed(2)),
        gstAmount: Number(gstAmountTotal.toFixed(2)),
        cgst: Number((gstAmountTotal / 2).toFixed(2)),
        sgst: Number((gstAmountTotal / 2).toFixed(2)),
        igst: Number(gstAmountTotal.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2))
    };
}

/**
 * Calculates cumulative totals for an array of items.
 */
export function calculateOrderTotals(items: { price: number; gstRate?: number; quantity: number }[]) {
    return items.reduce((acc, item) => {
        const breakdown = getOrderItemGst(item.price, item.gstRate || 0, item.quantity);
        return {
            subTotal: acc.subTotal + breakdown.basePrice,
            totalGst: acc.totalGst + breakdown.gstAmount,
            grandTotal: acc.grandTotal + breakdown.totalAmount
        };
    }, { subTotal: 0, totalGst: 0, grandTotal: 0 });
}
