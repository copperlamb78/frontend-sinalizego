import { api } from '@/config/api.config';
import type { PixTransactionResponse } from '@/types/transaction.types';

export const transactionsService = {
  /**
   * Generates Pix QR Code and Copy-Paste payload for an appointment
   * POST /api/v1/transactions/pix/:appointmentId
   */
  generatePix: async (
    appointmentId: string
  ): Promise<PixTransactionResponse> => {
    const response = await api.post<PixTransactionResponse>(
      `/transactions/pix/${appointmentId}`
    );
    return response.data;
  }
};
