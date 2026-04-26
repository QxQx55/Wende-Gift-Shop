import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, ShoppingCart, TrendingUp, Loader2, ListChecks } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Order, Product } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StaffDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('*, items:order_items(*, product:products(*))').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false })
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;

      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    return [
      { label: "Pending Orders", value: pendingOrders.toString(), icon: Clock, color: "text-amber-500" },
      { label: "Total Orders", value: orders.length.toString(), icon: ShoppingCart, color: "text-blue-500" },
      { label: "Inventory Items", value: products.length.toString(), icon: Package, color: "text-purple-500" },
      { label: "Completed Today", value: orders.filter(o => o.status === 'completed' && new Date(o.created_at).toDateString() === new Date().toDateString()).length.toString(), icon: ListChecks, color: "text-green-500" },
    ];
  }, [orders, products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              Staff Portal
          </h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}. You have viewer access to orders and inventory.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-muted ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-black mt-1">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-black">Recent Orders</CardTitle>
              <CardDescription>View current order statuses and items.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold">Order ID</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 10).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs font-bold">{order.id.slice(0, 8)}</TableCell>
                        <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{order.status}</Badge>
                        </TableCell>
                        <TableCell className="font-bold">${Number(order.total_price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-black">Inventory View</CardTitle>
              <CardDescription>Monitor stock levels for all gift products.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold">Product</TableHead>
                      <TableHead className="font-bold">Stock</TableHead>
                      <TableHead className="font-bold text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.slice(0, 10).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-bold text-sm">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock > 10 ? "secondary" : "destructive"}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">${Number(product.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}