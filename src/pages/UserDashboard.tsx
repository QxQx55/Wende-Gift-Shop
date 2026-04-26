import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Clock, CheckCircle, Package, ArrowRight, User, Mail, MapPin, Eye, Loader2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function UserDashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(*))')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'confirmed': return <Package className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Profile Section */}
        <section className="flex flex-col md:flex-row items-center gap-8 bg-background p-8 rounded-[2.5rem] border shadow-sm">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-xl">
             <User className="w-16 h-16" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-black tracking-tight">{user?.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground font-medium">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {user?.email}</span>
              <Badge variant="secondary" className="rounded-full px-4 h-7 font-bold uppercase tracking-widest text-[10px]">
                {user?.role === 'admin' ? 'Administrator' : 'Valued Customer'}
              </Badge>
            </div>
          </div>
          <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20" onClick={logout}>
            Log Out
          </Button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Order History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" />
                Your Orders
              </h2>
              <Badge variant="outline" className="rounded-full font-bold">
                {orders.length} Total
              </Badge>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {orders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="group hover:border-primary/50 transition-all duration-300 rounded-3xl overflow-hidden border-2 border-muted">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                              <Package className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-lg">{order.id.slice(0, 8)}</span>
                              </div>
                              <p className="text-sm text-muted-foreground font-medium">
                                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-start md:items-end gap-2">
                            <div className="flex items-center gap-2 font-bold text-sm bg-muted/50 px-3 py-1.5 rounded-full">
                               {getStatusIcon(order.status)}
                               <span className="capitalize">{order.status}</span>
                            </div>
                            <p className="text-xl font-black text-primary">${Number(order.total_price).toFixed(2)}</p>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="rounded-xl h-11 w-full md:w-auto font-bold gap-2"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-4 h-4" /> View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {orders.length === 0 && (
                <div className="py-20 text-center bg-background rounded-[2.5rem] border border-dashed">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-xl font-bold">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">Start shopping to see your gift history here.</p>
                  <Link to="/">
                    <Button className="rounded-full px-8 h-12 font-bold">Browse Collection</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Account Details / Stats */}
          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary text-primary-foreground overflow-hidden relative">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />
               <CardHeader>
                 <CardTitle className="text-xl font-black">Membership Perks</CardTitle>
                 <CardDescription className="text-primary-foreground/70">Exclusive benefits for you.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Free Shipping</p>
                      <p className="text-[10px] opacity-70">On all orders over $100</p>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <OrderBreakdownDialog order={selectedOrder} open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)} />
    </div>
  );
}

function OrderBreakdownDialog({ order, open, onOpenChange }: { order: any | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 font-bold uppercase text-[10px] tracking-widest px-3 py-1">
              Order Details
            </Badge>
          </div>
          <DialogTitle className="text-3xl font-black">{order.id.slice(0, 8)}</DialogTitle>
          <DialogDescription className="font-medium">Placed on {new Date(order.created_at).toLocaleDateString('en-US', { dateStyle: 'full' })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          <div className="space-y-4">
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Items in Order</span>
                <span>{order.items?.length} Items</span>
             </div>
             <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 items-center bg-muted/30 p-3 rounded-2xl border border-muted">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 border">
                      <img src={item.product?.image_url} alt="" className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{item.product?.name}</p>
                      <p className="text-xs text-muted-foreground font-medium">Qty: {item.quantity} \u00d7 ${Number(item.price).toFixed(2)}</p>
                    </div>
                    <p className="font-black text-sm text-primary">${(item.quantity * Number(item.price)).toFixed(2)}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="space-y-4 bg-muted/20 p-6 rounded-3xl border border-dashed border-muted-foreground/20">
             <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-bold">${Number(order.total_price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Shipping</span>
                  <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Free</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-muted">
                  <span className="text-lg font-black">Total Price</span>
                  <span className="text-2xl font-black text-primary">${Number(order.total_price).toFixed(2)}</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Status</p>
                <p className="text-sm font-bold flex items-center gap-2">
                   <Badge variant={order.payment_status === 'paid' ? "default" : "outline"} className="text-[8px] h-4 uppercase">
                      {order.payment_status}
                   </Badge>
                </p>
             </div>
             <div className="space-y-1 text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Status</p>
                <p className="text-sm font-bold capitalize">{order.status}</p>
             </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="w-full rounded-2xl font-bold h-12 hover:bg-muted" onClick={() => onOpenChange(false)}>
            Close Breakdown
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}