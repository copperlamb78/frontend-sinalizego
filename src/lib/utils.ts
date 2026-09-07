import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ⚡ Bolt: Cache Intl.NumberFormat instance to improve performance
// Creating a new Intl.NumberFormat instance is expensive (~100x slower than reusing).
// Since we only use pt-BR and BRL, caching the instance speeds up renders significantly,
// especially in large lists (e.g., StorefrontPage, OwnerFinancialPage).
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

/**
 * Safely formats any date input (YYYY-MM-DD, ISO string, or Date object)
 * to Portuguese format (e.g. "25 de dezembro de 2026"), avoiding timezone shifts and Invalid Date errors.
 */
export function formatDateLong(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return 'Data não informada';
  try {
    let dateStr = typeof dateInput === 'string' ? dateInput.trim() : dateInput.toISOString();
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    // Match YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      }
    }
    const fallback = new Date(dateInput);
    if (!isNaN(fallback.getTime())) {
      return fallback.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }
  } catch {
    // fallback
  }
  return 'Data não identificada';
}

/**
 * Sanitizes technical server/gateway jargon into human-friendly Portuguese
 */
function humanizeErrorText(text: string): string {
  if (!text) return 'Ocorreu um erro ao processar a requisição.';

  const lower = text.toLowerCase();

  // 1. Request/Payload too large
  if (
    lower.includes('request entity too large') ||
    lower.includes('payload too large') ||
    lower.includes('payloadtoolargeerror') ||
    lower.includes('entity too large') ||
    lower.includes('413')
  ) {
    return 'O arquivo de imagem é muito pesado para salvar. Escolha uma foto menor ou com tamanho reduzido.';
  }

  // 2. Missing routes
  if (
    lower.includes('cannot post') ||
    lower.includes('cannot get') ||
    lower.includes('cannot patch') ||
    lower.includes('cannot put') ||
    lower.includes('cannot delete')
  ) {
    return 'Esta funcionalidade está temporariamente indisponível no servidor. Tente novamente em instantes.';
  }

  // 3. Network and connectivity
  if (
    lower.includes('network error') ||
    lower.includes('failed to fetch') ||
    lower.includes('econnrefused') ||
    lower.includes('err_connection_refused') ||
    lower.includes('conexão')
  ) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
  }

  // 4. Authentication / Session
  if (
    lower.includes('unauthorized') ||
    lower.includes('jwt expired') ||
    lower.includes('token expired') ||
    lower.includes('invalid token')
  ) {
    return 'Sua sessão expirou por segurança. Por favor, faça login novamente para continuar.';
  }

  // 5. Forbidden
  if (lower.includes('forbidden') || lower.includes('access denied')) {
    return 'Você não possui permissão para realizar esta ação no momento.';
  }

  // 6. Server 500
  if (
    lower.includes('internal server error') ||
    lower.includes('server error') ||
    lower.includes('500')
  ) {
    return 'Tivemos uma instabilidade temporária no servidor. Por favor, tente novamente em instantes.';
  }

  // 7. Timeouts
  if (
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('econnaborted')
  ) {
    return 'O servidor demorou muito para responder. Por favor, tente novamente.';
  }

  // 8. Conflict
  if (
    lower.includes('already exists') ||
    lower.includes('duplicate key') ||
    lower.includes('já cadastrado') ||
    lower.includes('já existe')
  ) {
    return 'Já existe um cadastro com essas informações.';
  }

  // 9. Technical validation jargon (UUIDs, DTOs, IDs)
  if (
    lower.includes('uuid') ||
    lower.includes('deve ser um uuid') ||
    lower.includes('must be a uuid')
  ) {
    if (
      lower.includes('grupo') ||
      lower.includes('servicegroup') ||
      lower.includes('service_group')
    ) {
      return 'Por favor, selecione uma cadeira ou equipe de atendimento para vincular este serviço.';
    }
    if (lower.includes('serviço') || lower.includes('service')) {
      return 'Por favor, selecione um serviço válido.';
    }
    if (lower.includes('company') || lower.includes('empresa')) {
      return 'Estabelecimento não identificado. Recarregue a página e tente novamente.';
    }
    if (lower.includes('user') || lower.includes('usuário')) {
      return 'Usuário não identificado. Recarregue a página e tente novamente.';
    }
    return 'Por favor, selecione uma opção válida na lista.';
  }

  // 10. Empty field validation
  if (
    lower.includes('should not be empty') ||
    lower.includes('não pode ser vazio') ||
    lower.includes('isnotempty')
  ) {
    if (lower.includes('name') || lower.includes('nome')) {
      return 'Por favor, informe o nome para continuar.';
    }
    if (lower.includes('phone') || lower.includes('telefone') || lower.includes('whatsapp')) {
      return 'Por favor, informe um número de WhatsApp válido.';
    }
    return 'Por favor, preencha todos os campos obrigatórios.';
  }

  // 11. Forbidden technical jargon (Anti-Jargão Rule §2)
  if (lower.includes('split') || lower.includes('taxa da plataforma')) {
    return 'Houve uma divergência no cálculo da taxa de garantia. Tente novamente.';
  }
  if (lower.includes('escrow')) {
    return 'Ocorreu um imprevisto na garantia do atendimento. Tente novamente.';
  }
  if (lower.includes('webhook')) {
    return 'Aguardando atualização do status. Tente novamente em instantes.';
  }

  return text;
}

