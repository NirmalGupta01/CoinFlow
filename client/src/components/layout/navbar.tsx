import { Link, useLocation } from "wouter";
import { Coins, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/transactions", label: "Transactions" },
    { href: "/goals", label: "Goals" },
    { href: "/analytics", label: "Analytics" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-fintech-primary-800/80 backdrop-blur-lg border-b border-fintech-primary-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center space-x-4 cursor-pointer">
              <div className="w-8 h-8 gradient-fintech-primary rounded-lg flex items-center justify-center">
                <Coins className="text-white text-sm" size={16} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-fintech-accent-blue to-fintech-accent-purple bg-clip-text text-transparent">
                FinanceFlow
              </h1>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className={`transition-colors duration-200 cursor-pointer ${
                  location === item.href 
                    ? "text-white" 
                    : "text-fintech-primary-300 hover:text-white"
                }`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2 text-fintech-primary-300 hover:text-white">
              <Bell size={18} />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-fintech-secondary rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              {user && (
                <span className="text-fintech-primary-300 text-sm hidden md:block">{user.name}</span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="p-2 text-fintech-primary-300 hover:text-white"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
