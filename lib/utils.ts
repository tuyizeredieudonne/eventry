import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import qs from 'query-string';

import { UrlQueryParams, RemoveUrlQueryParams } from '@/types';

// Utility to merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats a Date object into different representations
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // e.g., 'Mon'
    month: 'short',   // e.g., 'Oct'
    day: 'numeric',   // e.g., '25'
    hour: 'numeric',  // e.g., '8'
    minute: 'numeric',// e.g., '30'
    hour12: true,     // 12-hour clock
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // e.g., 'Mon'
    month: 'short',   // e.g., 'Oct'
    year: 'numeric',  // e.g., '2023'
    day: 'numeric',   // e.g., '25'
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',  // e.g., '8'
    minute: 'numeric',// e.g., '30'
    hour12: true,     // 12-hour clock
  };

  const formattedDateTime = new Date(dateString).toLocaleString('en-US', dateTimeOptions);
  const formattedDate = new Date(dateString).toLocaleString('en-US', dateOptions);
  const formattedTime = new Date(dateString).toLocaleString('en-US', timeOptions);

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// Converts a file object to a temporary URL
export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

// Formats a string price to USD currency
export const formatPrice = (price: string) => {
  const amount = parseFloat(price);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Appends or updates a query parameter in the URL
export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);
  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

// Removes specific keys from the URL query
export function removeKeysFromQuery({ params, keysToRemove }: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(params);
  keysToRemove.forEach(key => delete currentUrl[key]);

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

// Handles errors by logging and rethrowing as a standardized error
export const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(
    error instanceof Error 
      ? error.message
      : typeof error === 'string' 
        ? error 
        : JSON.stringify(error)
  );
}
