import { useState, useEffect } from "react";
import { getReviews, subscribeToProducts, supabase } from "@/lib/supabase";
import { FALLBACK_REVIEWS } from "@/constants/content";
import { Review } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  const fetchReviewsData = async () => {
    try {
      const data = await getReviews();
      setReviews(data.length > 0 ? data : (FALLBACK_REVIEWS as Review[]));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(FALLBACK_REVIEWS as Review[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
    const sub = subscribeToProducts(() => fetchReviewsData());
    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const next = () => setIndex((prev) => (prev + 1) % reviews.length);
  const prev = () => setIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  if (loading) {
    return (
      <div className="py-40 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-40 bg-transparent text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#222,transparent)] opacity-30" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
            <Sparkles className="w-10 h-10 text-primary mb-6 animate-pulse" />
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic text-zinc-900">Client <span className="text-primary">Elegance</span></h2>
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (<Star key={i} className="w-6 h-6 fill-primary text-primary" />))}
            </div>
            <p className="text-zinc-500 text-xl font-medium">Stories of joy and celebration from our distinguished guests</p>
          </motion.div>
        </div>
        <div className="relative h-[600px] md:h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.05, y: -30 }} transition={{ duration: 0.8 }} className="absolute inset-0 flex flex-col items-center text-center">
              <div className="relative mb-12">
                <motion.div whileHover={{ scale: 1.1 }} className="w-32 h-32 rounded-[2.5rem] border-4 border-zinc-200 shadow-2xl overflow-hidden mx-auto bg-zinc-100 p-1">
                  <img src={reviews[index].userImage} alt={reviews[index].userName} className="w-full h-full object-cover rounded-[2.2rem]" />
                </motion.div>
                <Quote className="absolute -top-4 -right-8 w-16 h-16 text-primary/10 fill-current rotate-180" />
              </div>
              <div className="max-w-4xl">
                <p className="text-3xl md:text-5xl font-black mb-10 italic leading-[1.2] text-zinc-900 tracking-tight">“{reviews[index].comment}”</p>
                <div className="flex flex-col items-center gap-2">
                  <h4 className="text-2xl font-black uppercase tracking-widest text-primary">{reviews[index].userName}</h4>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-[0.4em] font-bold">Official Patron • {reviews[index].productName}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-0">
            <Button variant="ghost" size="icon" onClick={prev} className="rounded-full h-16 w-16 bg-zinc-100/50 hover:bg-zinc-200/50 border backdrop-blur-md text-zinc-900"><ChevronLeft className="w-8 h-8" /></Button>
            <Button variant="ghost" size="icon" onClick={next} className="rounded-full h-16 w-16 bg-zinc-100/50 hover:bg-zinc-200/50 border backdrop-blur-md text-zinc-900"><ChevronRight className="w-8 h-8" /></Button>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-12">
          {reviews.map((_, i) => (<button key={i} onClick={() => setIndex(i)} className={`h-1.5 rounded-full transition-all duration-700 ${i === index ? "w-16 bg-primary" : "w-4 bg-zinc-200"}`} />))}
        </div>
      </div>
    </section>
  );
}