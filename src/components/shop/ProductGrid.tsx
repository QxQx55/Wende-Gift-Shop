import { useState, useMemo, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { Product, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, Search, X, Loader2, AlertCircle, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { getAllProducts, getCategories, subscribeToProducts, subscribeToCategories, supabase } from "@/lib/supabase";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const EVENT_TYPES = [
  "All",
  "Birthday",
  "Anniversary",
  "Wedding",
  "Corporate",
  "Graduation",
  "Valentine's Day",
  "Mother's Day",
  "Father's Day"
];

type SortOption = "newest" | "price-low" | "price-high" | "name";

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeEvent, setActiveEvent] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching grid data:', err);
      setError(err.message || "Failed to load products.");
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

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesEvent = activeEvent === "All" || p.event === activeEvent;
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.event && p.event.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      
      return matchesCategory && matchesEvent && matchesSearch && matchesPrice;
    });

    // Sorting
    return result.sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "name": return a.name.localeCompare(b.name);
        case "newest":
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });
  }, [products, activeCategory, activeEvent, searchQuery, priceRange, sortBy]);

  const allCategoryNames = useMemo(() => ["All", ...categories.map(c => c.name)], [categories]);

  const resetFilters = () => {
    setActiveCategory("All");
    setActiveEvent("All");
    setSearchQuery("");
    setPriceRange([0, 5000]);
    setSortBy("newest");
  };

  const isFiltered = activeCategory !== "All" || activeEvent !== "All" || searchQuery !== "" || priceRange[0] !== 0 || priceRange[1] !== 5000;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-60 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">Curating Selection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-60 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-3xl font-black uppercase italic mb-4">Connection Lost</h3>
        <p className="text-xl text-zinc-400 max-w-md mx-auto mb-10">{error}</p>
        <Button onClick={() => { setLoading(true); fetchData(); }} className="rounded-full h-14 font-black px-10">Retry</Button>
      </div>
    );
  }

  return (
    <section className="max-w-[1600px] mx-auto px-6 py-32" id="shop">
      <div className="flex flex-col space-y-12 mb-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mb-6">
              <div className="h-[1px] w-12 bg-primary/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Exquisite Selection</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-5xl md:text-8xl font-black mb-8 tracking-tighter uppercase italic leading-[0.85] text-zinc-900">
              The <span className="text-primary">Artisan</span> <br/> Collection
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl md:text-2xl text-muted-foreground font-medium">
              Meticulously curated gifts designed to celebrate life's most precious moments with grace and elegance.
            </motion.p>
          </div>
          
          <div className="flex flex-col items-start lg:items-end gap-6 w-full lg:w-auto">
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary" />
                <Input 
                  placeholder="Search our boutique..." 
                  className="pl-12 h-16 rounded-full bg-zinc-100 border-none transition-all focus-visible:ring-1 focus-visible:ring-primary/20"
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-zinc-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full h-16 px-8 font-black uppercase tracking-widest text-[11px] border-zinc-200">
                    Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'price-low' ? 'Price: Low' : sortBy === 'price-high' ? 'Price: High' : 'Name'}
                    <ChevronDown className="ml-2 w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-[1.5rem] p-2 min-w-[200px] shadow-2xl border-zinc-100">
                  {[ 
                    { id: 'newest', label: 'Newest Arrivals' }, 
                    { id: 'price-low', label: 'Price: Low to High' }, 
                    { id: 'price-high', label: 'Price: High to Low' }, 
                    { id: 'name', label: 'Alphabetical' } 
                  ].map(option => (
                    <DropdownMenuItem 
                      key={option.id} 
                      onClick={() => setSortBy(option.id as SortOption)}
                      className="rounded-xl font-bold uppercase tracking-widest text-[10px] p-4 cursor-pointer"
                    >
                      {option.label}
                      {sortBy === option.id && <Check className="ml-auto w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto">
              <Button 
                variant={isFilterOpen ? "default" : "outline"} 
                className={`rounded-full h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-lg transition-all ${isFilterOpen ? 'bg-zinc-900 text-white' : ''}`} 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" /> Refine Selection
                {isFiltered && <span className="ml-2 w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />}
              </Button>
              {isFiltered && (
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 px-2" onClick={resetFilters}>
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0, y: -20 }} 
              animate={{ height: "auto", opacity: 1, y: 0 }} 
              exit={{ height: 0, opacity: 0, y: -20 }}
              className="overflow-hidden bg-white rounded-[3rem] border border-zinc-100 shadow-2xl"
            >
              <div className="p-12 space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                  {/* Category Selection */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                      <div className="h-[1px] w-8 bg-zinc-200" /> Curated Categories
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {allCategoryNames.map((cat) => (
                        <button 
                          key={cat} 
                          onClick={() => setActiveCategory(cat)} 
                          className={`px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeCategory === cat ? "bg-zinc-900 text-white shadow-xl scale-105" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Event Selection */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                      <div className="h-[1px] w-8 bg-zinc-200" /> Special Occasions
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {EVENT_TYPES.map((evt) => (
                        <button 
                          key={evt} 
                          onClick={() => setActiveEvent(evt)} 
                          className={`px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeEvent === evt ? "bg-primary text-primary-foreground shadow-xl scale-105" : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"}`}
                        >
                          {evt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div className="pt-8 border-t border-zinc-50">
                  <div className="max-w-xl space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                        <div className="h-[1px] w-8 bg-zinc-200" /> Price Boundary
                      </div>
                      <span className="text-2xl font-black italic">${priceRange[0]} \u2014 ${priceRange[1]}</span>
                    </div>
                    <Slider 
                      defaultValue={[0, 5000]} 
                      max={5000} 
                      step={50} 
                      value={priceRange} 
                      onValueChange={setPriceRange} 
                      className="py-6"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-10 gap-y-16">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredAndSortedProducts.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-60 text-center">
          <div className="w-32 h-32 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-10">
            <Search className="w-12 h-12 text-zinc-300" />
          </div>
          <h3 className="text-3xl font-black uppercase italic mb-4">No matching treasures</h3>
          <p className="text-xl text-zinc-400 max-w-md mx-auto">Adjust filters to discover more exquisite items.</p>
          <Button 
            variant="link" 
            onClick={resetFilters} 
            className="mt-8 text-primary font-black uppercase tracking-widest text-xs"
          >
            Clear all filters
          </Button>
        </motion.div>
      )}
    </section>
  );
}