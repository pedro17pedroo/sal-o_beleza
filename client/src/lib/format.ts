// Utility functions for Angola-specific formatting

export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'Kz 0,00';
  
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue).replace('AOA', 'Kz');
};

export const formatPhone = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If already has +244, format accordingly
  if (cleaned.startsWith('244')) {
    const number = cleaned.slice(3);
    if (number.length === 9) {
      return `+244 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    }
  }
  
  // If it's a 9-digit local number, add +244
  if (cleaned.length === 9) {
    return `+244 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  // Return as is if doesn't match expected formats
  return phone;
};

export const parseCurrency = (value: string): number => {
  // Remove currency symbols and convert comma to dot
  const cleaned = value.replace(/[Kz\s]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

export const validateAngolanPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Angolan number
  // +244 followed by 9 digits (mobile) or 8 digits (landline)
  if (cleaned.startsWith('244')) {
    const number = cleaned.slice(3);
    return number.length === 8 || number.length === 9;
  }
  
  // Local format: 9 digits for mobile, 8 for landline
  return cleaned.length === 8 || cleaned.length === 9;
};