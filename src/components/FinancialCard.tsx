import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FinancialCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

const FinancialCard = ({ title, value, icon, trend, className }: FinancialCardProps) => {
  return (
    <Card className={cn("bg-gradient-card text-primary-foreground shadow-card border-0", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium opacity-90">{title}</CardTitle>
        <div className="text-primary-foreground/80">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs mt-1",
            trend.isPositive ? "text-green-200" : "text-red-200"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value} este mês
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialCard;