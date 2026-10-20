import React, { useState } from 'react';
import { Calendar, Download, Check, ExternalLink } from 'lucide-react';
import { Language, WeddingConfig } from '../../types/wedding';

interface AddToCalendarButtonProps {
  config: WeddingConfig;
  lang: Language;
}

export const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({ config, lang }) => {
  const [downloaded, setDownloaded] = useState(false);

  // Format dates for Google Calendar and iCalendar: YYYYMMDDTHHmmssZ
  const getDates = () => {
    const startStr = `${config.weddingDate}T${config.weddingTime || '17:00'}:00`;
    const startDate = new Date(startStr);
    // 5 hours duration
    const endDate = new Date(startDate.getTime() + 5 * 60 * 60 * 1000);

    const formatCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    return {
      startFormatted: formatCalDate(startDate),
      endFormatted: formatCalDate(endDate),
    };
  };

  const title = lang === 'km'
    ? `ពិធីមង្គលការ: ${config.groomNameKm} & ${config.brideNameKm}`
    : `Wedding Ceremony: ${config.groomNameEn} & ${config.brideNameEn}`;

  const location = `${config.venueNameKm}, ${config.venueAddressKm}`;

  const description = lang === 'km'
    ? `${config.invitationMessageKm}\n\nទីតាំង: ${config.venueNameKm}\nGoogle Maps: ${config.googleMapsUrl}`
    : `${config.invitationMessageEn}\n\nVenue: ${config.venueNameEn}\nGoogle Maps: ${config.googleMapsUrl}`;

  // Google Calendar URL
  const { startFormatted, endFormatted } = getDates();
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(
    description
  )}&location=${encodeURIComponent(location)}`;

  // Download .ics file
  const handleDownloadIcs = () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SereiMongkol//Khmer Digital Wedding Invitation//KM',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:wedding-${config.id}@sereimongkol.app`,
      `DTSTAMP:${startFormatted}`,
      `DTSTART:${startFormatted}`,
      `DTEND:${endFormatted}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${location.replace(/\n/g, ' ')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Wedding-${config.groomNameEn || 'Couple'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a
        href={googleCalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium text-sm shadow-md transition-all hover:shadow-lg active:scale-95"
      >
        <Calendar className="w-4 h-4" />
        <span>{lang === 'km' ? 'កត់ត្រាក្នុង Google Calendar' : 'Add to Google Calendar'}</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </a>

      <button
        onClick={handleDownloadIcs}
        type="button"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-medium text-sm shadow-sm transition-all hover:shadow active:scale-95 cursor-pointer"
      >
        {downloaded ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4 text-amber-700" />}
        <span>{downloaded ? (lang === 'km' ? 'បានទាញយក!' : 'Downloaded!') : (lang === 'km' ? 'ទាញយកឯកសារ Calendar (.ics)' : 'Download iCal (.ics)')}</span>
      </button>
    </div>
  );
};
