'use client';

import { Achievement } from '@/types/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Shield, Target, TrendingUp } from 'lucide-react';

interface AchievementStatsProps {
  achievements: Achievement[];
}

export function AchievementStats({ achievements }: AchievementStatsProps) {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  
  const achievementsByType = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.type]) {
      acc[achievement.type] = { total: 0, unlocked: 0 };
    }
    acc[achievement.type].total++;
    if (achievement.unlocked) {
      acc[achievement.type].unlocked++;
    }
    return acc;
  }, {} as Record<string, { total: number; unlocked: number }>);

  const totalXP = unlockedAchievements.reduce((sum, a) => sum + a.xpReward, 0);
  const totalQP = unlockedAchievements.reduce((sum, a) => sum + a.qpReward, 0);

  const getTypeIcon = (type: string) => {
    const icons = {
      'produtividade': <Zap className="h-4 w-4 text-blue-400" />,
      'qualidade': <Shield className="h-4 w-4 text-emerald-400" />,
      'eficiencia': <TrendingUp className="h-4 w-4 text-purple-400" />,
      'consistencia': <Target className="h-4 w-4 text-orange-400" />,
      'especializacao': <Star className="h-4 w-4 text-yellow-400" />
    };
    return icons[type as keyof typeof icons] || <Star className="h-4 w-4" />;
  };

  const getTypeName = (type: string) => {
    const names = {
      'produtividade': 'Produtividade',
      'qualidade': 'Qualidade',
      'eficiencia': 'Eficiência',
      'consistencia': 'Consistência',
      'especializacao': 'Especialização'
    };
    return names[type as keyof typeof names] || type;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Estatísticas Gerais */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-200 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Conquistas Totais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {unlockedAchievements.length}/{achievements.length}
          </div>
          <Progress 
            value={(unlockedAchievements.length / achievements.length) * 100} 
            className="h-2 mt-2 bg-blue-900/30" 
          />
          <p className="text-xs text-blue-300 mt-1">
            {Math.round((unlockedAchievements.length / achievements.length) * 100)}% completo
          </p>
        </CardContent>
      </Card>

      {/* XP Total */}
      <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-yellow-200 flex items-center gap-2">
            <Star className="h-4 w-4" />
            XP Ganho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {totalXP.toLocaleString()}
          </div>
          <p className="text-xs text-yellow-300 mt-1">
            De conquistas desbloqueadas
          </p>
        </CardContent>
      </Card>

      {/* QP Total */}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-emerald-200 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            QP Ganho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {totalQP.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-300 mt-1">
            Pontos de qualidade
          </p>
        </CardContent>
      </Card>

      {/* Conquistas Recentes */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-200 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {unlockedAchievements.filter(a => 
              a.unlockedAt && 
              new Date().getTime() - a.unlockedAt.getTime() < 7 * 24 * 60 * 60 * 1000
            ).length}
          </div>
          <p className="text-xs text-purple-300 mt-1">
            Esta semana
          </p>
        </CardContent>
      </Card>

      {/* Breakdown por Tipo */}
      <div className="md:col-span-2 lg:col-span-4">
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Progresso por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(achievementsByType).map(([type, stats]) => (
                <div key={type} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    <span className="text-sm font-medium text-gray-300">
                      {getTypeName(type)}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {stats.unlocked}/{stats.total}
                  </div>
                  <Progress 
                    value={(stats.unlocked / stats.total) * 100} 
                    className="h-2 bg-gray-700" 
                  />
                  <div className="text-xs text-gray-400">
                    {Math.round((stats.unlocked / stats.total) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
