import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import StatsCard from "@/components/dashboard/stats-card";
import ExpenseChart from "@/components/dashboard/expense-chart";
import SpendingTrend from "@/components/dashboard/spending-trend";
import FloatingWallet from "@/components/3d/floating-wallet";
import PiggyBank from "@/components/3d/piggy-bank";
import { DollarSign, TrendingDown, Target, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["/api/goals"],
  });

  const { data: monthlyData } = useQuery({
    queryKey: ["/api/analytics/monthly-summary"],
  });

  const totalBalance = monthlyData 
    ? monthlyData.totalIncome - monthlyData.totalExpenses + 21330 // Base balance
    : 24580;

  const monthlyExpenses = monthlyData?.totalExpenses || 3247;
  const savingsGoals = goals.reduce((sum, goal) => sum + parseFloat(goal.currentAmount || "0"), 0);
  const projectedSavings = monthlyData?.netSavings || 1205;

  return (
    <div className="pt-16 min-h-screen bg-fintech-primary-900">
      {/* Hero Section with 3D Elements */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fintech-primary-900 via-fintech-primary-800 to-fintech-primary-900"></div>
        
        {/* 3D Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 opacity-20">
          <FloatingWallet />
        </div>
        
        <div className="absolute bottom-20 left-10 w-48 h-48 opacity-15">
          <PiggyBank />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl mx-auto px-6"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Master Your
            <span className="bg-gradient-to-r from-fintech-accent-blue via-fintech-accent-purple to-fintech-accent-green bg-clip-text text-transparent">
              {" "}Financial Future
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-fintech-primary-300 mb-8">
            Track expenses, set goals, and predict budgets with AI-powered insights
          </p>
        </motion.div>
      </section>

      {/* Dashboard Overview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold mb-4"
            >
              Your Financial Dashboard
            </motion.h2>
            <p className="text-xl text-fintech-primary-400">Real-time insights into your financial health</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatsCard
              title="Total Balance"
              value={`$${totalBalance.toLocaleString()}`}
              change="+12.5%"
              changeType="positive"
              icon={<DollarSign />}
              gradient="gradient-fintech-primary"
            />
            <StatsCard
              title="Monthly Expenses"
              value={`$${monthlyExpenses.toLocaleString()}`}
              change="-5.2%"
              changeType="negative"
              icon={<TrendingDown />}
              gradient="gradient-fintech-secondary"
            />
            <StatsCard
              title="Savings Goals"
              value={`$${Math.round(savingsGoals).toLocaleString()}`}
              change="+8.1%"
              changeType="positive"
              icon={<Target />}
              gradient="gradient-fintech-tertiary"
            />
            <StatsCard
              title="Next Month"
              value={`$${projectedSavings.toLocaleString()}`}
              change="Predicted"
              changeType="neutral"
              icon={<TrendingUp />}
              gradient="gradient-fintech-secondary"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ExpenseChart />
            <SpendingTrend />
          </div>
        </div>
      </section>
    </div>
  );
}
