import { motion } from "framer-motion";
import TransactionForm from "@/components/transactions/transaction-form";
import TransactionList from "@/components/transactions/transaction-list";

export default function Transactions() {
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
            <h2 className="text-4xl font-bold mb-4">Transaction Management</h2>
            <p className="text-xl text-fintech-primary-400">Track, categorize, and analyze your spending</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <TransactionForm />
            </div>
            <div className="lg:col-span-2">
              <TransactionList />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
