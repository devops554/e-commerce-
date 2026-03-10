/**
 * Seller Configuration
 *
 * All values are read from environment variables so they can differ
 * across dev / staging / production without code changes.
 *
 * Add these keys to your .env file:
 *   SELLER_LEGAL_NAME=
 *   SELLER_GSTIN=
 *   SELLER_STATE_CODE=
 *   SELLER_ADDRESS=
 *   SELLER_EMAIL=
 *   SELLER_PHONE=
 */
export const sellerConfig = {
  /** Full legal / registered business name */
  legalName: process.env.SELLER_LEGAL_NAME ?? '',

  /** 15-character GSTIN, e.g. 27AABCU9603R1ZX */
  gstin: process.env.SELLER_GSTIN ?? '',

  /**
   * State name or 2-digit state code used for inter-state detection.
   * Must match normalised shippingAddress.state from the order DTO,
   * e.g. "maharashtra" or "27".
   */
  stateCode: process.env.SELLER_STATE_CODE ?? '',

  /** Registered business address */
  address: process.env.SELLER_ADDRESS ?? '',

  /** Contact email printed on invoice */
  email: process.env.SELLER_EMAIL ?? '',

  /** Contact phone printed on invoice */
  phone: process.env.SELLER_PHONE ?? '',
};
