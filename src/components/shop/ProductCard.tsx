import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, Eye, ImageIcon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ProductQuickView } from "./ProductQuickView";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop";

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div 
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group bg-white rounded-[2rem] overflow-hidden border border-zinc-100 hover:border-primary/20 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
        {!imgError ? (
          <motion.img 
            src={product.image || FALLBACK_IMAGE} 
            alt={product.name} 
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 text-zinc-300">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Image Unavailable</span>
          </div>
        )}
        
        {/* Overlays */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-all duration-300"
            />
          )}
        </AnimatePresence>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.stock < 10 && product.stock > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg animate-pulse">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
              Out of Stock
            </span>
          )}
          {product.price > 200 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
              Exclusive
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1] opacity-0 group-hover:opacity-100">
          <Button 
            size="icon" 
            variant="secondary" 
            className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md border-none shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
            onClick={() => setIsQuickViewOpen(true)}
          >
            <Eye className="w-6 h-6 text-zinc-900" />
          </Button>
          <Button 
            size="icon" 
            disabled={product.stock === 0}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground border-none shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => addToCart(product)}
          >
            <ShoppingBag className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
            {product.category}
          </span>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-zinc-600">{product.rating || 0}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-zinc-900 group-hover:text-primary transition-colors duration-300 line-clamp-1 mb-2">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <p className="text-2xl font-black tracking-tight text-zinc-900">
            ${Number(product.price).toFixed(2)}
          </p>
          <span className="text-[10px] font-bold text-zinc-400 uppercase">
            {product.event || "Gifting"}
          </span>
        </div>
      </div>

      <ProductQuickView 
        product={product} 
        open={isQuickViewOpen} 
        onOpenChange={setIsQuickViewOpen} 
      />
    </motion.div>
  );
}