/**
 * Format order ID for display - shows 3-digit display_number if available,
 * otherwise shows last 3 digits of the full ID
 */
export function formatOrderNumber(order: { id: string; display_number?: number }): string {
  if (order.display_number) {
    return `#${order.display_number}`;
  }
  
  // Fallback: extract last 3 digits from ID
  const match = order.id.match(/\d{3,}$/);
  if (match) {
    const digits = match[0];
    return `#${digits.slice(-3)}`;
  }
  
  // Last resort: just show last 3 chars
  return `#${order.id.slice(-3)}`;
}

