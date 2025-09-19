import { GamificationDashboard } from '@/components/GamificationDashboard';
import { GamificationWidget } from '@/components/GamificationWidget';
import { Navigation } from '@/components/Navigation';

export default function GamificationPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Navigation />
        <GamificationDashboard />
        {/* Gamificação */}
        <GamificationWidget />
      </div>
    </div>
  );
}
