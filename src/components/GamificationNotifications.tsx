'use client';

import { useGamificationNotifications } from '@/hooks/useGamificationNotifications';

export function GamificationNotifications() {
  useGamificationNotifications();
  return null; // Este componente não renderiza nada visualmente
}