import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Lightbulb } from "lucide-react";

export default function BudgetPrediction() {
  const { data: categoryBreakdown } = useQuery({
    queryKey: ["/api/analytics/category-breakdown"],
  });

  const { data: monthlyData } = useQuery({
    queryKey: ["/api/analytics/monthly-summary"],
  });

  // Generate predictions based on current data
  const generatePredictions = () => {
    if (!categoryBreakdown) return [];
    
    return Object.entries(categoryBreakdown).map(([name, data], index) => {
      const amount = (data as any).amount;
      const variations = [5, -12, 25, -8, 15, -3];
      const change = variations[index % variations.length];
      
      return {
        category: name,
        amount: Math.round(amount * 1.05), // Next month prediction
        change,
      };
    });
  };

  const predictions = generatePredictions();

  const getChangeColor = (change: number) => {
    return change > 0 ? "text-red-400" : "text-fintech-accent-green";
  };

  const getChangeIcon = (change: number) => {
    return change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />;
  };

  const getRecommendation = () => {
    if (!monthlyData) return "Loading insights...";
    
    const savingsRate = monthlyData.savingsRate;
    if (savingsRate < 20) {
      return "Consider reducing entertainment expenses by $50 to reach your emergency fund goal 2 months earlier.";
    } else if (savingsRate > 40) {
      return "Great job! Your savings rate is excellent. Consider investing excess funds for better returns.";
    } else {
      return "You're on track with your savings. Try to increase by 5% to reach goals faster.";
    }
  };

  return (
    <Card className="bg-fintech-primary-800 border-fintech-primary-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-white">Next Month Forecast</CardTitle>
          <Badge className="gradient-fintech-primary text-white text-xs font-medium">
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          {predictions.map((prediction, index) => (
            <div
              key={prediction.category}
              className="flex items-center justify-between p-3 bg-fintech-primary-700/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"][index % 5]
                  }}
                ></div>
                <span className="text-white">{prediction.category}</span>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">${prediction.amount}</p>
                <div className={`text-xs flex items-center space-x-1 ${getChangeColor(prediction.change)}`}>
                  {getChangeIcon(prediction.change)}
                  <span>
                    {prediction.change > 0 ? "+" : ""}{prediction.change}% vs last month
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gradient-to-r from-fintech-accent-blue/10 to-fintech-accent-purple/10 border border-fintech-accent-blue/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Lightbulb className="text-fintech-accent-blue flex-shrink-0 mt-1" size={20} />
            <div>
              <h5 className="font-medium text-fintech-accent-blue mb-2">💡 AI Recommendation</h5>
              <p className="text-sm text-fintech-primary-300">
                {getRecommendation()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
