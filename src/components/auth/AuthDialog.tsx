import { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, Lock, ArrowRight, ShieldCheck, UserCircle, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserRole } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function AuthDialog({ children, defaultTab = 'login' }: { children?: React.ReactNode, defaultTab?: 'login' | 'register' }) {
  const { signIn, signUp } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const lastSubmitRef = useRef<number>(0);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleResendEmail = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address first.");
      return;
    }

    setResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });

      if (error) throw error;

      toast.success("Verification email resent!", {
        description: "Please check your inbox (and spam folder).",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification email.");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    const now = Date.now();
    if (now - lastSubmitRef.current < 3000) {
      toast.info("Please wait a moment before trying again.");
      return;
    }

    setIsLoading(true);
    lastSubmitRef.current = now;

    try {
      if (tab === 'register') {
        await signUp(formData.email, formData.password, formData.name, role);
        
        toast.success("Check your email to verify your account before login", {
          duration: 6000,
          icon: <Mail className="text-blue-500" />
        });
        
        setTab('login');
      } else {
        await signIn(formData.email, formData.password);
        toast.success("Welcome back!", {
          icon: <CheckCircle2 className="text-green-500" />
        });
        setIsOpen(false);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      const errorMessage = error.message || "Authentication failed. Please try again.";
      
      if (errorMessage.toLowerCase().includes('rate limit')) {
        toast.error("Security Alert: Rate limit exceeded", {
          description: "Too many attempts. Please wait 5-15 minutes.",
        });
      } else if (errorMessage.toLowerCase().includes('email not confirmed')) {
        toast.error("Please verify your email first.", {
          description: "Check your inbox for the confirmation link.",
          action: {
            label: "Resend Email",
            onClick: handleResendEmail
          }
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, role, signIn, signUp, tab, isLoading]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && setIsOpen(open)}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">Sign In</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl" onInteractOutside={(e) => isLoading && e.preventDefault()}>
        <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.1, scale: 1 }}
            className="absolute -right-10 -bottom-10 w-40 h-40 bg-white rounded-full"
          />
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg overflow-hidden">
              <img 
                src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/95256d07-9087-4d6c-85b4-80bb5970fa97/shop-logo-69b80c26-1776578862439.webp" 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-black italic tracking-tighter text-white">ወንዳየሁ gift shop</h2>
          </div>
          <DialogTitle className="text-3xl font-bold text-white mb-2">
            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80 text-lg">
            {tab === 'login' 
              ? 'Please enter your details to sign in.' 
              : 'Join us to explore exclusive gifts and details.'}
          </DialogDescription>
        </div>

        <div className="p-8 bg-background">
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setRole('user')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    role === 'user' 
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm' 
                      : 'border-muted hover:border-primary/50 text-muted-foreground'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <UserCircle className="w-5 h-5" />
                  User
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setRole('admin')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    role === 'admin' 
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm' 
                      : 'border-muted hover:border-primary/50 text-muted-foreground'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  Admin
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {tab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      className="pl-10 h-12 rounded-xl"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email"
                  placeholder="name@example.com" 
                  className="pl-10 h-12 rounded-xl"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••" 
                  className="pl-10 h-12 rounded-xl"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-12 rounded-xl text-lg font-bold gap-2 mt-2 relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>

            {tab === 'login' && (
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendingEmail || isLoading}
                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 py-2"
              >
                {resendingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Resend Verification Email
              </button>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {tab === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                disabled={isLoading}
                onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                className={`text-primary font-bold hover:underline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {tab === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}