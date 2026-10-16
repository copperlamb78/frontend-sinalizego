/**
 * Utilitários para conversão e manipulação de fuso horário no agendamento.
 * Garante que a data e horário selecionados na vitrine (no fuso da barbearia)
 * sejam convertidos com precisão cirúrgica para o instante UTC (ISO 8601) esperado pela API.
 */

/**
 * Converte uma data (YYYY-MM-DD) e horário de parede (HH:mm) na timezone da empresa
 * para uma string ISO 8601 em UTC pronta para ser enviada a `POST /appointments`.
 */
export function buildAppointmentIsoString(
  dateString: string,
  timeSlot: string,
  timeZone: string = 'America/Sao_Paulo'
): string {
  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const [hourStr, minuteStr] = timeSlot.split(':');

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Estimativa inicial em UTC
  let targetUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  // Usa Intl.DateTimeFormat para determinar o offset exato do fuso da empresa naquele instante
  const offsetMinutes = getTimezoneOffsetMinutes(new Date(targetUtc), timeZone);
  // Se o fuso for America/Sao_Paulo (UTC-3), offsetMinutes é -180.
  // Para que no fuso local sejam 14:00, o horário UTC precisa ser 17:00 (14 - (-3) = 17)
  targetUtc -= offsetMinutes * 60 * 1000;

  // Segunda passada de compensação para tratar potenciais transições de horário de verão
  const secondPassOffset = getTimezoneOffsetMinutes(new Date(targetUtc), timeZone);
  if (secondPassOffset !== offsetMinutes) {
    const diff = secondPassOffset - offsetMinutes;
    targetUtc -= diff * 60 * 1000;
  }

  return new Date(targetUtc).toISOString();
}

/**
 * Retorna o offset em minutos entre UTC e o fuso especificado para a data fornecida.
 * Exemplo: para America/Sao_Paulo (UTC-3), retorna -180.
 */
function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => {
      const part = parts.find((p) => p.type === type);
      return part ? parseInt(part.value, 10) : 0;
    };

    const targetYear = getPart('year');
    const targetMonth = getPart('month');
    const targetDay = getPart('day');
    let targetHour = getPart('hour');
    if (targetHour === 24) targetHour = 0; // Algumas implementações retornam 24:00
    const targetMinute = getPart('minute');

    const asLocalUtc = Date.UTC(targetYear, targetMonth - 1, targetDay, targetHour, targetMinute, 0, 0);
    const actualUtc = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      0,
      0
    );

    return Math.round((asLocalUtc - actualUtc) / 60000);
  } catch {
    // Fallback padrão para horário de Brasília (UTC-3)
    return -180;
  }
}
