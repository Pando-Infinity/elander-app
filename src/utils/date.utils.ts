export const convertSecondsToDayHourMinute = (seconds: number) => {
  const minute = Math.ceil(seconds / 60);
  const hour = Math.ceil(seconds / 3600);
  const day = Math.ceil(seconds / (3600 * 24));
  const month = Math.ceil(seconds / (3600 * 24 * 30));
  const exactDays = seconds / (3600 * 24);
  return { minute, hour, day, month, exactDays };
};

export const convertTimeToDayHourMinute = (seconds: number) => {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  const daysStr = days > 0 ? `${days}d` : '';

  return `${daysStr} ${hours}h ${minutes}m`.trim();
};

export const formatDateToDDMM = (isoDate: string, includeYear = false) => {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return includeYear ? `${day}/${month}/${year}` : `${day}/${month}`;
};

export const formatISOToShortDateTime = (isoDate: string) => {
  const date = new Date(isoDate);

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[date.getUTCMonth()];
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');

  return `${month} ${day} ${hours}:${minutes}:${seconds}`;
};
