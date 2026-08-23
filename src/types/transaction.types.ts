export interface PixTransactionResponse {
  paymentId: string;
  totalValue: number;
  qrCodePayload: string;
  qrCodeImage: string; // Base64 data URL or direct image URL
  expirationDate: string; // ISO String
  barberNetValue?: number;
  platformFee?: number;
  asaasFee?: number;
}
