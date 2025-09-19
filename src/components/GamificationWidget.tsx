'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/contexts/GamificationContext';
import { 
  Zap, 
  Clock, 
  Shield, 
  Target, 
  BarChart3,
  Sparkles,
  Crown,
  Star,
  Gem,
  Flame,
  Award,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { useState } from 'react';

export function GamificationWidget() {
  const { 
    userStats, 
    events, 
    dismissEvent, 
    activatePowerUp, 
    isPowerUpActive 
  } = useGamification();
  
  const [showDetails, setShowDetails] = useState(false);

  const getLevelIcon = (level: string) => {
    const icons = {
      'novato': <Star className="h-4 w-4" />,
      'desenvolvedor': <Zap className="h-4 w-4" />,
      'especialista': <Target className="h-4 w-4" />,
      'mestre': <Crown className="h-4 w-4" />,
      'lenda': <Award className="h-4 w-4" />
    };
    return icons[level as keyof typeof icons] || <Star className="h-4 w-4" />;
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'novato': 'text-gray-600',
      'desenvolvedor': 'text-blue-600',
      'especialista': 'text-purple-600',
      'mestre': 'text-orange-600',
      'lenda': 'text-yellow-600'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600';
  };

  const recentEvents = events.filter(e => !e.dismissed).slice(0, 3);
  const unlockedAchievements = userStats.achievements.filter(a => a.unlocked);
  const activeChallenges = userStats.weeklyChallenges.filter(c => !c.completed);
  const activePowerUps = userStats.powerUps.filter(p => p.activeUntil && new Date() < p.activeUntil);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Gamificação
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Menos' : 'Mais'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Level and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              {getLevelIcon(userStats.currentLevel)}
              <span className={getLevelColor(userStats.currentLevel)}>
                {userStats.currentLevel.charAt(0).toUpperCase() + userStats.currentLevel.slice(1)}
              </span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              {userStats.totalXP} XP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Gem className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">
              {userStats.totalQP}
            </span>
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <Progress value={userStats.levelProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {userStats.levelProgress.toFixed(0)}% para próximo nível
          </p>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
            Streak: {userStats.weeklyStreak} dias
          </span>
        </div>

        {/* Recent Events */}
        {recentEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Atividades Recentes</h4>
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{event.icon}</span>
                  <span className="text-xs font-medium truncate max-w-[150px]">
                    {event.message}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissEvent(event.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Detailed View */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t border-purple-200 dark:border-purple-800">
            {/* Achievements */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4" />
                Conquistas ({unlockedAchievements.length}/{userStats.achievements.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {userStats.achievements.slice(0, 4).map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-2 rounded-lg text-center ${
                      achievement.unlocked 
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <div className="text-lg mb-1">{achievement.icon}</div>
                    <div className="text-xs font-medium truncate">{achievement.name}</div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-1 mt-1" 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Active Challenges */}
            {activeChallenges.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Desafios Ativos
                </h4>
                {activeChallenges.slice(0, 2).map((challenge) => (
                  <div key={challenge.id} className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{challenge.icon}</span>
                      <span className="text-xs font-medium">{challenge.name}</span>
                    </div>
                    <Progress 
                      value={(challenge.current / challenge.target) * 100} 
                      className="h-1" 
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {challenge.current}/{challenge.target}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active Power-ups */}
            {activePowerUps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Power-ups Ativos
                </h4>
                {activePowerUps.map((powerUp) => (
                  <div key={powerUp.id} className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-300 dark:border-purple-700">
                    <span className="text-sm">{powerUp.icon}</span>
                    <span className="text-xs font-medium flex-1">{powerUp.name}</span>
                    <Badge variant="secondary" className="text-xs">Ativo</Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  {userStats.totalTasksCompleted}
                </div>
                <div className="text-xs text-muted-foreground">Completas</div>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  {userStats.averageAccuracy.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Precisão</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
