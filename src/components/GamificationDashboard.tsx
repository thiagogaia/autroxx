'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useGamification } from '@/contexts/GamificationContext';
import { 
  Trophy, 
  Star, 
  Gem, 
  Zap, 
  Shield, 
  Target, 
  TrendingUp,
  Award,
  Crown,
  Sparkles,
  Flame,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  ZapIcon
} from 'lucide-react';
import { useState } from 'react';
import { DiscordInsignia, FireInsignia, HydroInsignia, SpaceInsignia, ThunderInsignia, TrophyInsignia } from './insignias';

export function GamificationDashboard() {
  const { 
    userStats, 
    events, 
    dismissEvent, 
    activatePowerUp, 
    isPowerUpActive,
    getLeaderboard 
  } = useGamification();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges' | 'leaderboard'>('overview');

  const getLevelIcon = (level: string) => {
    const icons = {
      'novato': <Star className="h-4 w-4" />,
      'desenvolvedor': <Zap className="h-4 w-4" />,
      'especialista': <Target className="h-4 w-4" />,
      'mestre': <Crown className="h-4 w-4" />,
      'lenda': <Trophy className="h-4 w-4" />
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

  const getRankIcon = (rank: string) => {
    const icons = {
      'bug_hunter': <AlertCircle className="h-4 w-4" />,
      'documentador': <CheckCircle className="h-4 w-4" />,
      'speed_demon': <Zap className="h-4 w-4" />,
      'estimador': <Target className="h-4 w-4" />,
      'defensor': <Shield className="h-4 w-4" />,
      'none': null
    };
    return icons[rank as keyof typeof icons];
  };

  const getRankColor = (rank: string) => {
    const colors = {
      'bug_hunter': 'text-red-600',
      'documentador': 'text-blue-600',
      'speed_demon': 'text-yellow-600',
      'estimador': 'text-green-600',
      'defensor': 'text-purple-600',
      'none': 'text-gray-600'
    };
    return colors[rank as keyof typeof colors] || 'text-gray-600';
  };

  const recentEvents = events.filter(e => !e.dismissed).slice(0, 5);
  const unlockedAchievements = userStats.achievements.filter(a => a.unlocked);
  const activeChallenges = userStats.weeklyChallenges.filter(c => !c.completed);
  const activePowerUps = userStats.powerUps.filter(p => p.activeUntil && new Date() < p.activeUntil);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Templo dos Heróis</h2>
            <p className="text-sm text-muted-foreground">Transforme produtividade em diversão</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            {getLevelIcon(userStats.currentLevel)}
            <span className={getLevelColor(userStats.currentLevel)}>
              {userStats.currentLevel.charAt(0).toUpperCase() + userStats.currentLevel.slice(1)}
            </span>
          </Badge>
          {userStats.currentRank !== 'none' && (
            <Badge variant="secondary" className="gap-1">
              {getRankIcon(userStats.currentRank)}
              <span className={getRankColor(userStats.currentRank)}>
                {userStats.currentRank.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{userStats.totalXP}</span>
            </div>
            <p className="text-sm text-muted-foreground">XP Total</p>
            <Progress value={userStats.levelProgress} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.levelProgress.toFixed(0)}% para próximo nível
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Gem className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{userStats.totalQP}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pontos de Qualidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{userStats.weeklyStreak}</span>
            </div>
            <p className="text-sm text-muted-foreground">Streak Atual</p>
            <p className="text-xs text-muted-foreground">
              Melhor: {userStats.longestStreak} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{unlockedAchievements.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Conquistas</p>
            <p className="text-xs text-muted-foreground">
              {userStats.achievements.length - unlockedAchievements.length} restantes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
          { id: 'achievements', label: 'Conquistas', icon: Trophy },
          { id: 'challenges', label: 'Desafios', icon: Target },
          { id: 'leaderboard', label: 'Ranking', icon: Crown }
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(id as any)}
            className="flex-1"
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{event.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{event.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissEvent(event.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma atividade recente
                </p>
              )}
            </CardContent>
          </Card>

          {/* Active Power-ups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Power-ups Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activePowerUps.length > 0 ? (
                activePowerUps.map((powerUp) => (
                  <div key={powerUp.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{powerUp.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{powerUp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Ativo até {powerUp.activeUntil!.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Ativo</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum power-up ativo
                </p>
              )}
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estatísticas de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {userStats.totalTasksCompleted}
                  </div>
                  <p className="text-sm text-muted-foreground">Tarefas Completas</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {userStats.averageAccuracy.toFixed(0)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Precisão Média</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(userStats.averageCompletionTime / 60)}h
                  </div>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {userStats.impedimentFreeWeeks}
                  </div>
                  <p className="text-sm text-muted-foreground">Semanas Livres</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userStats.achievements.map((achievement) => (
            <Card key={achievement.id} className={achievement.unlocked ? 'ring-2 ring-yellow-500' : ''}>
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-3 mb-3">
                  <span className="text-2xl">
                    {achievement.unlocked ? (
                      <>
                        {achievement.id === 'first_task' ? (
                          <SpaceInsignia 
                            rocketType="explorer"
                            showText={false}
                            size="large"
                          />
                        ) : (
                          <>
                            {achievement.id === 'speed_of_light' ? (
                              <DiscordInsignia
                                badgeType="nitro"
                                showText={false}
                                text="Nitro"
                                showTyping={false}
                              />
                            ) : achievement.id === 'streak_master' ? (
                              <FireInsignia
                                fireType="inferno"
                                showText={false}
                              />
                            ) : achievement.id === 'task_master' ? (
                              <TrophyInsignia
                                trophyType="legendary"
                                showText={false}
                              />
                            ) : achievement.id === 'impediment_zero' ? (
                              <DiscordInsignia
                                badgeType="partner"
                                showText={false}
                                text="Partner"
                                showTyping={false}
                              />
                            ) : achievement.id === 'perfectionist' ? (
                              <DiscordInsignia
                                badgeType="partner"
                                showText={false}
                                text="Partner"
                                showTyping={false}
                              />
                            ) : achievement.id === 'organizer' ? (
                              <HydroInsignia
                                waterType="hydro"
                                showText={false}
                              />
                            ) : achievement.id === 'efficiency_master' ? (
                              <DiscordInsignia
                                badgeType="partner"
                                showText={false}
                                text="Developer"
                                showTyping={false}
                              />
                            ) : achievement.id === 'quick_draw' ? (
                              <DiscordInsignia
                                badgeType="moderator"
                                showText={false}
                                text="Developer"
                                showTyping={false}
                              />
                            ) : achievement.id === 'bug_hunter' ? (
                              <DiscordInsignia
                                badgeType="developer"
                                showText={false}
                                text="Developer"
                                showTyping={false}
                              />
                            ) : achievement.id === 'documentation_guru' ? (
                              <DiscordInsignia
                                badgeType="developer"
                                showText={false}
                                text="Developer"
                                showTyping={false}
                              />
                            ) : achievement.id === 'development_wizard' || true ? (
                              <ThunderInsignia
                                thunderType="storm"
                                showText={false}
                              />
                            ) : (
                              <span style={{ fontSize: '227px' }}>{achievement.icon}</span>
                            )}
                            
                          </>
                        )}
                      </>
                    ) : (
                      <span style={{ fontSize: '227px' }}>{achievement.icon}</span>
                    )}
                    
                  </span>
                  <div className="flex w-full flex-start justify-between items-center gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Desbloqueada
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-2" 
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                    <span>+{achievement.xpReward} XP</span>
                  </div>
                </div>
                
                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Desbloqueada em {achievement.unlockedAt.toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Desafios Semanais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userStats.weeklyChallenges.map((challenge) => (
                <div key={challenge.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{challenge.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium">{challenge.name}</h3>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    {challenge.completed && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Concluído
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={(challenge.current / challenge.target) * 100} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-sm">
                      <span>{challenge.current}/{challenge.target}</span>
                      <span className="text-muted-foreground">
                        Expira em {Math.ceil((challenge.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Recompensa: +{challenge.xpReward} XP</span>
                    <span>+{challenge.qpReward} QP</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(['xp', 'accuracy', 'speed', 'quality'] as const).map((type) => {
            const leaderboard = getLeaderboard(type);
            const typeLabels = {
              xp: 'XP Total',
              accuracy: 'Precisão',
              speed: 'Velocidade',
              quality: 'Qualidade'
            };
            
            return (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Ranking - {typeLabels[type]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.rank} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <span className="text-sm font-bold">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : entry.rank}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{entry.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {type === 'xp' ? `${entry.value} XP` :
                           type === 'accuracy' ? `${entry.value}%` :
                           type === 'speed' ? `${Math.round(entry.value / 60)}h` :
                           `${entry.value} semanas`}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {entry.level.charAt(0).toUpperCase() + entry.level.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
