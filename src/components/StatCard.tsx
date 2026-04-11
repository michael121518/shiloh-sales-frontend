import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, className }: Props) => (
  <div className={cn("glass-card rounded-xl p-5 space-y-3 animate-fade-in", className)}>
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {subtitle && (
      <p className={cn(
        "text-xs",
        trend === "up" && "text-success",
        trend === "down" && "text-destructive",
        (!trend || trend === "neutral") && "text-muted-foreground"
      )}>
        {subtitle}
      </p>
    )}
  </div>
);

export default StatCard;
