import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function MonthlySummary() {
  const [selectedMonth, setSelectedMonth] = useState("12-2024");

  const { data: monthlyData } = useQuery({
    queryKey: ["/api/analytics/monthly-summary"],
  });

  // Generate sample weekly data for the chart
  const weeklyData = [
    { name: "Week 1", income: 1350, expenses: 850 },
    { name: "Week 2", income: 1420, expenses: 780 },
    { name: "Week 3", income: 1480, expenses: 920 },
    { name: "Week 4", income: 1380, expenses: 697 },
  ];

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <Card className="bg-fintech-primary-800 border-fintech-primary-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">Monthly Financial Summary</CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48 bg-fintech-primary-700 border-fintech-primary-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-fintech-primary-700 border-fintech-primary-600">
              <SelectItem value="12-2024">December 2024</SelectItem>
              <SelectItem value="11-2024">November 2024</SelectItem>
              <SelectItem value="10-2024">October 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--fintech-primary-600)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--fintech-primary-400)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--fintech-primary-400)"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--fintech-primary-700)",
                  border: "1px solid var(--fintech-primary-600)",
                  borderRadius: "8px",
                  color: "white",
                }}
                formatter={(value, name) => [`$${value}`, name === "income" ? "Income" : "Expenses"]}
              />
              <Legend
                wrapperStyle={{ color: "white" }}
              />
              <Bar
                dataKey="income"
                fill="var(--fintech-accent-green)"
                name="Income"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="var(--fintech-accent-blue)"
                name="Expenses"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-fintech-accent-green">
              {formatCurrency(monthlyData?.totalIncome || 5420)}
            </p>
            <p className="text-sm text-fintech-primary-400">Total Income</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {formatCurrency(monthlyData?.totalExpenses || 3247)}
            </p>
            <p className="text-sm text-fintech-primary-400">Total Expenses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-fintech-accent-blue">
              {formatCurrency(monthlyData?.netSavings || 2173)}
            </p>
            <p className="text-sm text-fintech-primary-400">Net Savings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-fintech-accent-purple">
              {monthlyData?.savingsRate?.toFixed(1) || "40.1"}%
            </p>
            <p className="text-sm text-fintech-primary-400">Savings Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
