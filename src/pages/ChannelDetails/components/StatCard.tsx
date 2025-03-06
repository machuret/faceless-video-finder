
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
      <CardContent className="p-4 flex flex-col items-center text-center">
        <Icon className={`h-8 w-8 ${iconColor} mb-2`} />
        <div>
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className={`text-lg font-bold ${valueColor}`}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
