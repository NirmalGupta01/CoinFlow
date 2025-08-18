import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: ReactNode;
  gradient: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType,
  icon,
  gradient,
}: StatsCardProps) {
  const changeColor = 
    changeType === "positive" 
      ? "text-fintech-accent-green" 
      : changeType === "negative" 
        ? "text-red-400" 
        : "text-fintech-accent-blue";

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-fintech-primary-800 border-fintech-primary-700 hover:bg-fintech-primary-700 transition-all duration-300 hover:shadow-lg hover:shadow-fintech-accent-blue/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 ${gradient} rounded-lg text-white`}>
              {icon}
            </div>
            <span className={`text-sm font-medium ${changeColor}`}>
              {change}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
          <p className="text-fintech-primary-400">{title}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