/**
 * Extracts a clear, humanized and user-friendly error message from any API error or exception
 */
export function extractErrorMessage(
  err: any,
  defaultMessage = 'Ocorreu um imprevisto ao processar sua solicitação.'
): string {
  if (!err) return defaultMessage;
  if (typeof err === 'string') return humanizeErrorText(err);

  // 1. Check Axios response data
  const data = err.response?.data;
  if (data) {
    // String body (e.g. "request entity too large" or HTML)
    if (typeof data === 'string' && data.trim()) {
      return humanizeErrorText(data);
    }
    // Array of validation error messages (NestJS class-validator)
    if (Array.isArray(data.message) && data.message.length > 0) {
      return humanizeErrorText(data.message.join(', '));
    }
    // Single message string
    if (typeof data.message === 'string' && data.message.trim()) {
      return humanizeErrorText(data.message);
    }
    // Asaas / Gateway errors array
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const combined = data.errors
        .map((e: any) => e.description || e.message || JSON.stringify(e))
        .join(', ');
      return humanizeErrorText(combined);
    }
    // Error field
    if (typeof data.error === 'string' && data.error.trim()) {
      return humanizeErrorText(data.error);
    }
    // Details field
    if (typeof data.details === 'string' && data.details.trim()) {
      return humanizeErrorText(data.details);
    }
  }

  // 2. Check HTTP status codes
  if (err.response?.status) {
    switch (err.response.status) {
      case 413:
        return 'O arquivo enviado é muito pesado. Selecione uma imagem com tamanho menor.';
      case 415:
        return 'Formato de arquivo não suportado. Por favor, envie uma foto em JPG, PNG ou WebP.';
      case 401:
        return 'Sua sessão expirou. Por favor, faça login novamente.';
      case 403:
        return 'Você não possui permissão para realizar esta alteração.';
      case 404:
        return 'O item ou funcionalidade solicitada não foi encontrada.';
      case 409:
        return humanizeErrorText(data?.message || 'Já existe um cadastro com esses dados.');
      default:
        if (err.response.status >= 500) {
          return 'Tivemos uma instabilidade temporária no servidor. Tente novamente em instantes.';
        }
    }
  }

  // 3. Check err.message
  if (typeof err.message === 'string' && err.message.trim()) {
    return humanizeErrorText(err.message);
  }

  return defaultMessage;
}
