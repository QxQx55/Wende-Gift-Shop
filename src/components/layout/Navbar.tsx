import { ShoppingBag, Search, Menu, User, Heart, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CartDrawer } from "../shop/CartDrawer";
import { AuthDialog } from "../auth/AuthDialog";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { cartCount } = useCart();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDarkNav = isScrolled || location.pathname !== '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[0.22, 1, 0.36, 1] ${
      isScrolled 
        ? "bg-white/60 backdrop-blur-2xl border-b border-zinc-200/50 shadow-sm py-2" 
        : "bg-transparent py-6"
    }`}>
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 group cursor-pointer">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 overflow-hidden"
          >
            <img 
              src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/95256d07-9087-4d6c-85b4-80bb5970fa97/shop-logo-69b80c26-1776578862439.webp" 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="flex flex-col">
            <span className={`text-2xl font-black tracking-tighter leading-none uppercase italic transition-colors duration-500 ${
              !isScrolled && location.pathname === '/' ? "text-white" : "text-zinc-900"
            }`}>
              ወንዳየሁ
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              gift shop
            </span>
          </div>
        </Link>

        {/* Search - Desktop */}
        <div className="hidden lg:flex flex-1 max-w-xl relative group">
          <Input 
            placeholder="Search luxury items..." 
            className={`pl-12 h-12 border-none transition-all duration-500 rounded-full focus-visible:ring-2 focus-visible:ring-primary/40 ${
              !isScrolled && location.pathname === '/' 
                ? "bg-transparent backdrop-blur-md text-white placeholder:text-white/50 border border-white/20" 
                : "bg-zinc-100 text-zinc-900"
            }`}
          />
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-500 ${
            !isScrolled && location.pathname === '/' ? "text-white/50" : "text-zinc-400"
          }`} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`hidden sm:flex rounded-full transition-colors duration-500 ${
              !isScrolled && location.pathname === '/' ? "text-white hover:bg-white/10" : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <Heart className="w-5 h-5" />
          </Button>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full transition-colors duration-500 ${
                    !isScrolled && location.pathname === '/' ? "text-white hover:bg-white/10" : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl p-3 border-none shadow-2xl backdrop-blur-xl bg-white/95">
                <DropdownMenuLabel className="font-normal pb-3">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-black uppercase tracking-tight">{user?.name}</p>
                    <p className="text-xs font-medium text-muted-foreground bg-zinc-100 px-2 py-1 rounded-md inline-block w-fit">{user?.role}</p>
                    <p className="text-[10px] text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-100" />
                <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 py-3">
                  <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center w-full font-bold uppercase text-[11px] tracking-wider">
                    <LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl focus:bg-primary/5 py-3">
                  <Settings className="mr-3 h-4 w-4 text-primary" />
                  <span className="font-bold uppercase text-[11px] tracking-wider">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-100" />
                <DropdownMenuItem className="rounded-xl text-destructive focus:bg-destructive/5 focus:text-destructive py-3 cursor-pointer" onClick={logout}>
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-bold uppercase text-[11px] tracking-wider">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AuthDialog>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full transition-colors duration-500 ${
                  !isScrolled && location.pathname === '/' ? "text-white hover:bg-white/10" : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <User className="w-5 h-5" />
              </Button>
            </AuthDialog>
          )}
          
          <CartDrawer>
            <Button 
              variant="outline" 
              className={`relative h-12 px-8 gap-3 rounded-full shadow-lg transition-all duration-500 group border-none ${
                !isScrolled && location.pathname === '/' 
                  ? "bg-white text-black hover:bg-zinc-100" 
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:block font-black uppercase tracking-widest text-[10px]">Cart</span>
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-2 py-0.5 min-w-[24px] h-6 flex items-center justify-center bg-primary text-primary-foreground border-2 border-background font-black text-[10px] shadow-xl animate-in zoom-in">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </CartDrawer>

          <Button 
            variant="ghost" 
            size="icon" 
            className={`lg:hidden rounded-full transition-colors duration-500 ${
              !isScrolled && location.pathname === '/' ? "text-white hover:bg-white/10" : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}