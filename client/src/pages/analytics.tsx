import { motion } from "framer-motion";
import MonthlySummary from "@/components/analytics/monthly-summary";
import HealthScore from "@/components/analytics/health-score";

export default function Analytics() {
  return (
    <div className="pt-16 min-h-screen bg-fintech-primary-900">
      <section className="py-20 px-6 bg-fintech-primary-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Advanced Analytics</h2>
            <p className="text-xl text-fintech-primary-400">Deep insights into your financial patterns</p>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <MonthlySummary />
            </div>
            <div>
              <HealthScore />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
