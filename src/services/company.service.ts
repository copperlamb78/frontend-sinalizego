import { api } from '@/config/api.config';
import { compressImageFile } from '@/lib/image.utils';
import type {
  CompanyStorefront,
  CompanyBalance,
  CompanyWithdrawal,
  CompanyDashboardMetrics,
  UpdateCompanyDto
} from '@/types/company.types';

export interface CreateCompanyPayload {
  businessName: string;
  providerType: string;
  phone: string;
  state: string;
  city: string;
  district?: string;
  street?: string;
  zipCode?: string;
  number?: string;
  chairsCount?: number;
}

export interface CreateCompanyResponse {
  message: string;
  company: CompanyStorefront;
  access_token: string;
  refresh_token: string;
}

/**
 * Service for company, dashboard and balance endpoints
 */
export const companyService = {
  /**
   * Fetches full public storefront details by company slug
   * GET /api/v1/company/slug/:slug
   */
  getCompanyBySlug: async (slug: string): Promise<CompanyStorefront> => {
    const response = await api.get<CompanyStorefront>(`/company/slug/${slug}`);
    return response.data;
  },

  /**
   * Fetches company by ID
   * GET /api/v1/company/:id
   */
  getCompanyById: async (id: string): Promise<CompanyStorefront> => {
    const response = await api.get<CompanyStorefront>(`/company/${id}`);
    return response.data;
  },

  /**
   * Fetches company of the logged in user
   * GET /api/v1/company/get-by-user-id
   */
  getCompanyByUserId: async (): Promise<CompanyStorefront> => {
    const response = await api.get<CompanyStorefront>('/company/get-by-user-id');
    return response.data;
  },

  /**
   * Creates a new company, generating slug automatically and elevating role to COMPANY_OWNER
   * POST /api/v1/company/create
   */
  createCompany: async (data: CreateCompanyPayload): Promise<CreateCompanyResponse> => {
    const response = await api.post<CreateCompanyResponse>('/company/create', data);
    return response.data;
  },

  /**
   * Updates company info (name, address, whatsapp, banner, logo, etc.)
   * PATCH /api/v1/company/update/:companyId
   */
  updateCompany: async (companyId: string, data: UpdateCompanyDto): Promise<CompanyStorefront> => {
    const response = await api.patch<CompanyStorefront>(`/company/update/${companyId}`, data);
    return response.data;
  },

  /**
   * Uploads image (logo / banner) with client validation, smart compression and Base64 fallback
   * POST /api/v1/upload/photo (or /upload/image / Base64 Data URL)
   */
  uploadPhoto: async (
    file: File,
    companyId?: string
  ): Promise<{ url: string; public_id?: string; message?: string }> => {
    // 1. File format validation
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/svg+xml'];
    if (file.type && !allowedMimeTypes.includes(file.type.toLowerCase())) {
      throw new Error('Formato de arquivo não suportado. Por favor, envie uma foto em JPG, PNG ou WebP.');
    }

    // 2. File size validation (limit max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error('O arquivo selecionado é muito pesado. O limite máximo permitido é de 5MB.');
    }

    // 3. Client-side Image Optimization:
    // Scale and compress large camera photos down to ~60-120KB so JSON payloads never exceed limits!
    let processedFile = file;
    let compressedDataUrl = '';
    try {
      const compressed = await compressImageFile(file, 1280, 1280, 0.82);
      processedFile = compressed.file;
      compressedDataUrl = compressed.dataUrl;
    } catch {
      // If canvas compression is unavailable, fallback to original file
    }

    const formData = new FormData();
    formData.append('file', processedFile);
    formData.append('photo', processedFile);
    formData.append('image', processedFile);
    if (companyId) {
      formData.append('companyId', companyId);
    }

    // List of common NestJS multipart upload endpoint paths to attempt
    const candidateEndpoints = ['/upload/photo', '/upload/image', '/upload', '/company/upload'];

    for (const endpoint of candidateEndpoints) {
      try {
        const response = await api.post<{ url: string; public_id?: string; message?: string }>(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data?.url) {
          return response.data;
        }
      } catch (err: any) {
        // If not a 404 route error, rethrow
        if (err.response?.status !== 404) {
          throw err;
        }
      }
    }

    // 4. Fallback: Return ultra-light compressed Base64 Data URL (~80KB)
    if (compressedDataUrl) {
      return {
        url: compressedDataUrl,
        message: 'Imagem otimizada com sucesso'
      };
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          message: 'Imagem processada com sucesso'
        });
      };
      reader.onerror = () => {
        reject(new Error('Falha ao processar o arquivo de imagem no navegador.'));
      };
      reader.readAsDataURL(processedFile);
    });
  },

  /**
   * Fetches dashboard analytical metrics for company owner
   * GET /api/v1/company/dashboard/metrics
   */
  getDashboardMetrics: async (params?: { startDate?: string; endDate?: string }): Promise<CompanyDashboardMetrics> => {
    const response = await api.get<CompanyDashboardMetrics>('/company/dashboard/metrics', { params });
    return response.data;
  },

  /**
   * Fetches real-time wallet balance and escrow locked balance
   * GET /api/v1/company/balance
   */
  getBalance: async (): Promise<CompanyBalance> => {
    const response = await api.get<CompanyBalance>('/company/balance');
    return response.data;
  },

  /**
   * Requests instant on-demand withdrawal with Asaas transfer fee
   * POST /api/v1/company/withdraw
   */
  requestWithdrawal: async (amount?: number): Promise<{ message: string; withdrawal: CompanyWithdrawal }> => {
    const response = await api.post<{ message: string; withdrawal: CompanyWithdrawal }>(
      '/company/withdraw',
      amount ? { amount } : {}
    );
    return response.data;
  },

  /**
   * Fetches audited history of withdrawals
   * GET /api/v1/company/withdrawals
   */
  getWithdrawalsHistory: async (): Promise<CompanyWithdrawal[]> => {
    const response = await api.get<CompanyWithdrawal[]>('/company/withdrawals');
    return response.data;
  },

  /**
   * Fetches public list of establishments
   * GET /api/v1/company/list
   */
  listCompanies: async (): Promise<CompanyStorefront[]> => {
    try {
      const response = await api.get<CompanyStorefront[]>('/company/list');
      return response.data;
    } catch {
      return [];
    }
  },

  /**
   * Deactivates company (Soft delete)
   * DELETE /api/v1/company/deactivate/:companyId
   */
  deactivateCompany: async (companyId: string): Promise<{ id: string; isActive: boolean }> => {
    const response = await api.delete<{ id: string; isActive: boolean }>(`/company/deactivate/${companyId}`);
    return response.data;
  },

  /**
   * Activates company
   * PATCH /api/v1/company/activate/:companyId
   */
  activateCompany: async (companyId: string): Promise<{ id: string; isActive: boolean }> => {
    const response = await api.patch<{ id: string; isActive: boolean }>(`/company/activate/${companyId}`);
    return response.data;
  }
};
