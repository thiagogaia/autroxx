'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Home, 
  BarChart3, 
  Trophy, 
  Sparkles,
  Spade,
  Menu
} from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataManagementDropdown } from '@/components/DataManagementDropdown';

export function Navigation() {
  const pathname = usePathname();
  const { userStats } = useGamification();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Tarefas', icon: Home },
    { href: '/performance', label: 'Performance', icon: BarChart3 },
    { href: '/reports', label: 'Relatórios', icon: BarChart3 },
    { href: '/essencial', label: 'Essencial', icon: BarChart3 },
    { href: '/gamification', label: 'Forja XP', icon: Trophy },
    { href: '/mementomori', label: 'Memento Mori', icon: Spade }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const closeSheet = () => setIsOpen(false);

  // Renderização dos itens de navegação (reutilizado em desktop e mobile)
  const renderNavItems = (className: string = 'flex items-center gap-2') => (
    <div className={className}>
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link 
          key={href} 
          href={href}
          onClick={closeSheet}
        >
          <Button
            variant={isActive(href) ? 'default' : 'ghost'}
            size="sm"
            className="relative w-full md:w-auto justify-start md:justify-center"
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

  return (
    <nav className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-lg">
      {/* Layout Desktop */}
      <div className="hidden lg:flex items-center gap-2 flex-1">
        {renderNavItems()}
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
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>AATROXX</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6">
              {renderNavItems('flex flex-col gap-2')}
              
              {/* Controles adicionais no mobile */}
              <div className="h-px bg-border" />
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">Configurações</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tema</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dados</span>
                  <DataManagementDropdown />
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
