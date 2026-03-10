export type GstRate = 0 | 3 | 5 | 12 | 18 | 28;

export interface GstBreakdown {
  sellingPrice: number; // final price per unit (inclusive or exclusive)
  basePrice: number; // ex-GST taxable value per unit
  gstRate: number;
  gstAmountPerUnit: number;
  cgst: number; // half of gst (intra-state only)
  sgst: number; // half of gst (intra-state only)
  igst: number; // full gst (inter-state only)
  hsnCode: string;
}

/**
 * Normalises state names/codes for comparison
 * (e.g. "Maharashtra" or "MAHARASHTRA" → "27" if mapped, or just lowercase)
 */
export function normalizeState(state: string): string {
  if (!state) return '';
  const s = state.trim().toLowerCase();

  // Basic mapping for common states if they are passed as names instead of codes
  const nameToCode: Record<string, string> = {
    maharashtra: '27',
    delhi: '07',
    karnataka: '29',
    'tamil nadu': '33',
    'west bengal': '19',
    gujarat: '24',
    // ... add more if needed
  };

  return nameToCode[s] || s;
}

export function getOrderItemGst(
  sellingPrice: number,
  gst:
    | { hsnCode?: string; gstRate?: number; includedInPrice?: boolean }
    | undefined,
  isInterState = false,
): GstBreakdown {
  const rate = gst?.gstRate ?? 0;
  const inclusive = gst?.includedInPrice ?? true;
  const hsnCode = gst?.hsnCode ?? '';

  let basePrice: number;
  let gstAmount: number;

  if (rate === 0) {
    basePrice = sellingPrice;
    gstAmount = 0;
  } else if (inclusive) {
    // back-calculate: customer price already includes GST
    // Formula: Base = Total / (1 + Rate%)
    basePrice = r2(sellingPrice / (1 + rate / 100));
    gstAmount = r2(sellingPrice - basePrice);
  } else {
    // GST added on top of base price
    basePrice = sellingPrice;
    gstAmount = r2((sellingPrice * rate) / 100);
  }

  const half = r2(gstAmount / 2);

  return {
    sellingPrice: inclusive ? sellingPrice : r2(sellingPrice + gstAmount),
    basePrice,
    gstRate: rate,
    gstAmountPerUnit: gstAmount,
    cgst: isInterState ? 0 : half,
    sgst: isInterState ? 0 : half,
    igst: isInterState ? gstAmount : 0,
    hsnCode,
  };
}

export function r2(n: number): number {
  return Math.round(n * 100) / 100;
}
