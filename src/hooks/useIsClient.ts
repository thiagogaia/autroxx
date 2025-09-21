// useIsClient.ts — Hook para verificar se estamos no lado do cliente
// Evita problemas de hidratação no Next.js

import { useState, useEffect } from 'react';

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
