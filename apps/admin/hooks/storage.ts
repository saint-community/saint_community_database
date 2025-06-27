import { useEffect, useState } from 'react';

export const useLocalStorage = (key: string, canExpire: boolean = false) => {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const item = getItem(key, canExpire);
    if (item) {
      setValue(item as string);
    }
  }, [key, canExpire]);

  const setItem = (v: string, expiresAt?: Date) => {
    localStorage.setItem(key, JSON.stringify({ value: v, expiresAt }));
    setValue(v);
  };

  return [value, setItem] as const;
};

const getItem = (key: string, canExpire: boolean = false) => {
  const item = localStorage.getItem(key);
  if (item) {
    const parsedItem = JSON.parse(item);

    if (canExpire && new Date(parsedItem.expiresAt) < new Date()) {
      localStorage.removeItem(key);
      return null;
    }
    return parsedItem.value;
  }
  return null;
};
