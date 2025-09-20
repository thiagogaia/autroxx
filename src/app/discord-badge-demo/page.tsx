'use client';

import { BadgeCard } from '@/components/BadgeCard';
import { BadgeProvider, useBadge } from '@/contexts/BadgeContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function DiscordBadgeDemo() {
  const { badgeCollection } = useBadge();
  const [showAnimation, setShowAnimation] = useState(true);

  const discordBadges = badgeCollection.badges.filter(badge => badge.type === 'discord');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#36393f] via-[#2f3136] to-[#202225] p-8">
      {/* Importar CSS dos efeitos */}
      <style jsx global>{`
        @import url('/src/app/badge-card.css');
      `}</style>
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Discord Badge Collection
          </h1>
          <p className="text-xl text-[#b9bbbe]">
            Insígnias especiais com design Discord oficial
          </p>
        </div>

        {/* Controles */}
        <Card className="bg-[#4f545c]/50 border-[#5865f2]/30">
          <CardHeader>
            <CardTitle className="text-white">Controles de Demonstração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAnimation(!showAnimation)}
                className="bg-[#5865f2] hover:bg-[#4752c4] text-white border-[#5865f2]"
              >
                {showAnimation ? 'Desativar' : 'Ativar'} Animações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demonstração Principal */}
        <Card className="bg-[#4f545c]/50 border-[#5865f2]/30">
          <CardHeader>
            <CardTitle className="text-white">Elite Guardian Badge</CardTitle>
            <CardDescription className="text-[#b9bbbe]">
              Clique e mova o mouse sobre o badge para ver os efeitos Discord
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="badge-card-container rounded-lg p-8 discord-pattern">
              <BadgeCard
                type="discord"
                title="Elite Guardian"
                description="Guardião Elite do Discord"
                isUnlocked={true}
                showAnimation={showAnimation}
                onClick={() => {
                  console.log('Discord badge clicado!');
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Características Especiais */}
        <Card className="bg-[#4f545c]/50 border-[#5865f2]/30">
          <CardHeader>
            <CardTitle className="text-white">Características Especiais</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="text-white font-semibold">🎨 Design Circular</h3>
              <p className="text-[#b9bbbe] text-sm">
                Formato circular com gradiente azul Discord característico
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-semibold">🛡️ Escudo Animado</h3>
              <p className="text-[#b9bbbe] text-sm">
                SVG do escudo com gema central rotativa e estrelas decorativas
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-semibold">✨ Indicador de Boost</h3>
              <p className="text-[#b9bbbe] text-sm">
                Ícone de boost no canto superior esquerdo com animação de brilho
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-semibold">🔔 Notificação</h3>
              <p className="text-[#b9bbbe] text-sm">
                Badge de notificação no canto superior direito com pulso
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-semibold">🔄 Anel Orbital</h3>
              <p className="text-[#b9bbbe] text-sm">
                Anel rotativo ao redor do badge com gradiente Discord
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-semibold">⌨️ Indicador de Digitação</h3>
              <p className="text-[#b9bbbe] text-sm">
                Aparece no hover com animação de pontos saltitantes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Badges Discord Disponíveis */}
        {discordBadges.length > 0 && (
          <Card className="bg-[#4f545c]/50 border-[#5865f2]/30">
            <CardHeader>
              <CardTitle className="text-white">Badges Discord Disponíveis</CardTitle>
              <CardDescription className="text-[#b9bbbe]">
                Coleção completa de badges com tema Discord
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {discordBadges.map((badge) => (
                <div key={badge.id} className="flex items-center space-x-6 p-4 bg-[#36393f]/50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="badge-card-container rounded-lg p-2 scale-50">
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
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold">{badge.title}</h3>
                      <span className="px-2 py-1 bg-[#5865f2] text-white text-xs rounded capitalize">
                        {badge.rarity}
                      </span>
                    </div>
                    <p className="text-[#b9bbbe] text-sm">{badge.description}</p>
                    <div className="text-sm text-[#b9bbbe]">
                      Progresso: {badge.progress}/{badge.maxProgress}
                    </div>
                    {badge.isUnlocked && badge.unlockedAt && (
                      <div className="text-xs text-green-400">
                        Desbloqueado em {badge.unlockedAt.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Informações Técnicas */}
        <Card className="bg-[#4f545c]/50 border-[#5865f2]/30">
          <CardHeader>
            <CardTitle className="text-white">Informações Técnicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Cores Discord</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-[#7289da] rounded"></div>
                    <span className="text-[#b9bbbe]">#7289da - Azul Principal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-[#5865f2] rounded"></div>
                    <span className="text-[#b9bbbe]">#5865f2 - Azul Secundário</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-[#f04747] rounded"></div>
                    <span className="text-[#b9bbbe]">#f04747 - Vermelho Notificação</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-[#ff73fa] rounded"></div>
                    <span className="text-[#b9bbbe]">#ff73fa - Rosa Boost</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Animações</h3>
                <div className="space-y-1 text-sm text-[#b9bbbe]">
                  <div>• discordPulse - Pulso no clique</div>
                  <div>• waveRipple - Ondas concêntricas</div>
                  <div>• ringRotate - Rotação do anel</div>
                  <div>• notificationPulse - Pulso da notificação</div>
                  <div>• boostShine - Brilho do boost</div>
                  <div>• typingBounce - Pontos de digitação</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DiscordBadgeDemoPage() {
  return (
    <BadgeProvider>
      <DiscordBadgeDemo />
    </BadgeProvider>
  );
}
