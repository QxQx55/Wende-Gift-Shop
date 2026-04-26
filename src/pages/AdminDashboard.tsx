import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ShoppingCart, Package, Plus, Trash2, Edit, Clock, Search, Loader2, Tag, Gift, Upload, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useEffect, useRef } from "react";
import { Order, OrderStatus, Product, Category } from "@/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, subscribeToProducts, subscribeToCategories, getAllProducts, getCategories, createCategory, deleteProduct as deleteProductFromDB, createProduct, updateProduct, uploadProductImage } from "@/lib/supabase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const EVENT_TYPES = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Corporate",
  "Graduation",
  "Valentine's Day",
  "Mother's Day",
  "Father's Day",
  "Other"
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop";

export function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const fetchData = async () => {
    try {
      const [ordersRes, productsData, categoriesData] = await Promise.all([
        supabase.from('orders').select('*, items:order_items(*, product:products(*))').order('created_at', { ascending: false }),
        getAllProducts(),
        getCategories()
      ]);
      if (ordersRes.error) throw ordersRes.error;
      setOrders(ordersRes.data || []);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const prodSub = subscribeToProducts(() => fetchData());
    const catSub = subscribeToCategories(() => fetchData());
    return () => {
      supabase.removeChannel(prodSub);
      supabase.removeChannel(catSub);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, filterCategory]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
    const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    return [
      { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
      { label: "Total Orders", value: orders.length.toString(), icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50" },
      { label: "Active Orders", value: activeOrders.toString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
      { label: "Inventory", value: products.length.toString(), icon: Package, color: "text-purple-500", bg: "bg-purple-50" },
    ];
  }, [orders, products]);

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success(`Order status updated to ${status}`);
      fetchData();
    } catch (error: any) { toast.error(error.message); }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProductFromDB(id);
      toast.success("Product removed from inventory");
    } catch (error: any) { toast.error(error.message); }
  };

  const handleCreateCategory = async () => {
    const name = prompt("Enter new category name:");
    if (!name) return;
    try {
      await createCategory(name);
      toast.success("Category added");
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Management Portal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 uppercase italic">
              Control <span className="text-primary">Center</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">Welcome back, {user?.name}. You have <span className="font-bold text-zinc-900 uppercase">{user?.role}</span> privileges.</p>
          </motion.div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={handleCreateCategory} 
              className="rounded-2xl font-bold h-12 px-6 border-zinc-200 hover:bg-white hover:shadow-md transition-all"
            >
              <Tag className="w-4 h-4 mr-2 text-primary" /> New Category
            </Button>
            <ProductDialog categories={categories} onProductSaved={fetchData} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                <CardContent className="p-8 relative">
                  <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${stat.bg} group-hover:scale-110 transition-transform duration-500`} />
                  <div className={`p-4 rounded-2xl ${stat.bg} w-fit mb-6 transition-transform group-hover:scale-110`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-zinc-900">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-white/50 backdrop-blur-md p-1.5 h-16 rounded-[2rem] border border-zinc-200 w-full max-w-md shadow-sm">
            <TabsTrigger value="products" className="rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] h-full data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all">Inventory</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] h-full data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-0">
            <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
              <CardHeader className="bg-white border-b border-zinc-100 p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <CardTitle className="text-2xl font-black uppercase italic">Gift Inventory</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Manage products, stock levels, and pricing.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      placeholder="Search products..." 
                      className="rounded-2xl w-full sm:w-64 pl-11 h-12 bg-slate-50 border-zinc-200 focus:bg-white transition-all"
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="rounded-2xl w-full sm:w-48 h-12 bg-slate-50 border-zinc-200 font-medium">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-zinc-100">
                        <TableHead className="w-[80px] py-6 font-black uppercase tracking-widest text-[10px] pl-8">Image</TableHead>
                        <TableHead className="py-6 font-black uppercase tracking-widest text-[10px]">Product Details</TableHead>
                        <TableHead className="py-6 font-black uppercase tracking-widest text-[10px]">Category & Event</TableHead>
                        <TableHead className="py-6 font-black uppercase tracking-widest text-[10px]">Price</TableHead>
                        <TableHead className="py-6 font-black uppercase tracking-widest text-[10px]">Stock</TableHead>
                        <TableHead className="py-6 text-right font-black uppercase tracking-widest text-[10px] pr-8">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {filteredProducts.map((p) => (
                          <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors border-b border-zinc-50">
                            <TableCell className="py-6 pl-8">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted">
                                <ProductImageWithFallback src={p.image} name={p.name} />
                              </div>
                            </TableCell>
                            <TableCell className="py-6">
                              <div>
                                <p className="font-black text-zinc-900">{p.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{p.description}</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-6">
                              <div className="flex flex-col gap-1.5">
                                <Badge variant="secondary" className="w-fit rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-100">{p.category}</Badge>
                                {p.event && <Badge variant="outline" className="w-fit rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border-primary/20 text-primary">{p.event}</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="py-6">
                              <span className="font-black text-zinc-900">${Number(p.price).toFixed(2)}</span>
                            </TableCell>
                            <TableCell className="py-6">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-emerald-500' : p.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                <span className="font-bold text-sm">{p.stock}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-6 text-right pr-8">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ProductDialog product={p} categories={categories} onProductSaved={fetchData} />
                                {isAdmin && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:bg-red-50 hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-[2rem]">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="font-black uppercase italic">Remove Product?</AlertDialogTitle>
                                        <AlertDialogDescription className="font-medium">This will permanently remove <span className="font-bold text-zinc-900">{p.name}</span> from the inventory. This action cannot be undone.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-2xl font-bold">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteProduct(p.id)} className="bg-destructive text-white hover:bg-red-600 rounded-2xl font-bold">Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </AnimatePresence>
                      {filteredProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-[400px] text-center">
                            <div className="flex flex-col items-center justify-center gap-4">
                              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center"><Gift className="w-10 h-10 text-zinc-200" /></div>
                              <h3 className="text-xl font-black uppercase italic">No products found</h3>
                              <p className="text-muted-foreground font-medium">Try adjusting your search or filters.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
              <CardHeader className="bg-white border-b border-zinc-100 p-8">
                <CardTitle className="text-2xl font-black uppercase italic">Customer Orders</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Monitor and manage order fulfillment.</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-zinc-100">
                        <TableHead className="py-6 pl-8 font-black uppercase tracking-widest text-[10px]">Order ID</TableHead>
                        <TableHead className="py-6 font-black uppercase tracking-widest text-[10px]">Date</TableHead>
                        <TableHead className="py-6 font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                        <TableHead className="py-6 font-black uppercase tracking-widest text-[10px]">Customer</TableHead>
                        <TableHead className="py-6 font-black uppercase tracking-widest text-[10px]">Total</TableHead>
                        <TableHead className="py-6 text-right font-black uppercase tracking-widest text-[10px] pr-8">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map(o => (
                        <TableRow key={o.id} className="hover:bg-slate-50/50 border-b border-zinc-50">
                          <TableCell className="py-6 pl-8 font-mono text-xs font-bold">{o.id.slice(0,8).toUpperCase()}</TableCell>
                          <TableCell className="py-6 font-medium text-sm">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="py-6">
                            <Badge className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${o.status === 'completed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : o.status === 'confirmed' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : o.status === 'cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}`}>{o.status}</Badge>
                          </TableCell>
                          <TableCell className="py-6 text-sm font-medium text-zinc-600">Anonymous Guest</TableCell>
                          <TableCell className="py-6 font-black">${Number(o.total_price).toFixed(2)}</TableCell>
                          <TableCell className="py-6 text-right pr-8">
                            <div className="flex justify-end gap-2">
                              {o.status === 'pending' && <Button size="sm" onClick={() => updateOrderStatus(o.id, 'confirmed')} className="h-9 px-4 rounded-xl font-bold bg-zinc-900 text-white hover:bg-zinc-800">Confirm</Button>}
                              {o.status === 'confirmed' && <Button size="sm" onClick={() => updateOrderStatus(o.id, 'completed')} className="h-9 px-4 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700">Complete</Button>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {orders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-[400px] text-center">
                            <div className="flex flex-col items-center justify-center gap-4">
                              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center"><ShoppingCart className="w-10 h-10 text-zinc-200" /></div>
                              <h3 className="text-xl font-black uppercase italic">No orders yet</h3>
                              <p className="text-muted-foreground font-medium">Sales data will appear here once customers start buying.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProductImageWithFallback({ src, name }: { src: string, name: string }) {
  const [error, setError] = useState(false);
  return (
    <div className="w-full h-full">
      {!error ? (
        <img 
          src={src || FALLBACK_IMAGE} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-300">
          <ImageIcon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}

function ProductDialog({ product, categories, onProductSaved }: { product?: Product, categories: Category[], onProductSaved: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(product?.image || null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: product?.name || "", 
    price: product?.price.toString() || "", 
    category: product?.category || "", 
    description: product?.description || "", 
    stock: product?.stock.toString() || "0",
    event: product?.event || ""
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Size check (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File is too large. Max size is 5MB.");
    }

    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setImageUrl(url);
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Ensure bucket 'product-images' exists.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error("Product name is required");
    if (!formData.price || isNaN(Number(formData.price))) return toast.error("Valid price is required");
    if (!formData.category) return toast.error("Category is required");
    if (!imageUrl) return toast.error("Product image is required");
    
    setLoading(true);
    try {
      const payload = { 
        name: formData.name, 
        price: Number(formData.price), 
        category: formData.category, 
        description: formData.description, 
        stock: parseInt(formData.stock) || 0, 
        image: imageUrl, 
        event: formData.event || null
      };
      if (product) {
        await updateProduct(product.id, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product added to collection");
      }
      onProductSaved();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={product ? "ghost" : "default"}
          className={product ? "h-10 w-10 rounded-xl p-0 hover:bg-white" : "rounded-2xl font-black h-12 px-6 uppercase tracking-widest text-[11px] shadow-lg"}
        >
          {product ? <Edit className="w-4 h-4 text-zinc-400 group-hover:text-primary" /> : <Plus className="w-4 h-4 mr-2" />}
          {!product && "Add Product"}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2.5rem] max-w-2xl max-h-[90vh] overflow-y-auto p-10">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black uppercase italic">{product ? "Refine" : "New"} <span className="text-primary">Treasure</span></DialogTitle>
          <p className="text-muted-foreground font-medium">Enter the exquisite details of your product.</p>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Product Name</Label>
              <Input placeholder="Ex: Luxury Silk Scarf" className="rounded-2xl h-12 bg-slate-50 border-zinc-200" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Price ($)</Label>
                <Input placeholder="0.00" type="number" className="rounded-2xl h-12 bg-slate-50 border-zinc-200" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Stock</Label>
                <Input placeholder="0" type="number" className="rounded-2xl h-12 bg-slate-50 border-zinc-200" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Category</Label>
              <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                <SelectTrigger className="rounded-2xl h-12 bg-slate-50 border-zinc-200 font-medium"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="rounded-2xl">{categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Special Event</Label>
              <Select value={formData.event} onValueChange={v => setFormData({...formData, event: v})}>
                <SelectTrigger className="rounded-2xl h-12 bg-slate-50 border-zinc-200 font-medium"><SelectValue placeholder="Select event (optional)" /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="">None</SelectItem>
                  {EVENT_TYPES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Description</Label>
              <Textarea placeholder="Describe the craftsmanship and luxury..." className="rounded-2xl min-h-[120px] bg-slate-50 border-zinc-200" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Product Imagery</Label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[2rem] h-[160px] flex flex-col items-center justify-center cursor-pointer transition-all ${imageUrl ? 'border-primary/20 bg-primary/5' : 'border-zinc-200 hover:border-zinc-400 bg-slate-50'}`}
              >
                {uploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : imageUrl ? (
                  <div className="relative w-full h-full p-2 group">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-[1.5rem]" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-[1.5rem] transition-opacity"><Upload className="w-6 h-6 text-white" /></div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Upload Photo</p>
                  </div>
                )}
                <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
              </div>
              {imageUrl && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); setImageUrl(null); }}
                  className="w-full mt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-destructive"
                >
                  Remove Image
                </Button>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit} disabled={loading || uploading} className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:translate-y-[-2px] transition-transform">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {product ? "Save Masterpiece" : "Publish Treasure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}