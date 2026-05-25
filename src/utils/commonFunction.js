export const formatTime12Hour = (time) => {
  const [hour, minute] = time.split(':');

  const date = new Date();
  date.setHours(Number(hour));
  date.setMinutes(Number(minute));

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formattedTime = (date) =>
  new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

export const formattedDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const formatDays = (days) => {
  if (!days || !Array.isArray(days)) return '';
  if (days.length === 7) return 'Open all days';
  return days.map((d) => DAY_NAMES[d]).join(', ');
};

export const latestFormattedTime = (date) => {
  if (!date) return '';

  const timePart = date.split('T')[1];

  if (!timePart) return '';

  let [hours, minutes] = timePart.split(':');

  hours = Number(hours);

  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12;

  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};