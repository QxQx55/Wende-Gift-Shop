import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Plus, Minus, ArrowRight, PackageOpen, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuthDialog } from "@/components/auth/AuthDialog";

export function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to place an order");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          total_price: cartTotal,
          status: 'pending',
          payment_status: 'unpaid',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success('Order placed successfully! Cash on Delivery.');
      clearCart();
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error processing order.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-[1400px] mx-auto px-4 py-12 md:py-20">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-12"
        >
          {/* Main Cart Content */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-8">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-primary" />
                Your Shopping Cart
              </h1>
            </div>

            {cart.length === 0 ? (
              <div className="bg-card border rounded-[2rem] p-12 md:p-24 text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <PackageOpen className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Your cart is empty</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-lg">
                  It looks like you haven't added any gifts yet. Explore our collection to find something special!
                </p>
                <Link to="/">
                  <Button size="lg" className="rounded-full px-10 h-14 text-lg">
                    Browse Collection
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="bg-card border rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 items-center group hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border group-hover:scale-105 transition-transform duration-500">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-primary mb-1">{item.category}</p>
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{item.name}</h3>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      <p className="text-muted-foreground line-clamp-2 mb-6 text-sm">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                        <div className="flex items-center gap-4 bg-muted/50 rounded-full px-4 py-2 border">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:text-primary transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center text-lg font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Price: ${item.price.toFixed(2)}</p>
                          <p className="text-2xl font-bold text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {cart.length > 0 && (
            <div className="lg:w-[400px]">
              <div className="bg-card border rounded-[2.5rem] p-8 shadow-xl sticky top-28">
                <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-muted-foreground text-lg">
                    <span>Subtotal</span>
                    <span className="text-foreground font-semibold">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-lg">
                    <span>Shipping</span>
                    <span className="text-green-600 font-bold uppercase text-sm tracking-wider">Free</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-lg">
                    <span>Estimated Tax</span>
                    <span className="text-foreground font-semibold">$0.00</span>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-3xl font-extrabold text-primary">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {isAuthenticated ? (
                    <Button 
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full h-16 text-xl font-bold gap-3 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>Complete Checkout <ArrowRight className="w-6 h-6" /></>
                      )}
                    </Button>
                  ) : (
                    <AuthDialog>
                      <Button className="w-full h-16 text-xl font-bold gap-3 rounded-full">
                        Sign In to Checkout <ArrowRight className="w-6 h-6" />
                      </Button>
                    </AuthDialog>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-full font-semibold border-2"
                    onClick={() => navigate('/')}
                  >
                    Continue Shopping
                  </Button>
                </div>

                <div className="mt-8 pt-8 border-t space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 flex-shrink-0">
                        <PackageOpen className="w-5 h-5" />
                    </div>
                    <p>Free premium gift packaging included on all orders today!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}