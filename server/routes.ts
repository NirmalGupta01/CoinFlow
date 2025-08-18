import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertGoalSchema, insertCategorySchema, insertBudgetSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const demoUserId = "demo-user"; // For demo purposes

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories(demoUserId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(demoUserId, categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const transactions = await storage.getTransactions(demoUserId, limit, offset);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(demoUserId, transactionData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const updates = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, demoUserId, updates);
      if (transaction) {
        res.json(transaction);
      } else {
        res.status(404).json({ message: "Transaction not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTransaction(req.params.id, demoUserId);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Transaction not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Goals
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals(demoUserId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(demoUserId, goalData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const updates = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(req.params.id, demoUserId, updates);
      if (goal) {
        res.json(goal);
      } else {
        res.status(404).json({ message: "Goal not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.post("/api/goals/:id/progress", async (req, res) => {
    try {
      const { amount } = req.body;
      if (typeof amount !== "number") {
        return res.status(400).json({ message: "Amount must be a number" });
      }
      const goal = await storage.updateGoalProgress(req.params.id, demoUserId, amount);
      if (goal) {
        res.json(goal);
      } else {
        res.status(404).json({ message: "Goal not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal progress" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGoal(req.params.id, demoUserId);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Goal not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/monthly-summary", async (req, res) => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      const transactions = await storage.getTransactionsByDateRange(demoUserId, startDate, endDate);
      
      const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const netSavings = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

      res.json({
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: Math.round(savingsRate * 10) / 10,
        transactionCount: transactions.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate monthly summary" });
    }
  });

  app.get("/api/analytics/category-breakdown", async (req, res) => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      const transactions = await storage.getTransactionsByDateRange(demoUserId, startDate, endDate);
      const categories = await storage.getCategories(demoUserId);
      
      const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
      
      const breakdown = transactions
        .filter(t => t.type === "expense")
        .reduce((acc, transaction) => {
          const category = categoryMap.get(transaction.categoryId || "");
          const categoryName = category?.name || "Uncategorized";
          const categoryColor = category?.color || "#6B7280";
          
          if (!acc[categoryName]) {
            acc[categoryName] = { amount: 0, color: categoryColor };
          }
          acc[categoryName].amount += parseFloat(transaction.amount);
          return acc;
        }, {} as Record<string, { amount: number; color: string }>);

      res.json(breakdown);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate category breakdown" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
