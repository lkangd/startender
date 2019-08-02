import dayjs from 'dayjs';

export function formatUpdate(value) {
  const differenceYear = dayjs().year() !== dayjs(value).year();
  if (differenceYear) {
    return dayjs(value).format('on DD MMM YYYY');
  }

  const relativeMonth = dayjs().diff(value, 'month');
  if (relativeMonth > 0) {
    return dayjs(value).format('on DD MMM');
  }

  const relativeDay = dayjs().diff(value, 'day');
  if (relativeDay > 0) {
    if (relativeDay === 1) return 'a day ago';
    return `${relativeDay} days ago`;
  }

  const relativeHour = dayjs().diff(value, 'hour');
  if (relativeHour > 0) {
    if (relativeHour === 1) return 'an hour ago';
    return `${relativeHour} hours ago`;
  }

  const relativeMin = dayjs().diff(value, 'minute');
  if (relativeMin > 0) {
    if (relativeMin === 1) return 'one minute ago';
    return `${relativeMin} minutes ago`;
  }

  const relativeSec = dayjs().diff(value, 'second');
  return `${relativeSec} seconds ago`;
}

export function formatNumber(value = 0) {
  return String(value).replace(/\B(?=(\d{3})+($|\.))/g, ',');
}
