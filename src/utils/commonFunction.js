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