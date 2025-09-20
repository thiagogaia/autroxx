'use client';

import { Achievement } from '@/types/gamification';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AchievementListItemProps {
  achievement: Achievement;
}

export function AchievementListItem({ achievement }: AchievementListItemProps) {
  const getAchievementTheme = (type: string) => {
    const themes = {
      'produtividade': {
        name: 'Speed Master',
        icon: '🤖',
        color: '#ffd700',
        description: 'Máquina de velocidade'
      },
      'qualidade': {
        name: 'Crystal Guard',
        icon: '💎',
        color: '#00d4ff',
        description: 'Guardião cristalino'
      },
      'eficiencia': {
        name: 'Neural Core',
        icon: '🧠',
        color: '#9d4edd',
        description: 'Núcleo neural'
      },
      'consistencia': {
        name: 'Flame Keeper',
        icon: '🔥',
        color: '#ff6b35',
        description: 'Guardião da chama'
      },
      'especializacao': {
        name: 'Lightning Lord',
        icon: '⚡',
        color: '#ffd700',
        description: 'Senhor do raio'
      }
    };
    return themes[type as keyof typeof themes] || themes.produtividade;
  };

  const theme = getAchievementTheme(achievement.type);
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg border transition-all duration-300",
      achievement.unlocked 
        ? "bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50" 
        : "bg-gray-900/30 border-gray-800/50"
    )}>
      {/* Ícone da insignia */}
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center text-2xl",
        achievement.unlocked 
          ? "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-lg animate-pulse-gentle" 
          : "bg-gray-700 text-gray-500"
      )}>
        {theme.icon}
      </div>

      {/* Informações da conquista */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={cn(
            "font-semibold",
            achievement.unlocked ? "text-white" : "text-gray-400"
          )}>
            {achievement.unlocked ? theme.name : achievement.name}
          </h3>
          {achievement.unlocked && (
            <Badge className="bg-yellow-400/20 text-yellow-200 border-yellow-400/30 text-xs">
              Desbloqueada
            </Badge>
          )}
        </div>
        
        <p className={cn(
          "text-sm mb-2",
          achievement.unlocked ? "text-gray-300" : "text-gray-500"
        )}>
          {achievement.unlocked ? theme.description : achievement.description}
        </p>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress 
            value={progressPercentage} 
            className={cn(
              "h-2",
              achievement.unlocked ? "bg-white/20" : "bg-gray-700"
            )}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{achievement.progress}/{achievement.maxProgress}</span>
            {achievement.unlocked && (
              <span className="text-yellow-400">+{achievement.xpReward} XP</span>
            )}
          </div>
        </div>

        {/* Data de desbloqueio */}
        {achievement.unlocked && achievement.unlockedAt && (
          <p className="text-xs text-gray-400 mt-1">
            Desbloqueada em {achievement.unlockedAt.toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
