import { motion } from "framer-motion";
import GoalCard from "@/components/goals/goal-card";
import BudgetPrediction from "@/components/goals/budget-prediction";
import PiggyBank from "@/components/3d/piggy-bank";

export default function Goals() {
  return (
    <div className="pt-16 min-h-screen bg-fintech-primary-900">
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Financial Goals & Budget Planning</h2>
            <p className="text-xl text-fintech-primary-400">Set targets and track your progress with AI insights</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-8">Savings Goals</h3>
              <GoalCard />
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-8">AI Budget Predictions</h3>
              <BudgetPrediction />
              
              {/* 3D Interactive Element */}
              <div className="bg-fintech-primary-800 rounded-xl p-6 text-center mt-6">
                <div className="w-32 h-32 mx-auto mb-4">
                  <PiggyBank />
                </div>
                <h5 className="font-medium mb-2">Interactive Savings Visualizer</h5>
                <p className="text-sm text-fintech-primary-400">Watch your piggy bank grow as you save more!</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
