import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share, Settings } from "lucide-react";

interface ScoreIndicatorProps {
  label: string;
  value: number;
  max: number;
}

function ScoreIndicator({ label, value, max }: ScoreIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white">{label}</span>
      <div className="flex space-x-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < value 
                ? i < 2 ? "bg-fintech-accent-green" 
                  : i < 4 ? "bg-fintech-accent-blue"
                  : "bg-fintech-accent-purple"
                : "bg-fintech-primary-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function HealthScore() {
  const { data: monthlyData } = useQuery({
    queryKey: ["/api/analytics/monthly-summary"],
  });

  const calculateHealthScore = () => {
    if (!monthlyData) return 78;
    
    const { savingsRate, totalIncome, totalExpenses } = monthlyData;
    let score = 0;
    
    // Savings rate contribution (40 points)
    score += Math.min((savingsRate / 20) * 40, 40);
    
    // Expense control (30 points)
    const expenseRatio = totalExpenses / totalIncome;
    score += Math.max(30 - (expenseRatio * 30), 0);
    
    // Base score (30 points)
    score += 30;
    
    return Math.min(Math.round(score), 100);
  };

  const healthScore = calculateHealthScore();
  const scoreStatus = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Improvement";
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="space-y-6">
      <Card className="bg-fintech-primary-800 border-fintech-primary-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Financial Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--fintech-primary-600)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#healthGradient)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                />
                <defs>
                  <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--fintech-accent-green)" />
                    <stop offset="100%" stopColor="var(--fintech-accent-blue)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-fintech-accent-green">{healthScore}</p>
                  <p className="text-xs text-fintech-primary-400">{scoreStatus}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <ScoreIndicator label="Spending Control" value={4} max={5} />
            <ScoreIndicator label="Savings Rate" value={5} max={5} />
            <ScoreIndicator label="Goal Progress" value={3} max={5} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-fintech-primary-800 border-fintech-primary-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start p-3 bg-fintech-primary-700 hover:bg-fintech-primary-600 text-white"
            >
              <Download className="mr-3 text-fintech-accent-blue" size={18} />
              Export Report
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start p-3 bg-fintech-primary-700 hover:bg-fintech-primary-600 text-white"
            >
              <Share className="mr-3 text-fintech-accent-green" size={18} />
              Share Insights
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start p-3 bg-fintech-primary-700 hover:bg-fintech-primary-600 text-white"
            >
              <Settings className="mr-3 text-fintech-accent-purple" size={18} />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
