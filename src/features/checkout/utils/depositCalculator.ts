/**
 * Constante da trava de microtransações (R$ 15,00)
 * Sincronizado estritamente com `api-sinalizego/src/common/constants/billing.constant.ts`
 */
export const MIN_MICROTRANSACTION_DEPOSIT = 15.0;

export interface DepositEstimateResult {
  depositAmount: number;
  remainingAmount: number;
  appliedPercent: number;
  isFullUpfront: boolean;
}

/**
 * Calcula a estimativa transparente do sinal de reserva para exibição ao cliente na vitrine.
 * ATENÇÃO: Este cálculo é estritamente INFORMATIVO para UX. O backend é a única autoridade
 * financeira e recalcula os valores no momento da criação do agendamento (Regras Zero-Trust N1 e N5).
 */
export function estimateDeposit(
  totalPrice: number | string,
  serviceDepositPercent?: number | null
): DepositEstimateResult {
  const numericPrice = typeof totalPrice === 'string' ? parseFloat(totalPrice) : totalPrice;

  if (isNaN(numericPrice) || numericPrice <= 0) {
    return {
      depositAmount: 0,
      remainingAmount: 0,
      appliedPercent: 100,
      isFullUpfront: true,
    };
  }

  // Serviços com valor inferior ao piso de R$ 15,00 exigem sinal compulsório de 100%
  if (numericPrice < MIN_MICROTRANSACTION_DEPOSIT) {
    const rounded = Math.round(numericPrice * 100) / 100;
    return {
      depositAmount: rounded,
      remainingAmount: 0,
      appliedPercent: 100,
      isFullUpfront: true,
    };
  }

  // Serviços >= R$ 400,00 com percentual configurado para 30% aplicam 30%, senão 50%
  const percent = numericPrice >= 400 && serviceDepositPercent === 30 ? 0.3 : 0.5;
  const appliedPercent = percent === 0.3 ? 30 : 50;

  const calculatedDeposit = Math.round(numericPrice * percent * 100) / 100;
  const minDeposit = Math.min(numericPrice, MIN_MICROTRANSACTION_DEPOSIT);
  const depositAmount = Math.round(Math.max(calculatedDeposit, minDeposit) * 100) / 100;
  const remainingAmount = Math.max(0, Math.round((numericPrice - depositAmount) * 100) / 100);

  return {
    depositAmount,
    remainingAmount,
    appliedPercent,
    isFullUpfront: depositAmount >= numericPrice,
  };
}
