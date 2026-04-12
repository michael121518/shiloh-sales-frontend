import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ArrowUpDown, Upload, BarChart3, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trades", label: "Trades", icon: ArrowUpDown },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/documents", label: "Documents", icon: FolderOpen },
];

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-lg">
            S
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-tight">SHILOH DIGITAL</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Private Limited</p>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                pathname === to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
