import axios from 'axios';

export interface CepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service?: string;
}

/**
 * Service to fetch Brazilian address details by CEP using BrasilAPI v2.
 */
export const fetchAddressByCep = async (cep: string): Promise<CepResponse | null> => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) {
    return null;
  }

  try {
    const response = await axios.get<CepResponse>(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.warn('[BrasilAPI] Failed to fetch CEP:', cleanCep, error);
    return null;
  }
};

export const cepService = {
  fetchAddressByCep
};
