/**
 * Generates and triggers download of an .ics (iCalendar) file
 */
export interface IcsEventOptions {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  durationMinutes: number;
}

export const downloadIcsFile = ({
  title,
  description,
  location,
  startDate,
  durationMinutes
}: IcsEventOptions): void => {
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const formatDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/-|:|\.\d+/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SinalizeGO//Agendamento Inteligente//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@sinalizego.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location.replace(/\n/g, ' ')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `agendamento-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
