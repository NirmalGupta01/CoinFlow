import {
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type Goal,
  type InsertGoal,
  type Budget,
  type InsertBudget,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(userId: string, category: InsertCategory): Promise<Category>;
  deleteCategory(id: string, userId: string): Promise<boolean>;

  // Transaction operations
  getTransactions(userId: string, limit?: number, offset?: number): Promise<Transaction[]>;
  getTransactionsByCategory(userId: string, categoryId: string): Promise<Transaction[]>;
  getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  createTransaction(userId: string, transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, userId: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string, userId: string): Promise<boolean>;

  // Goal operations
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(userId: string, goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, userId: string, updates: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string, userId: string): Promise<boolean>;
  updateGoalProgress(id: string, userId: string, amount: number): Promise<Goal | undefined>;

  // Budget operations
  getBudgets(userId: string): Promise<Budget[]>;
  getBudgetsByPeriod(userId: string, month: number, year: number): Promise<Budget[]>;
  createBudget(userId: string, budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, userId: string, updates: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: string, userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private categories: Map<string, Category> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private goals: Map<string, Goal> = new Map();
  private budgets: Map<string, Budget> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Create demo user
    const demoUser: User = {
      id: "demo-user",
      username: "demo",
      password: "password",
      email: "demo@financeflow.com",
    };
    this.users.set(demoUser.id, demoUser);

    // Default categories
    const defaultCategories = [
      { name: "Food & Dining", icon: "utensils", color: "#3B82F6", type: "expense" },
      { name: "Transportation", icon: "car", color: "#10B981", type: "expense" },
      { name: "Entertainment", icon: "film", color: "#8B5CF6", type: "expense" },
      { name: "Shopping", icon: "shopping-bag", color: "#F59E0B", type: "expense" },
      { name: "Bills & Utilities", icon: "receipt", color: "#EF4444", type: "expense" },
      { name: "Salary", icon: "briefcase", color: "#059669", type: "income" },
      { name: "Freelance", icon: "laptop", color: "#7C3AED", type: "income" },
    ];

    defaultCategories.forEach((cat) => {
      const category: Category = {
        id: randomUUID(),
        userId: demoUser.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
      };
      this.categories.set(category.id, category);
    });

    // Demo goals
    const demoGoals = [
      {
        title: "Emergency Fund",
        description: "Save for unexpected expenses",
        targetAmount: "10000",
        currentAmount: "3250",
        deadline: new Date("2025-08-01"),
      },
      {
        title: "Vacation Fund",
        description: "Trip to Europe next summer",
        targetAmount: "5000",
        currentAmount: "1850",
        deadline: new Date("2025-06-01"),
      },
    ];

    demoGoals.forEach((goalData) => {
      const goal: Goal = {
        id: randomUUID(),
        userId: demoUser.id,
        ...goalData,
        achieved: false,
      };
      this.goals.set(goal.id, goal);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCategories(userId: string): Promise<Category[]> {
    return Array.from(this.categories.values()).filter((cat) => cat.userId === userId);
  }

  async createCategory(userId: string, category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { ...category, id, userId };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    const category = this.categories.get(id);
    if (category && category.userId === userId) {
      this.categories.delete(id);
      return true;
    }
    return false;
  }

  async getTransactions(userId: string, limit = 50, offset = 0): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return userTransactions.slice(offset, offset + limit);
  }

  async getTransactionsByCategory(userId: string, categoryId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (t) => t.userId === userId && t.categoryId === categoryId
    );
  }

  async getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (t) => t.userId === userId && 
             new Date(t.date) >= startDate && 
             new Date(t.date) <= endDate
    );
  }

  async createTransaction(userId: string, transaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const newTransaction: Transaction = {
      ...transaction,
      id,
      userId,
      date: transaction.date || new Date(),
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: string, userId: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (transaction && transaction.userId === userId) {
      const updated = { ...transaction, ...updates };
      this.transactions.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    const transaction = this.transactions.get(id);
    if (transaction && transaction.userId === userId) {
      this.transactions.delete(id);
      return true;
    }
    return false;
  }

  async getGoals(userId: string): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter((goal) => goal.userId === userId);
  }

  async createGoal(userId: string, goal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const newGoal: Goal = {
      ...goal,
      id,
      userId,
      currentAmount: "0",
      achieved: false,
    };
    this.goals.set(id, newGoal);
    return newGoal;
  }

  async updateGoal(id: string, userId: string, updates: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (goal && goal.userId === userId) {
      const updated = { ...goal, ...updates };
      this.goals.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    const goal = this.goals.get(id);
    if (goal && goal.userId === userId) {
      this.goals.delete(id);
      return true;
    }
    return false;
  }

  async updateGoalProgress(id: string, userId: string, amount: number): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (goal && goal.userId === userId) {
      const currentAmount = parseFloat(goal.currentAmount) + amount;
      const targetAmount = parseFloat(goal.targetAmount);
      const updated = {
        ...goal,
        currentAmount: currentAmount.toString(),
        achieved: currentAmount >= targetAmount,
      };
      this.goals.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getBudgets(userId: string): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter((budget) => budget.userId === userId);
  }

  async getBudgetsByPeriod(userId: string, month: number, year: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId && budget.month === month && budget.year === year
    );
  }

  async createBudget(userId: string, budget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const newBudget: Budget = { ...budget, id, userId };
    this.budgets.set(id, newBudget);
    return newBudget;
  }

  async updateBudget(id: string, userId: string, updates: Partial<InsertBudget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (budget && budget.userId === userId) {
      const updated = { ...budget, ...updates };
      this.budgets.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteBudget(id: string, userId: string): Promise<boolean> {
    const budget = this.budgets.get(id);
    if (budget && budget.userId === userId) {
      this.budgets.delete(id);
      return true;
    }
    return false;
  }
}

export const storage = new MemStorage();
