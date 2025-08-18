import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SpendingTrend() {
  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  // Generate trend data from transactions
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayTransactions = transactions.filter((t: any) => {
      const transactionDate = new Date(t.date);
      return transactionDate.toDateString() === date.toDateString();
    });
    
    const totalExpenses = dayTransactions
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

    return {
      name: date.toLocaleDateString("en-US", { weekday: "short" }),
      expenses: Math.round(totalExpenses),
    };
  });

  return (
    <Card className="bg-fintech-primary-800 border-fintech-primary-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">Spending Trend</CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" className="bg-fintech-accent-blue hover:bg-fintech-accent-blue/80 text-xs">
              Week
            </Button>
            <Button size="sm" variant="outline" className="bg-fintech-primary-700 border-fintech-primary-600 text-xs">
              Month
            </Button>
            <Button size="sm" variant="outline" className="bg-fintech-primary-700 border-fintech-primary-600 text-xs">
              Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--fintech-primary-600)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--fintech-primary-400)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--fintech-primary-400)"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--fintech-primary-700)",
                  border: "1px solid var(--fintech-primary-600)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="url(#gradient)"
                strokeWidth={3}
                dot={{ fill: "var(--fintech-accent-blue)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "var(--fintech-accent-purple)" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--fintech-accent-blue)" />
                  <stop offset="100%" stopColor="var(--fintech-accent-purple)" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
