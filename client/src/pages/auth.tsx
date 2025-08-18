import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Eye, EyeOff, Mail, Lock, User, Chrome } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, signup, googleLogin } = useAuth();
  const [, setLocation] = useLocation();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password, data.rememberMe);
      toast({
        title: "Login successful!",
        description: "Welcome back to FinanceFlow.",
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signup(data.name, data.email, data.password);
      toast({
        title: "Account created successfully!",
        description: "Welcome to FinanceFlow!",
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await googleLogin();
    } catch (error) {
      toast({
        title: "Google authentication failed",
        description: "Please try again or use email/password login.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Password reset",
      description: "Password reset functionality will be implemented soon.",
    });
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    signupForm.reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fintech-primary-950 via-fintech-primary-900 to-fintech-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-fintech-primary-800 border-fintech-primary-700 shadow-2xl">
            <CardHeader className="space-y-1 text-center pb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-fintech-accent-blue to-fintech-accent-purple bg-clip-text text-transparent">
                  FinanceFlow
                </CardTitle>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="text-fintech-primary-400"
              >
                {isLogin ? "Welcome back to your financial dashboard" : "Start your financial journey with us"}
              </motion.p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-fintech-primary-300">Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-fintech-primary-400" />
                                  <Input
                                    placeholder="Enter your email"
                                    className="pl-10 bg-fintech-primary-700 border-fintech-primary-600 text-white placeholder-fintech-primary-400 focus:border-fintech-accent-blue"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-fintech-primary-300">Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-fintech-primary-400" />
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="pl-10 pr-10 bg-fintech-primary-700 border-fintech-primary-600 text-white placeholder-fintech-primary-400 focus:border-fintech-accent-blue"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-fintech-primary-400 hover:text-white transition-colors"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex items-center justify-between">
                          <FormField
                            control={loginForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="border-fintech-primary-600 data-[state=checked]:bg-fintech-accent-blue data-[state=checked]:border-fintech-accent-blue"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm text-fintech-primary-300">
                                    Remember me
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-sm text-fintech-accent-blue hover:text-fintech-accent-blue/80 transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>
                        
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-fintech-accent-blue to-fintech-accent-purple hover:opacity-90 transition-opacity"
                          disabled={isLoading}
                        >
                          {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                        <FormField
                          control={signupForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-fintech-primary-300">Full Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-fintech-primary-400" />
                                  <Input
                                    placeholder="Enter your full name"
                                    className="pl-10 bg-fintech-primary-700 border-fintech-primary-600 text-white placeholder-fintech-primary-400 focus:border-fintech-accent-blue"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-fintech-primary-300">Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-fintech-primary-400" />
                                  <Input
                                    placeholder="Enter your email"
                                    className="pl-10 bg-fintech-primary-700 border-fintech-primary-600 text-white placeholder-fintech-primary-400 focus:border-fintech-accent-blue"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-fintech-primary-300">Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-fintech-primary-400" />
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    className="pl-10 pr-10 bg-fintech-primary-700 border-fintech-primary-600 text-white placeholder-fintech-primary-400 focus:border-fintech-accent-blue"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-fintech-primary-400 hover:text-white transition-colors"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-fintech-primary-300">Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-fintech-primary-400" />
                                  <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    className="pl-10 pr-10 bg-fintech-primary-700 border-fintech-primary-600 text-white placeholder-fintech-primary-400 focus:border-fintech-accent-blue"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-fintech-primary-400 hover:text-white transition-colors"
                                  >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-fintech-accent-blue to-fintech-accent-purple hover:opacity-90 transition-opacity"
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-fintech-primary-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-fintech-primary-800 px-2 text-fintech-primary-400">Or continue with</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleAuth}
                className="w-full bg-fintech-primary-700 border-fintech-primary-600 text-white hover:bg-fintech-primary-600"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-sm text-fintech-primary-400 hover:text-white transition-colors"
                >
                  {isLogin ? (
                    <>Don't have an account? <span className="text-fintech-accent-blue">Sign up</span></>
                  ) : (
                    <>Already have an account? <span className="text-fintech-accent-blue">Sign in</span></>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}