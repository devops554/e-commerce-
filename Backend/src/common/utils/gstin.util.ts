const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function validateGstin(gstin: string): boolean {
  if (!gstin) return false;
  return GSTIN_REGEX.test(gstin);
}

export function extractStateCode(gstin: string): string {
  if (!gstin || gstin.length < 2) return '';
  return gstin.slice(0, 2);
}
