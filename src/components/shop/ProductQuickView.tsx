import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Star, ShoppingBag, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductQuickViewProps {
  product: Product;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function ProductQuickView({ product, open, onOpenChange, children }: ProductQuickViewProps) {
  const { addToCart } = useCart();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden gap-0 border-none rounded-[2rem] shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-square md:aspect-auto bg-zinc-100">
            <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
            <Badge className="absolute top-6 left-6 bg-primary text-primary-foreground px-4 py-2 rounded-full font-black uppercase tracking-widest text-[10px]">
              {product.category}
            </Badge>
          </div>
          <div className="p-12 flex flex-col bg-white">
            <DialogHeader className="mb-8">
              <div className="flex items-center gap-3 text-amber-500 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? "fill-current" : ""}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">({product.reviews || 0} Reviews)</span>
              </div>
              <DialogTitle className="text-4xl font-black uppercase italic tracking-tighter">{product.name}</DialogTitle>
              <p className="text-3xl font-black text-primary mt-4">${Number(product.price).toFixed(2)}</p>
            </DialogHeader>

            <p className="text-zinc-500 text-lg leading-relaxed mb-10 flex-1">
              {product.description}
            </p>

            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Secure Pay</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">30-Day Return</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => addToCart(product)}
                  className="flex-1 h-16 text-lg font-black uppercase tracking-widest gap-3 rounded-full bg-primary hover:bg-zinc-900 transition-all duration-300"
                >
                  <ShoppingBag className="w-6 h-6" /> Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}