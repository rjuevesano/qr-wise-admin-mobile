import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

export const isStrongPassword = (password: string): boolean => {
  // At least 8 chars, 1 uppercase, 1 number, 1 special character
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/.test(password);
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const toTitleCase = (str: string) => {
  return (str || '').replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
};

export const fetchImageFromUri = async (uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

export const maskNumber = (number: string) => {
  const str = number.toString();
  return str.slice(0, -4).replace(/./g, '*') + str.slice(-4);
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getTimeOfDay = (date = new Date()) => {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else {
    return 'evening';
  }
};

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatStringToNumber(str: string) {
  const value = parseFloat((str || '').toString().replace(/,/g, ''));

  if (isNaN(value)) {
    return 0;
  }

  return value;
}
