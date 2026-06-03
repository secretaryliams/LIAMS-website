const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatEventDateParts(eventDate) {
  if (!eventDate) {
    return { year: '—', day: '—', month: 'TBD' };
  }
  const d = new Date(`${eventDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) {
    return { year: '—', day: '—', month: 'TBD' };
  }
  return {
    year: String(d.getFullYear()),
    day: String(d.getDate()).padStart(2, '0'),
    month: MONTHS[d.getMonth()],
  };
}

export function formatEventDateLabel(eventDate) {
  const { day, month, year } = formatEventDateParts(eventDate);
  if (day === '—') return 'Date TBD';
  return `${day} ${month} ${year}`;
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return 'TBD';
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return 'TBD';
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function isRegistrationClosed(registrationEndDateStr) {
  if (!registrationEndDateStr) return false;
  
  // Get current date set to midnight in local time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get registration end date set to midnight
  const regEnd = new Date(`${registrationEndDateStr}T00:00:00`);
  
  return today > regEnd;
}
