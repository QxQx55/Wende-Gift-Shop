import { Hero } from "@/components/shop/Hero";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ReviewSection } from "@/components/shop/ReviewSection";
import { motion, Variants } from "framer-motion";
import { CONSULTING_CONTENT } from "@/constants/content";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export function HomePage() {
  return (
    <div className="bg-background">
      <Hero />
      <div className="h-24 bg-gradient-to-b from-background to-transparent" />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants} className="bg-transparent py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16 px-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase italic mb-4">አዲስ <span className="text-primary">Arrivals</span></h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Explore our latest curated collection of premium gifts and luxury items.</p>
          </div>
          <ProductGrid />
        </div>
      </motion.div>
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}><ReviewSection /></motion.section>
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants} className="max-w-[1600px] mx-auto px-4 py-32">
         <div className="rounded-[3rem] bg-zinc-950/40 backdrop-blur-sm text-white p-12 md:p-32 overflow-hidden relative group shadow-2xl border border-white/10">
            <div className="absolute inset-0 bg-contain bg-right bg-no-repeat opacity-100 group-hover:scale-105 transition-transform duration-[2000ms] hidden md:block" style={{ backgroundImage: `url('${CONSULTING_CONTENT.imageUrl}')`, backgroundPosition: 'right 5% center', backgroundSize: 'auto 95%' }} />
            <div className="absolute inset-0 bg-cover bg-center opacity-90 md:hidden" style={{ backgroundImage: `url('${CONSULTING_CONTENT.imageUrl}')` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/20 to-transparent" />
            <div className="max-w-2xl relative z-10">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="w-16 h-1 bg-primary mb-12" />
              <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter uppercase italic leading-[1.1]">{CONSULTING_CONTENT.title.split(' ')[0]} <br/> {CONSULTING_CONTENT.title.split(' ')[1]}</h2>
              <p className="text-xl text-zinc-300 mb-12 leading-relaxed font-medium">{CONSULTING_CONTENT.description}</p>
              <div className="flex flex-wrap gap-6">
                <button className="bg-primary text-primary-foreground px-10 py-5 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-white hover:text-black transition-all duration-300">{CONSULTING_CONTENT.primaryCta}</button>
                <button className="bg-transparent backdrop-blur-md border border-white/20 px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-white/20 transition-all duration-300">{CONSULTING_CONTENT.secondaryCta}</button>
              </div>
            </div>
         </div>
      </motion.section>
    </div>
  );
}