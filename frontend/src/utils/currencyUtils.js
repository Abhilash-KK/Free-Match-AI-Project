/**
 * Centralized Currency Configuration & Utility for FreeMatch AI
 * Currency: Indian Rupee (₹ / INR)
 */

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';
export const CURRENCY_NAME = 'Indian Rupee';

/**
 * Formats a number or numeric string into Indian Rupee format (e.g. ₹5,000, ₹1,00,000, ₹2,89,000)
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '₹0';
  
  if (typeof amount === 'string') {
    let str = amount.trim();
    // Replace legacy $ / USD
    str = str.replace(/\$/g, '₹').replace(/USD/gi, 'INR');
    
    // If it already has ₹ and proper formatting, return
    if (str.startsWith('₹') && (str.includes(',') || !/\d/.test(str))) {
      return str;
    }

    // Parse numeric value
    const numericOnly = str.replace(/[^0-9.-]/g, '');
    const num = parseFloat(numericOnly);
    if (isNaN(num)) return str || '₹0';
    return formatNumberToINR(num);
  }

  if (typeof amount === 'number') {
    if (isNaN(amount)) return '₹0';
    return formatNumberToINR(amount);
  }

  return '₹0';
};

/**
 * Formats numeric value using Indian numbering format
 */
const formatNumberToINR = (num) => {
  try {
    return '₹' + num.toLocaleString('en-IN');
  } catch (e) {
    return '₹' + num.toString();
  }
};

/**
 * Formats an hourly rate value (e.g. ₹4,000 / hr or ₹50/hr)
 */
export const formatHourlyRate = (rate) => {
  if (!rate) return '₹0 / hr';
  if (typeof rate === 'string') {
    let str = rate.replace(/\$/g, '₹').replace(/USD/gi, 'INR');
    if (str.includes('/hr') || str.includes('/ hr')) return str;
    const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return str + ' / hr';
    return `${formatCurrency(num)} / hr`;
  }
  return `${formatCurrency(rate)} / hr`;
};

/**
 * Replaces any USD ($) symbol or currency string in text with INR (₹)
 */
export const replaceUsdWithInr = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/\$([0-9,.]+)/g, '₹$1')
    .replace(/USD/gi, 'INR')
    .replace(/\$/g, '₹');
};

/**
 * Parses numeric value out of any currency string
 */
export const parseCurrencyNumber = (val) => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val || typeof val !== 'string') return 0;
  const num = parseFloat(val.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
};
