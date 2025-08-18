export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

export const formatCurrencyShort = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (numAmount >= 10000000) {
    return `₹${(numAmount / 10000000).toFixed(1)}Cr`;
  } else if (numAmount >= 100000) {
    return `₹${(numAmount / 100000).toFixed(1)}L`;
  } else if (numAmount >= 1000) {
    return `₹${(numAmount / 1000).toFixed(1)}K`;
  }
  return `₹${numAmount.toLocaleString('en-IN')}`;
};