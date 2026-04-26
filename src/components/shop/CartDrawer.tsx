import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, PackageOpen, ExternalLink, CreditCard, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function CartDrawer({ children }: { children: React.ReactNode }) {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    setOpen(false);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Creating your order...',
        success: (data: any) => `Order placed successfully using ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}!`,
        error: 'Error processing order.',
      }
    );
    setTimeout(() => {
        clearCart();
        navigate('/dashboard');
    }, 2100);
  };

  const goToCart = () => {
      setOpen(false);
      navigate('/cart');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b bg-muted/20">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-2xl font-black">
                <ShoppingBag className="w-6 h-6 text-primary" />
                Your Cart
            </div>
            {cart.length > 0 && (
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10 rounded-full" onClick={goToCart}>
                    Expand <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <PackageOpen className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground max-w-[250px] font-medium text-sm">
                Looks like you haven't added any gifts yet.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-full px-8 h-12 font-bold"
                onClick={() => setOpen(false)}
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="py-6 space-y-8">
              <div className="space-y-6">
                {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border">
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h4>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={() => removeFromCart(item.id)}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 font-black">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-full px-2 py-0.5 bg-background shadow-sm h-8">
                            <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:text-primary transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                            >
                            <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                            <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:text-primary transition-colors"
                            >
                            <Plus className="w-3 h-3" />
                            </button>
                        </div>
                        <span className="text-sm font-black ml-auto text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        </div>
                    </div>
                    </div>
                ))}
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Payment Method</p>
                <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)} className="grid grid-cols-2 gap-4">
                    <div>
                        <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                        <Label
                            htmlFor="cod"
                            className="flex flex-col items-center justify-between rounded-2xl border-2 border-muted bg-popover p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary transition-all cursor-pointer"
                        >
                            <Banknote className="mb-2 h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-tight">Cash on Delivery</span>
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="card" id="card" className="peer sr-only" />
                        <Label
                            htmlFor="card"
                            className="flex flex-col items-center justify-between rounded-2xl border-2 border-muted bg-popover p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary transition-all cursor-pointer"
                        >
                            <CreditCard className="mb-2 h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-tight">Credit Card</span>
                        </Label>
                    </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </ScrollArea>

        {cart.length > 0 && (
          <SheetFooter className="p-6 border-t bg-muted/10">
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Shipping Estimate</span>
                  <span className="text-green-600 font-bold uppercase text-[9px] tracking-widest bg-green-50 px-2 py-0.5 rounded-full">Free Shipping</span>
                </div>
                <Separator className="my-4 opacity-50" />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-lg font-black">Grand Total</span>
                  <span className="text-2xl font-black text-primary">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                onClick={handleCheckout}
                className="w-full h-14 font-black gap-2 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all text-base"
              >
                Place Order <ArrowRight className="w-5 h-5" />
              </Button>
              
              <p className="text-center text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">
                Secured by ወንዳየሁ Gift Systems
              </p>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}