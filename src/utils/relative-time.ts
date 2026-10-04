const MS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;
const DAYS_IN_YEAR = 365;
const MAX_WEEKS = 3;
const MAX_MONTHS = 11;

function plural(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
}

export function formatRelativeTime(isoDate: string, now: number = Date.now()): string {
  const timestamp = Date.parse(isoDate);
  if (Number.isNaN(timestamp)) {
    return '';
  }

  const minutes = Math.floor((now - timestamp) / (MS_IN_SECOND * SECONDS_IN_MINUTE));
  if (minutes < 1) {
    return 'just now';
  }

  if (minutes < MINUTES_IN_HOUR) {
    return plural(minutes, 'minute');
  }

  const hours = Math.floor(minutes / MINUTES_IN_HOUR);
  if (hours < HOURS_IN_DAY) {
    return plural(hours, 'hour');
  }

  const days = Math.floor(hours / HOURS_IN_DAY);
  if (days < DAYS_IN_WEEK) {
    return plural(days, 'day');
  }

  if (days < DAYS_IN_MONTH) {
    return plural(Math.min(Math.floor(days / DAYS_IN_WEEK), MAX_WEEKS), 'week');
  }

  if (days < DAYS_IN_YEAR) {
    return plural(Math.min(Math.floor(days / DAYS_IN_MONTH), MAX_MONTHS), 'month');
  }

  return plural(Math.floor(days / DAYS_IN_YEAR), 'year');
}
