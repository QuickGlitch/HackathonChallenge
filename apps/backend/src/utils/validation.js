/**
 * Maximum allowed price for products and order items
 */
export const MAX_PRICE = 200;

/**
 * Validates that a price is valid and within the allowed limit
 * @param {number|string} price - The price to validate
 * @returns {{ valid: boolean, error?: string, value?: number }} - Validation result
 */
export function validatePrice(price) {
  const numPrice = parseFloat(price);

  if (isNaN(numPrice)) {
    return { valid: false, error: "Price must be a valid number" };
  }

  if (numPrice <= 0) {
    return { valid: false, error: "Price must be a positive number" };
  }

  if (numPrice > MAX_PRICE) {
    return { valid: false, error: `Price cannot exceed ${MAX_PRICE}` };
  }

  return { valid: true, value: numPrice };
}
