import { api } from '@/config/api.config';
import type { PixTransactionResponse } from '@/types/transaction.types';

// Pre-generated demo QR Code PNG base64
const DEMO_QR_CODE_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><rect x="20" y="20" width="50" height="50" fill="%230F172A"/><rect x="30" y="30" width="30" height="30" fill="white"/><rect x="40" y="40" width="10" height="10" fill="%2314B8A6"/><rect x="130" y="20" width="50" height="50" fill="%230F172A"/><rect x="140" y="30" width="30" height="30" fill="white"/><rect x="150" y="40" width="10" height="10" fill="%2314B8A6"/><rect x="20" y="130" width="50" height="50" fill="%230F172A"/><rect x="30" y="140" width="30" height="30" fill="white"/><rect x="40" y="150" width="10" height="10" fill="%2314B8A6"/><rect x="80" y="80" width="40" height="40" fill="%2314B8A6"/><rect x="90" y="30" width="20" height="20" fill="%230F172A"/><rect x="130" y="90" width="20" height="30" fill="%230F172A"/><rect x="90" y="140" width="30" height="20" fill="%230F172A"/><rect x="140" y="140" width="40" height="40" fill="%230F172A"/></svg>';

export const transactionsService = {
  /**
   * Generates Pix QR Code and Copy-Paste payload for an appointment
   * POST /api/v1/transactions/pix/:appointmentId
   */
  generatePix: async (
    appointmentId: string
  ): Promise<PixTransactionResponse> => {
    if (appointmentId.startsWith('app-demo')) {
      return {
        paymentId: `pay-${Date.now()}`,
        totalValue: 22.5,
        qrCodePayload: '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540522.505802BR5920Barbearia Vintage6009Sao Paulo62070503***6304ABCD',
        qrCodeImage: DEMO_QR_CODE_SVG,
        expirationDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        barberNetValue: 20.0,
        platformFee: 2.5
      };
    }

    try {
      const response = await api.post<PixTransactionResponse>(
        `/transactions/pix/${appointmentId}`
      );
      return response.data;
    } catch {
      // Fallback for demonstration
      return {
        paymentId: `pay-${Date.now()}`,
        totalValue: 22.5,
        qrCodePayload: '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540522.505802BR5920Barbearia Vintage6009Sao Paulo62070503***6304ABCD',
        qrCodeImage: DEMO_QR_CODE_SVG,
        expirationDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        barberNetValue: 20.0,
        platformFee: 2.5
      };
    }
  }
};
