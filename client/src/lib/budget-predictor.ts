interface TransactionData {
  amount: number;
  category: string;
  date: Date;
  type: "income" | "expense";
}

interface BudgetPrediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  trend: "increasing" | "decreasing" | "stable";
}

export class BudgetPredictor {
  private transactions: TransactionData[];

  constructor(transactions: TransactionData[]) {
    this.transactions = transactions;
  }

  predictNextMonth(): BudgetPrediction[] {
    const categoryData = this.groupByCategory();
    const predictions: BudgetPrediction[] = [];

    Object.entries(categoryData).forEach(([category, amounts]) => {
      if (amounts.length === 0) return;

      const prediction = this.calculatePrediction(amounts);
      predictions.push({
        category,
        predictedAmount: prediction.amount,
        confidence: prediction.confidence,
        trend: prediction.trend,
      });
    });

    return predictions.sort((a, b) => b.predictedAmount - a.predictedAmount);
  }

  private groupByCategory(): Record<string, number[]> {
    const categoryData: Record<string, number[]> = {};

    this.transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        if (!categoryData[transaction.category]) {
          categoryData[transaction.category] = [];
        }
        categoryData[transaction.category].push(transaction.amount);
      }
    });

    return categoryData;
  }

  private calculatePrediction(amounts: number[]): {
    amount: number;
    confidence: number;
    trend: "increasing" | "decreasing" | "stable";
  } {
    if (amounts.length === 0) {
      return { amount: 0, confidence: 0, trend: "stable" };
    }

    // Simple moving average with seasonal adjustments
    const recentAmounts = amounts.slice(-6); // Last 6 transactions
    const average = recentAmounts.reduce((sum, amount) => sum + amount, 0) / recentAmounts.length;

    // Calculate trend
    const firstHalf = recentAmounts.slice(0, Math.floor(recentAmounts.length / 2));
    const secondHalf = recentAmounts.slice(Math.floor(recentAmounts.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, amount) => sum + amount, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, amount) => sum + amount, 0) / secondHalf.length;
    
    let trend: "increasing" | "decreasing" | "stable" = "stable";
    const trendThreshold = 0.1; // 10% change threshold
    
    if (secondHalfAvg > firstHalfAvg * (1 + trendThreshold)) {
      trend = "increasing";
    } else if (secondHalfAvg < firstHalfAvg * (1 - trendThreshold)) {
      trend = "decreasing";
    }

    // Apply trend factor
    let predictedAmount = average;
    if (trend === "increasing") {
      predictedAmount *= 1.1;
    } else if (trend === "decreasing") {
      predictedAmount *= 0.9;
    }

    // Calculate confidence based on consistency
    const variance = recentAmounts.reduce((sum, amount) => {
      return sum + Math.pow(amount - average, 2);
    }, 0) / recentAmounts.length;
    
    const standardDeviation = Math.sqrt(variance);
    const coefficient = standardDeviation / average;
    const confidence = Math.max(0, Math.min(1, 1 - coefficient));

    return {
      amount: Math.round(predictedAmount),
      confidence: Math.round(confidence * 100),
      trend,
    };
  }

  generateRecommendations(): string[] {
    const predictions = this.predictNextMonth();
    const recommendations: string[] = [];

    const totalPredicted = predictions.reduce((sum, p) => sum + p.predictedAmount, 0);
    
    // Find highest spending category
    if (predictions.length > 0) {
      const highest = predictions[0];
      if (highest.trend === "increasing") {
        recommendations.push(`Your ${highest.category} spending is trending upward. Consider reviewing this category.`);
      }
    }

    // General savings recommendation
    const potentialSavings = predictions.filter(p => p.trend === "increasing")
      .reduce((sum, p) => sum + p.predictedAmount * 0.1, 0);
    
    if (potentialSavings > 50) {
      recommendations.push(`You could save approximately $${Math.round(potentialSavings)} by reducing trending expenses.`);
    }

    return recommendations;
  }
}
