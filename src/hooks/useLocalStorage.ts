'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar nosso valor
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Função para ler do localStorage
  const readFromStorage = () => {
    try {
      // Só executa no cliente
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // Função para definir valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite que value seja uma função para que tenhamos a mesma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Salva no estado
      setStoredValue(valueToStore);
      
      // Salva no localStorage (só no cliente)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Erro ao salvar no localStorage key "${key}":`, error);
    }
  };

  // Carregar dados do localStorage na inicialização (hidratação)
  useEffect(() => {
    const stored = readFromStorage();
    setStoredValue(stored);
    setIsLoaded(true);
  }, [key]);

  return [storedValue, setValue, isLoaded] as const;
}