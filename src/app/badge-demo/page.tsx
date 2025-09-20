'use client';

import { BadgeCard, BadgeType } from '@/components/BadgeCard';
import { BadgeProvider, useBadge } from '@/contexts/BadgeContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function BadgeDemo() {
  const { badgeCollection, notifications, stats } = useBadge();
  const [selectedType, setSelectedType] = useState<BadgeType>('elite');
  const [showAnimation, setShowAnimation] = useState(true);

  const badgeTypes: BadgeType[] = ['elite', 'royal', 'mystic', 'cosmic', 'legendary', 'discord'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Importar CSS dos efeitos */}
      <style jsx global>{`
        @import url('/src/app/badge-card.css');
      `}</style>
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Sistema de Insígnias
          </h1>
          <p className="text-xl text-gray-300">
            Cartões de premiação com efeitos de céu noturno estrelado
          </p>
        </div>

        {/* Estatísticas */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Estatísticas da Coleção</CardTitle>
            <CardDescription className="text-gray-300">
              Progresso geral dos badges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{badgeCollection.totalBadges}</div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{badgeCollection.unlockedBadges}</div>
                <div className="text-sm text-gray-400">Desbloqueados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{Math.round(badgeCollection.completionPercentage)}%</div>
                <div className="text-sm text-gray-400">Completos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.totalXPFromBadges}</div>
                <div className="text-sm text-gray-400">XP Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controles */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Controles de Demonstração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {badgeTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAnimation(!showAnimation)}
              >
                {showAnimation ? 'Desativar' : 'Ativar'} Animações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demonstração do BadgeCard */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Demonstração do BadgeCard</CardTitle>
            <CardDescription className="text-gray-300">
              Clique e mova o mouse sobre o badge para ver os efeitos interativos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="badge-card-container rounded-lg p-8">
              <BadgeCard
                type={selectedType}
                title={`Badge ${selectedType}`}
                description={`Descrição do badge ${selectedType}`}
                isUnlocked={true}
                showAnimation={showAnimation}
                onClick={() => {
                  console.log(`Badge ${selectedType} clicado!`);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Badges por Categoria */}
        <Tabs defaultValue="achievement" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            <TabsTrigger value="achievement">Conquistas</TabsTrigger>
            <TabsTrigger value="milestone">Marcos</TabsTrigger>
            <TabsTrigger value="special">Especiais</TabsTrigger>
            <TabsTrigger value="seasonal">Sazonais</TabsTrigger>
            <TabsTrigger value="event">Eventos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="achievement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badgeCollection.badges
                .filter(badge => badge.category === 'achievement')
                .map((badge) => (
                  <Card key={badge.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{badge.title}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {badge.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center">
                        <div className="badge-card-container rounded-lg p-4 scale-75">
                          <BadgeCard
                            type={badge.type}
                            title={badge.title}
                            description={badge.description}
                            isUnlocked={badge.isUnlocked}
                            showAnimation={showAnimation}
                            onClick={() => {
                              console.log(`Badge ${badge.title} clicado!`);
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className="capitalize">
                            {badge.rarity}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {badge.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">
                          Progresso: {badge.progress}/{badge.maxProgress}
                        </div>
                        {badge.isUnlocked && badge.unlockedAt && (
                          <div className="text-xs text-green-400">
                            Desbloqueado em {badge.unlockedAt.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="milestone" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badgeCollection.badges
                .filter(badge => badge.category === 'milestone')
                .map((badge) => (
                  <Card key={badge.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{badge.title}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {badge.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center">
                        <div className="badge-card-container rounded-lg p-4 scale-75">
                          <BadgeCard
                            type={badge.type}
                            title={badge.title}
                            description={badge.description}
                            isUnlocked={badge.isUnlocked}
                            showAnimation={showAnimation}
                            onClick={() => {
                              console.log(`Badge ${badge.title} clicado!`);
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className="capitalize">
                            {badge.rarity}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {badge.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">
                          Progresso: {badge.progress}/{badge.maxProgress}
                        </div>
                        {badge.isUnlocked && badge.unlockedAt && (
                          <div className="text-xs text-green-400">
                            Desbloqueado em {badge.unlockedAt.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
          
          {/* Outras abas podem ser implementadas de forma similar */}
          <TabsContent value="special" className="text-center text-gray-400 py-8">
            Badges especiais em breve...
          </TabsContent>
          <TabsContent value="seasonal" className="text-center text-gray-400 py-8">
            Badges sazonais em breve...
          </TabsContent>
          <TabsContent value="event" className="text-center text-gray-400 py-8">
            Badges de eventos em breve...
          </TabsContent>
        </Tabs>

        {/* Notificações */}
        {notifications.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Notificações Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications
                .filter(notification => !notification.dismissed)
                .slice(0, 5)
                .map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{notification.title}</div>
                      <div className="text-gray-400 text-sm">{notification.message}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Implementar dismissNotification
                        console.log('Dismiss notification:', notification.id);
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function BadgeDemoPage() {
  return (
    <BadgeProvider>
      <BadgeDemo />
    </BadgeProvider>
  );
}
