'use client';

import { Achievement } from '@/types/gamification';
// import { SVGInsignia } from './SVGInsignia';
import { AchievementListItem } from './AchievementListItem';
import { AchievementStats } from './AchievementStats';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Grid, List, Trophy, Star } from 'lucide-react';

interface FuturisticAchievementGridProps {
  achievements: Achievement[];
}

export function FuturisticAchievementGrid({ achievements }: FuturisticAchievementGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = achievements.filter(achievement => {
    if (filterType === 'unlocked') return achievement.unlocked;
    if (filterType === 'locked') return !achievement.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      {/* Estatísticas das conquistas */}
      <AchievementStats achievements={achievements} />

      {/* Header com estatísticas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Conquistas
          </h2>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-400/30 text-yellow-200">
              <Trophy className="w-4 h-4 mr-1" />
              {unlockedCount}/{totalCount} Desbloqueadas
            </Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-blue-400/20 to-purple-400/20 border-blue-400/30 text-blue-200">
              <Star className="w-4 h-4 mr-1" />
              {Math.round((unlockedCount / totalCount) * 100)}% Completo
            </Badge>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2">
          {/* Filtros */}
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
            <Button
              variant={filterType === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('all')}
              className="text-xs"
            >
              Todas
            </Button>
            <Button
              variant={filterType === 'unlocked' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('unlocked')}
              className="text-xs"
            >
              Desbloqueadas
            </Button>
            <Button
              variant={filterType === 'locked' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('locked')}
              className="text-xs"
            >
              Bloqueadas
            </Button>
          </div>

          {/* Modo de visualização */}
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid de conquistas */}
      <div className={cn(
        "transition-all duration-500",
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center" 
          : "space-y-4"
      )}>
        {filteredAchievements.map((achievement) => (
          viewMode === 'grid' ? (
            // <SVGInsignia
            //   key={achievement.id}
            //   achievement={achievement}
            // />
            <span style={{ fontSize: '227px' }}>{achievement.icon}</span>
          ) : (
            <AchievementListItem
              key={achievement.id}
              achievement={achievement}
            />
          )
        ))}
      </div>

      {/* Mensagem quando não há conquistas filtradas */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {filterType === 'unlocked' ? 'Nenhuma conquista desbloqueada ainda' : 
             filterType === 'locked' ? 'Todas as conquistas foram desbloqueadas!' : 
             'Nenhuma conquista encontrada'}
          </h3>
          <p className="text-gray-500">
            {filterType === 'unlocked' ? 'Continue trabalhando para desbloquear suas primeiras conquistas!' :
             filterType === 'locked' ? 'Parabéns! Você desbloqueou todas as conquistas disponíveis!' :
             'Tente ajustar os filtros para ver mais conquistas.'}
          </p>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
