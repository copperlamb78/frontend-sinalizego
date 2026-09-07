/**
 * Utilitários para integração e sincronização com calendários (Google Agenda, Apple Calendar, Outlook)
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
const formatUtcDate = (date: Date): string => {
  return date.toISOString().replace(/-|:|.d+/g, '');
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
 * Gera e dispara o download de arquivo .ics (iCalendar)
 * Compatível nativamente com Apple Calendar (iPhone / iOS / Mac), Microsoft Outlook e demais clientes
 */
export const downloadIcsFile = ({
  title,
  description,
  location,
  startDate,
  durationMinutes,
}: IcsEventOptions): void => {
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SinalizeGO//Agendamento Inteligente//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@sinalizego.com`,
    `DTSTAMP:${formatUtcDate(new Date())}`,
    `DTSTART:${formatUtcDate(startDate)}`,
    `DTEND:${formatUtcDate(endDate)}`,
    `SUMMARY:${title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location.replace(/\n/g, ' ')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute(
    'download',
    `agendamento-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
