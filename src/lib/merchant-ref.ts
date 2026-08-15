/**
 * Merchant Reference Generator Utility
 * Generates unique, traceable reference numbers for GCash and Bank transactions.
 */

export type MerchantRefPrefix = 'ARB' | 'GCASH' | 'BNK';

/**
 * Generates a merchant reference number in the format: PREFIX-YYYYMMDD-XXXX
 * @param prefix The prefix for the transaction (default: ARB)
 * @returns A unique reference string
 */
export function generateMerchantReference(prefix: MerchantRefPrefix = 'ARB'): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  const timestamp = date.getTime().toString().slice(-4); // last 4 digits of timestamp
  
  return `${prefix}-${dateStr}-${random}${timestamp}`;
}

/**
 * Validates if a string matches the merchant reference format
 */
export function isValidMerchantReference(ref: string): boolean {
  const pattern = /^(ARB|GCASH|BNK)-\d{8}-\d{8}$/;
  return pattern.test(ref);
}
