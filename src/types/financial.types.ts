export interface CreateFinancialProfileDto {
  name: string;
  email: string;
  cpfCnpj: string;
  birthDate: string; // YYYY-MM-DD
  mobilePhone: string;
  incomeValue: number;
  address: string;
  addressNumber: string;
  province: string;
  postalCode: string;
}

export interface FinancialProfile {
  id: string;
  companyId: string;
  walletId?: string;
  asaasAccountId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE';
  name?: string;
  email?: string;
  cpfCnpj?: string;
  mobilePhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialProfileResponse {
  message?: string;
  financialProfile: FinancialProfile;
}
