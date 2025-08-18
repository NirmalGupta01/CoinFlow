import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { Search, Filter, Utensils, Car, Film, ShoppingBag, Receipt, Briefcase, Laptop, Trash2 } from "lucide-react";
import type { Transaction, Category } from "@shared/schema";

const iconMap = {
  utensils: Utensils,
  car: Car,
  film: Film,
  "shopping-bag": ShoppingBag,
  receipt: Receipt,
  briefcase: Briefcase,
  laptop: Laptop,
};

export default function TransactionList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Transaction deleted",
        description: "The transaction has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly-summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/category-breakdown"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete transaction.",
        variant: "destructive",
      });
    },
  });

  const categoryMap = new Map(categories.map((cat: Category) => [cat.id, cat]));

  const filteredTransactions = transactions.filter((transaction: Transaction) =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: string) => {
    const transactionDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (transactionDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (transactionDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return transactionDate.toLocaleDateString();
    }
  };

  const getTransactionIcon = (categoryId: string) => {
    const category = categoryMap.get(categoryId);
    const IconComponent = iconMap[category?.icon as keyof typeof iconMap] || Receipt;
    return IconComponent;
  };

  const getGradientClass = (index: number) => {
    const gradients = ["gradient-fintech-primary", "gradient-fintech-secondary", "gradient-fintech-tertiary"];
    return gradients[index % gradients.length];
  };

  if (isLoading) {
    return (
      <Card className="bg-fintech-primary-800 border-fintech-primary-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-fintech-primary-600 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-fintech-primary-600 rounded mb-2"></div>
                  <div className="h-3 bg-fintech-primary-600 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-fintech-primary-600 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-fintech-primary-800 border-fintech-primary-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-white">Recent Transactions</CardTitle>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fintech-primary-400" size={16} />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="pl-10 bg-fintech-primary-700 border-fintech-primary-600 text-white placeholder-fintech-primary-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="bg-fintech-primary-700 border-fintech-primary-600 text-fintech-primary-300 hover:text-white">
                <Filter size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-fintech-primary-400 text-lg">No transactions found</p>
                  <p className="text-fintech-primary-500 text-sm">Start by adding your first transaction</p>
                </div>
              ) : (
                filteredTransactions.map((transaction: Transaction, index: number) => {
                  const category = categoryMap.get(transaction.categoryId || "");
                  const IconComponent = getTransactionIcon(transaction.categoryId || "");
                  
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-fintech-primary-700/50 rounded-lg hover:bg-fintech-primary-700 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${getGradientClass(index)} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{transaction.description}</h4>
                          <p className="text-sm text-fintech-primary-400">{category?.name || "Uncategorized"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === "income" ? "text-fintech-accent-green" : "text-red-400"
                          }`}>
                            {transaction.type === "income" ? "+" : "-"}{formatCurrency(parseFloat(transaction.amount))}
                          </p>
                          <p className="text-sm text-fintech-primary-400">{formatDate(transaction.date)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTransactionMutation.mutate(transaction.id);
                          }}
                          disabled={deleteTransactionMutation.isPending}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {filteredTransactions.length > 0 && (
            <div className="flex items-center justify-center mt-8">
              <Button variant="outline" className="bg-fintech-primary-700 border-fintech-primary-600 text-fintech-primary-300 hover:text-white hover:bg-fintech-primary-600">
                Load More Transactions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
