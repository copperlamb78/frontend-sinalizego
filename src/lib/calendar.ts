/**
 * Utilitários para integração e sincronização com calendários (Google Agenda, Apple Calendar / iOS, Outlook)
 * Em conformidade estrita com o padrão RFC 5545 (CRLF, timestamps UTC em ISO 8601 básico).
 */

export interface IcsEventOptions {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  durationMinutes: number;
}

/**
 * Formata data no padrão ISO básico UTC (YYYYMMDDTHHMMSSZ) exigido por iCalendar e Google Calendar
 */
export const formatUtcDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

/**
 * Escapa caracteres especiais do padrão iCalendar (RFC 5545)
 */
const escapeIcsText = (str: string): string => {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

/**
 * Monta o conteúdo iCalendar (.ics) com quebras de linha CRLF (\r\n) estritamente obrigatórias no iOS
 */
export const generateIcsContent = ({
  title,
  description,
  location,
  startDate,
  durationMinutes,
}: IcsEventOptions): string => {
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  const nowUtc = formatUtcDate(new Date());
  const startUtc = formatUtcDate(startDate);
  const endUtc = formatUtcDate(endDate);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SinalizeGO//Agendamento Inteligente//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@sinalizego.com`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
};

/**
 * Gera URL de link direto via Data URI Base64 (Abordagem 1 - Sem Backend)
 * data:text/calendar;charset=utf-8;base64,...
 */
export const getIcsDataUri = (options: IcsEventOptions): string => {
  const icsContent = generateIcsContent(options);
  const b64Data = btoa(unescape(encodeURIComponent(icsContent)));
  return `data:text/calendar;charset=utf-8;base64,${b64Data}`;
};

/**
 * Gera URL direta para o Google Agenda (Web & Mobile Intent)
 * Abre diretamente a tela de criação de evento pré-preenchida no Google Agenda
 */
export const getGoogleCalendarUrl = ({
  title,
  description,
  location,
  startDate,
  durationMinutes,
}: IcsEventOptions): string => {
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  const dates = `${formatUtcDate(startDate)}/${formatUtcDate(endDate)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details: description,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Gera e dispara o download de arquivo .ics via Blob (para Desktop / Android)
 */
export const downloadIcsFile = (options: IcsEventOptions): void => {
  const icsContent = generateIcsContent(options);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute(
    'download',
    `agendamento-${options.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
