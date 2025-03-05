
import { Card, CardContent } from "@/components/ui/card";

interface MonthlyRevenueCardProps {
  revenuePerMonth?: number;
}

const MonthlyRevenueCard = ({ revenuePerMonth }: MonthlyRevenueCardProps) => {
  if (!revenuePerMonth) return null;
  
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-1">Estimated Monthly Revenue</h3>
        <p className="text-2xl font-bold text-green-600">
          ${parseFloat(revenuePerMonth.toString()).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </p>
      </CardContent>
    </Card>
  );
};

export default MonthlyRevenueCard;
