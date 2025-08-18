import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

export default function ExpenseChart() {
  const { data: categoryBreakdown } = useQuery({
    queryKey: ["/api/analytics/category-breakdown"],
  });

  const chartData = categoryBreakdown
    ? Object.entries(categoryBreakdown).map(([name, data], index) => ({
        name,
        value: Math.round((data as any).amount),
        color: COLORS[index % COLORS.length],
      }))
    : [];

  return (
    <Card className="bg-fintech-primary-800 border-fintech-primary-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">Expense Categories</CardTitle>
          <Select defaultValue="this-month">
            <SelectTrigger className="w-40 bg-fintech-primary-700 border-fintech-primary-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-fintech-primary-700 border-fintech-primary-600">
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--fintech-primary-700)",
                  border: "1px solid var(--fintech-primary-600)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
