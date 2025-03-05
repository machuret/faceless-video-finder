
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
  valueColor?: string;
}

const StatCard = ({ icon: Icon, label, value, iconColor = "text-blue-600", valueColor = "" }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-4 flex items-center">
        <Icon className={`h-8 w-8 ${iconColor} mr-3`} />
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-xl font-bold ${valueColor}`}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
