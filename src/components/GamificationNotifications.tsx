'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGamification } from '@/contexts/GamificationContext';
import { GamificationEvent } from '@/types/gamification';
import { X, Star, Gem, Trophy, Zap, Crown, Award } from 'lucide-react';

export function GamificationNotifications() {
  const { events, dismissEvent } = useGamification();
  const [visibleNotifications, setVisibleNotifications] = useState<GamificationEvent[]>([]);

  useEffect(() => {
    const newEvents = events.filter(e => !e.dismissed && !visibleNotifications.some(v => v.id === e.id));
    if (newEvents.length > 0) {
      setVisibleNotifications(prev => [...newEvents, ...prev]);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        newEvents.forEach(event => {
          dismissEvent(event.id);
          setVisibleNotifications(prev => prev.filter(e => e.id !== event.id));
        });
      }, 5000);
    }
  }, [events, dismissEvent]); // Removido visibleNotifications das dependências

  const getEventIcon = (type: string) => {
    const icons = {
      'xp_gain': <Star className="h-5 w-5 text-yellow-500" />,
      'qp_gain': <Gem className="h-5 w-5 text-blue-500" />,
      'level_up': <Crown className="h-5 w-5 text-purple-500" />,
      'achievement_unlock': <Trophy className="h-5 w-5 text-orange-500" />,
      'challenge_complete': <Award className="h-5 w-5 text-green-500" />,
      'power_up_activate': <Zap className="h-5 w-5 text-pink-500" />
    };
    return icons[type as keyof typeof icons] || <Star className="h-5 w-5" />;
  };

  const getEventColor = (type: string) => {
    const colors = {
      'xp_gain': 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800',
      'qp_gain': 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800',
      'level_up': 'border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800',
      'achievement_unlock': 'border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800',
      'challenge_complete': 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800',
      'power_up_activate': 'border-pink-200 bg-pink-50 dark:bg-pink-950/20 dark:border-pink-800'
    };
    return colors[type as keyof typeof colors] || 'border-gray-200 bg-gray-50 dark:bg-gray-950/20 dark:border-gray-800';
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((event) => (
        <Card 
          key={event.id} 
          className={`${getEventColor(event.type)} animate-in slide-in-from-right duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{event.icon}</span>
                  <p className="text-sm font-medium text-foreground">
                    {event.message}
                  </p>
                </div>
                {event.value && (
                  <Badge variant="secondary" className="text-xs">
                    +{event.value}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {event.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  dismissEvent(event.id);
                  setVisibleNotifications(prev => prev.filter(e => e.id !== event.id));
                }}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
