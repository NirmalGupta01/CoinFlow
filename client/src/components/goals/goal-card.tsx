import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { insertGoalSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Target, Calendar } from "lucide-react";
import { z } from "zod";
import type { Goal } from "@shared/schema";

const formSchema = insertGoalSchema.extend({
  deadline: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function GoalCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      targetAmount: "",
      deadline: "",
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const goalData = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      };
      const response = await apiRequest("POST", "/api/goals", goalData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Goal created successfully!",
        description: "Your new financial goal has been set.",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createGoalMutation.mutate(data);
  };

  const calculateProgress = (current: string, target: string) => {
    const currentAmount = parseFloat(current);
    const targetAmount = parseFloat(target);
    return Math.min((currentAmount / targetAmount) * 100, 100);
  };

  const getTimeLeft = (deadline?: string) => {
    if (!deadline) return "No deadline";
    
    const now = new Date();
    const end = new Date(deadline);
    const timeDiff = end.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return "Overdue";
    if (daysDiff === 0) return "Due today";
    if (daysDiff === 1) return "1 day left";
    if (daysDiff < 30) return `${daysDiff} days left`;
    
    const monthsDiff = Math.ceil(daysDiff / 30);
    return `${monthsDiff} month${monthsDiff > 1 ? 's' : ''} left`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-fintech-primary-800 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-fintech-primary-600 rounded mb-4"></div>
            <div className="h-4 bg-fintech-primary-600 rounded mb-6"></div>
            <div className="h-3 bg-fintech-primary-600 rounded mb-4"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-fintech-primary-600 rounded w-20"></div>
              <div className="h-4 bg-fintech-primary-600 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {goals.map((goal: any, index: number) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-fintech-primary-800 border-fintech-primary-700 hover:bg-fintech-primary-700/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Target className="text-fintech-accent-blue" size={20} />
                      <div>
                        <h4 className="text-lg font-medium text-white">{goal.title}</h4>
                        <p className="text-fintech-primary-400">{goal.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(parseFloat(goal.currentAmount))}
                      </p>
                      <p className="text-sm text-fintech-primary-400">
                        of {formatCurrency(parseFloat(goal.targetAmount))}
                      </p>
                    </div>
                  </div>
                  
                  <Progress 
                    value={progress} 
                    className="mb-4"
                  />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-fintech-accent-blue font-medium">
                      {progress.toFixed(1)}% Complete
                    </span>
                    <div className="flex items-center space-x-2 text-fintech-primary-400">
                      <Calendar size={14} />
                      <span>{getTimeLeft(goal.deadline)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full p-6 h-auto border-2 border-dashed border-fintech-primary-600 bg-transparent hover:border-fintech-accent-blue hover:bg-fintech-primary-800/50 text-fintech-primary-400 hover:text-fintech-accent-blue transition-all"
            >
              <div className="flex flex-col items-center space-y-2">
                <Plus size={24} />
                <p>Add New Goal</p>
              </div>
            </Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="bg-fintech-primary-800 border-fintech-primary-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Goal</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-fintech-primary-300">Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Emergency Fund"
                        className="bg-fintech-primary-700 border-fintech-primary-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-fintech-primary-300">Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Save for unexpected expenses"
                        className="bg-fintech-primary-700 border-fintech-primary-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-fintech-primary-300">Target Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="10000"
                        className="bg-fintech-primary-700 border-fintech-primary-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-fintech-primary-300">Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-fintech-primary-700 border-fintech-primary-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full gradient-fintech-primary hover:opacity-90"
                disabled={createGoalMutation.isPending}
              >
                {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
