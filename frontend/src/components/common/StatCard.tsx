import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: string;
  variant?: "default" | "primary" | "secondary" | "accent";
}

const variantStyles = {
  default: "bg-card shadow-card",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
};

const iconBgStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary-foreground/20 text-primary-foreground",
  secondary: "bg-secondary-foreground/20 text-secondary-foreground",
  accent: "bg-accent-foreground/20 text-accent-foreground",
};

export function StatCard({ title, value, icon, description, trend, variant = "default" }: StatCardProps) {
  const isColored = variant !== "default";

  return (
    <div className={cn("rounded-xl p-5 animate-fade-up", variantStyles[variant])}>
      
      <div className="flex items-start justify-between">

        <div>
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0" , iconBgStyles[variant])}>
          {icon}
         </div>
          <p className={cn("text-sm font-medium", isColored ? "opacity-80" : "text-muted-foreground")}>{title}</p>
          <p className="text-3xl font-display font-bold mt-1">{value}</p>
          {description && (
            <p className={cn("text-xs mt-1", isColored ? "opacity-70" : "text-muted-foreground")}>{description}</p>
          )}
          {trend && (
            <p className={cn("text-xs mt-1 font-medium", isColored ? "opacity-90" : "text-success")}>{trend}</p>
          )}
        </div>
        
      </div>
    </div>
  );
}
