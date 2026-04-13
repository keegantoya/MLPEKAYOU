import { Sparkles, LayoutGrid, BarChart3, Users, Gift, LogIn } from "lucide-react";
import { Button } from "./ui/button";

const Navbar = () => {
  const navItems = [
    { label: "Home", icon: Sparkles, active: true },
    { label: "Collections", icon: LayoutGrid },
    { label: "Inventory", icon: BarChart3 },
    { label: "Friends", icon: Users },
    { label: "Giveaway", icon: Gift },
    { label: "Statistics", icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-gradient">PonyCardTracker</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? "text-primary bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
        <Button variant="default" size="sm" className="gap-2">
          <LogIn className="h-4 w-4" />
          Login
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
