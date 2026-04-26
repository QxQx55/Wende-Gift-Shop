import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShoppingBasket, MousePointer2 } from "lucide-react";
import { HERO_CONTENT } from "@/constants/content";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as any,
    },
  },
};

export function Hero() {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }} className="w-full h-full">
          <video autoPlay loop muted playsInline poster={HERO_CONTENT.fallbackImageUrl} className="absolute w-full h-full object-cover">
            <source src={HERO_CONTENT.videoUrl} type="video/mp4" />
            <img src={HERO_CONTENT.fallbackImageUrl} alt="Luxury Gift Shop" className="w-full h-full object-cover" />
          </video>
        </motion.div>
        <div className="absolute inset-0 bg-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
      </div>
      <motion.div className="container mx-auto px-4 relative z-10 text-center" variants={containerVariants} initial="hidden" animate="visible">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-transparent text-white text-sm font-semibold mb-8 border border-white/20 shadow-2xl">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="tracking-widest uppercase">{HERO_CONTENT.tagline}</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-6xl md:text-[9rem] font-black tracking-tighter mb-8 leading-[0.9] text-white uppercase italic">
            <span className="block drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">{HERO_CONTENT.titleTop}</span>
            <span className="block text-transparent bg-clip-text drop-shadow-none bg-cover bg-center" style={{ backgroundImage: `url('${HERO_CONTENT.titleBottomBgUrl}')` }}>{HERO_CONTENT.titleBottom}</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">{HERO_CONTENT.description}</motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="h-16 px-12 text-xl gap-3 rounded-full w-full sm:w-auto shadow-2xl bg-primary text-primary-foreground font-bold uppercase transition-all duration-300 hover:scale-105 active:scale-95">
              {HERO_CONTENT.primaryCta} <ArrowRight className="w-6 h-6" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-12 text-xl gap-3 rounded-full w-full sm:w-auto bg-transparent backdrop-blur-md border-white/30 text-white font-bold uppercase transition-all duration-300">
              {HERO_CONTENT.secondaryCta} <ShoppingBasket className="w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Discover</span>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}><MousePointer2 className="w-5 h-5" /></motion.div>
      </motion.div>
    </section>
  );
}