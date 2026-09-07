export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
export type CompanyType = 'MEI' | 'INDIVIDUAL' | 'LIMITED' | 'ASSOCIATION';

export interface CreateFinancialProfileDto {
  name: string;
  email: string;
  cpfCnpj: string;
  birthDate?: string | null; // YYYY-MM-DD (somente PF)
  companyType?: CompanyType | string | null; // MEI, INDIVIDUAL, LIMITED, ASSOCIATION (PJ)
  mobilePhone: string;
  incomeValue: number;
  address?: string;
  addressNumber?: string;
  province?: string;
  postalCode?: string;
  pixAddressKey: string;
  pixAddressKeyType: PixKeyType;
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
  pixAddressKey?: string;
  pixAddressKeyType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialProfileResponse {
  message?: string;
  financialProfile: FinancialProfile;
}

export interface PixKeyItem {
  id: string;
  key: string;
  type: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';
  isDefault: boolean;
  createdAt: string;
}

export interface CreatePixKeyPayload {
  key: string;
  type: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';
  isDefault?: boolean;
}
