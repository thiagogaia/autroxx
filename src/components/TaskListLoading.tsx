import { Card } from '@/components/ui/card';

interface TaskListLoadingProps {
  className?: string;
}

export function TaskListLoading({ className }: TaskListLoadingProps) {
  return (
    <Card className={`p-8 ${className}`}>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </Card>
  );
}
