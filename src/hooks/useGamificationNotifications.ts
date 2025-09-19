import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useGamification } from '@/contexts/GamificationContext';
import { GamificationEvent } from '@/types/gamification';

export function useGamificationNotifications() {
  const { events, dismissEvent } = useGamification();
  const processedEventsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // No primeiro carregamento, apenas marcar os eventos como processados sem exibir
    if (isInitialLoadRef.current) {
      events.forEach(event => {
        if (!event.dismissed) {
          processedEventsRef.current.add(event.id);
        }
      });
      isInitialLoadRef.current = false;
      return;
    }

    // Para carregamentos subsequentes, processar apenas eventos novos
    const newEvents = events.filter(e => 
      !e.dismissed && 
      !processedEventsRef.current.has(e.id)
    );
    
    if (newEvents.length > 0) {
      // Marcar eventos como processados
      newEvents.forEach(event => {
        processedEventsRef.current.add(event.id);
      });
      
      // Exibir notificações usando Sonner
      newEvents.forEach(event => {
        const { title, description, icon, value } = getNotificationContent(event);
        
        toast.success(description, {
          title,
          icon,
          duration: 4000,
          action: {
            label: 'Dispensar',
            onClick: () => {
              dismissEvent(event.id);
            }
          },
          ...(value && {
            description: `${description} (+${value})`
          })
        });
      });
    }
  }, [events, dismissEvent]);

  // Limpar cache periodicamente
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (processedEventsRef.current.size > 100) {
        const idsArray = Array.from(processedEventsRef.current);
        processedEventsRef.current.clear();
        idsArray.slice(-50).forEach(id => processedEventsRef.current.add(id));
      }
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return null; // Este hook não renderiza nada
}

function getNotificationContent(event: GamificationEvent) {
  const icon = getEventIcon(event.type);
  const title = getEventTitle(event.type);
  
  return {
    title,
    description: event.message,
    icon,
    value: event.value
  };
}

function getEventIcon(type: string) {
  const icons = {
    'xp_gain': '⭐',
    'qp_gain': '💎',
    'level_up': '👑',
    'achievement_unlock': '🏆',
    'challenge_complete': '🎖️',
    'power_up_activate': '⚡'
  };
  return icons[type as keyof typeof icons] || '⭐';
}

function getEventTitle(type: string) {
  const titles = {
    'xp_gain': 'XP Ganho',
    'qp_gain': 'Pontos de Qualidade',
    'level_up': 'Level Up!',
    'achievement_unlock': 'Conquista Desbloqueada',
    'challenge_complete': 'Desafio Concluído',
    'power_up_activate': 'Power-up Ativado'
  };
  return titles[type as keyof typeof titles] || 'Evento';
}
