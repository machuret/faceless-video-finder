
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CircleDollarSign } from "lucide-react";

interface MonthlyRevenueCardProps {
  revenuePerMonth?: number;
}

const MonthlyRevenueCard = ({ revenuePerMonth }: MonthlyRevenueCardProps) => {
  const { user } = useAuth();
  
  if (!revenuePerMonth) return null;
  
  if (user) {
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
  }
  
  // Teaser for non-registered users
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start">
          <CircleDollarSign className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium mb-1">Estimated Monthly Revenue</h3>
            <p className="text-sm text-gray-600 mb-3">
              Sign in to see how much this channel earns each month
            </p>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/auth">Sign in to view</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyRevenueCard;
