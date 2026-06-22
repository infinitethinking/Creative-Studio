function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function generateIcs(booking: {
  id: string;
  serviceName: string;
  practitionerName: string;
  practiceAddress: string;
  practiceCity: string;
  startTime: Date;
  endTime: Date;
  cancelUrl: string;
}): string {
  const location = `${booking.practiceAddress}, ${booking.practiceCity}`;
  const description = `Confirmation #${booking.id}\nAnnuler: ${booking.cancelUrl}`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'PRODID:-//Infinite Thinking//Réservation RDV//FR',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(booking.id)}@infinitethinking.ch`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(booking.startTime)}`,
    `DTEND:${formatIcsDate(booking.endTime)}`,
    `SUMMARY:${escapeIcsText(`${booking.serviceName} — ${booking.practitionerName}`)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel: votre rendez-vous est demain',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel: votre rendez-vous commence dans 2 heures',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return `${lines.join('\r\n')}\r\n`;
}
