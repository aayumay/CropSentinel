export function formatINR(usdValue) {
  if (usdValue === undefined || usdValue === null || isNaN(usdValue)) return '₹0';
  
  // Convert assumed USD to INR (approximate rate 1 USD = 83 INR)
  const inrValue = Number(usdValue) * 83;
  
  // Format following Indian conventions (e.g. ₹1,00,000)
  return '₹' + inrValue.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
