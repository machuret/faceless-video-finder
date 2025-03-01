
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ReachStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  cardClassName?: string;
  valueClassName?: string;
  description?: string;
}

export const ReachStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  cardClassName = "",
  valueClassName = "",
  description 
}: ReachStatCardProps) => {
  return (
    <Card className={cardClassName}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${valueClassName}`}>
          {value}
        </p>
        {description && (
          <p className="text-sm text-gray-500 mt-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
