import { Gift, Instagram, Twitter, Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-muted/30 pt-20 pb-10 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
                <Gift className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Wondayheu<span className="text-primary">.</span>
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Elevating the art of gifting. We curate premium products to help you celebrate life's most meaningful moments.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                <Facebook className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-lg">Shop</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">New Arrivals</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Gift Boxes</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Best Sellers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Flowers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Personalized</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-lg">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Track Order</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQs</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-lg">Newsletter</h4>
            <p className="text-muted-foreground mb-6">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="space-y-3">
              <Input placeholder="Enter your email" className="bg-background" />
              <Button className="w-full gap-2">
                <Mail className="w-4 h-4" /> Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2024 Wondayheu. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}