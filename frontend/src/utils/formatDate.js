import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date, pattern = 'dd MMM yyyy') => {
  if (!date) return '';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsed) ? format(parsed, pattern) : '';
};

export const formatTime = (date, pattern = 'hh:mm a') => {
  if (!date) return '';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsed) ? format(parsed, pattern) : '';
};

export const formatDateTime = (date) => formatDate(date, 'dd MMM yyyy, hh:mm a');
