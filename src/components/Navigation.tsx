'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  BarChart3, 
  Trophy, 
  Sparkles,
  Spade,
  Menu,
  Settings,
  Database,
  Zap,
  TrendingUp,
  FileText,
  Star
} from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataManagementDropdown } from '@/components/DataManagementDropdown';

export function Navigation() {
  const pathname = usePathname();
  const { userStats } = useGamification();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { 
      href: '/', 
      label: 'Tarefas', 
      icon: Home, 
      description: 'Gerenciar suas tarefas',
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      href: '/performance', 
      label: 'Performance', 
      icon: TrendingUp, 
      description: 'Análise de performance',
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      href: '/reports', 
      label: 'Relatórios', 
      icon: FileText, 
      description: 'Relatórios detalhados',
      color: 'text-purple-600 dark:text-purple-400'
    },
    { 
      href: '/essencial', 
      label: 'Essencial', 
      icon: Zap, 
      description: 'Funcionalidades essenciais',
      color: 'text-orange-600 dark:text-orange-400'
    },
    { 
      href: '/gamification', 
      label: 'Forja XP', 
      icon: Trophy, 
      description: 'Sistema de gamificação',
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      href: '/mementomori', 
      label: 'Memento Mori', 
      icon: Spade, 
      description: 'Contemplação da mortalidade',
      color: 'text-gray-600 dark:text-gray-400'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const closeSheet = () => setIsOpen(false);

  // Renderização dos itens de navegação desktop (versão compacta)
  const renderDesktopNavItems = () => (
    <div className="flex items-center gap-2">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link 
          key={href} 
          href={href}
        >
          <Button
            variant={isActive(href) ? 'default' : 'ghost'}
            size="sm"
            className="relative"
          >
            <Icon className="h-4 w-4 mr-2" />
            <span className="truncate">{label}</span>
            {href === '/gamification' && userStats.totalXP > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white shrink-0"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {userStats.totalXP}
              </Badge>
            )}
          </Button>
        </Link>
      ))}
    </div>
  );

  // Renderização dos itens de navegação mobile (versão sidebar moderna)
  const renderMobileNavItems = () => (
    <div className="flex flex-col space-y-2">
      {navItems.map(({ href, label, icon: Icon, description, color }) => (
        <Link 
          key={href} 
          href={href}
          onClick={closeSheet}
          className="block"
        >
          <div className={`
            group relative flex items-center gap-4 rounded-lg px-4 py-3 
            transition-all duration-200 hover:bg-accent hover:text-accent-foreground
            ${isActive(href) 
              ? 'bg-accent text-accent-foreground shadow-sm border border-border' 
              : 'text-muted-foreground hover:text-foreground'
            }
          `}>
            <div className={`
              flex h-10 w-10 items-center justify-center rounded-lg
              ${isActive(href) 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-background group-hover:bg-accent'
              }
            `}>
              <Icon className={`h-5 w-5 ${isActive(href) ? '' : color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{label}</span>
                {href === '/gamification' && userStats.totalXP > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {userStats.totalXP}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <nav className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-lg">
      {/* Layout Desktop */}
      <div className="hidden lg:flex items-center gap-2 flex-1">
        {renderDesktopNavItems()}
      </div>

      {/* Layout Mobile - Menu Hambúrguer */}
      <div className="flex lg:hidden items-center gap-2 flex-1 justify-between">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu de navegação</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="space-y-0 p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                  <span className="text-xl font-bold text-white">A</span>
                </div>
                <div>
                  <SheetTitle className="text-lg font-bold">AATROXX</SheetTitle>
                  <p className="text-xs text-muted-foreground">Task Manager</p>
                </div>
              </div>
            </SheetHeader>

            {/* Usuário/Avatar Section */}
            {userStats.totalXP > 0 && (
              <div className="p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {userStats.totalXP} XP
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Level Explorer</p>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Principal */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="space-y-1">
                  <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Navegação
                  </h3>
                  <div className="mt-3">
                    {renderMobileNavItems()}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer com Configurações */}
            <div className="border-t border-border p-6">
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Configurações
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-4 rounded-lg px-4 py-3 hover:bg-accent transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Tema</div>
                      <div className="text-xs opacity-70">Aparência visual</div>
                    </div>
                    <ThemeToggle />
                  </div>
                  
                  <div className="flex items-center gap-4 rounded-lg px-4 py-3 hover:bg-accent transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                      <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Dados</div>
                      <div className="text-xs opacity-70">Gerenciar dados</div>
                    </div>
                    <DataManagementDropdown />
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Espaço para título/logo em mobile se necessário */}
        <div className="flex-1 text-center">
          <span className="font-medium">AATROXX</span>
        </div>
      </div>

      {/* Controles cabeçalho - Desktop */}
      <div className="hidden lg:flex items-center gap-2">
        <DataManagementDropdown />
        <ThemeToggle />
      </div>
    </nav>
  );
}
