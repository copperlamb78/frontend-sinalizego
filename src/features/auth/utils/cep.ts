/**
 * Aplica máscara de CEP brasileiro: XXXXX-XXX
 */
export const formatCepMask = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
};

/**
 * Remove traços e pontuações do CEP mantendo apenas números
 */
export const cleanCepDigits = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 8);
};
