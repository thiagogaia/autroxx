'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  BarChart3, 
  Trophy, 
  Settings,
  Sparkles
} from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';

export function Navigation() {
  const pathname = usePathname();
  const { userStats } = useGamification();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/reports', label: 'Relatórios', icon: BarChart3 },
    { href: '/reports2', label: 'Essencial', icon: BarChart3 },
    { href: '/gamification', label: 'Gamificação', icon: Trophy },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href}>
          <Button
            variant={isActive(href) ? 'default' : 'ghost'}
            size="sm"
            className="relative"
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
            {href === '/gamification' && userStats.totalXP > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {userStats.totalXP}
              </Badge>
            )}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
