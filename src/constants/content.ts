export interface HeroContent {
  videoUrl: string;
  fallbackImageUrl: string;
  tagline: string;
  titleTop: string;
  titleBottom: string;
  titleBottomBgUrl: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
}

export interface ConsultingContent {
  title: string;
  description: string;
  imageUrl: string;
  primaryCta: string;
  secondaryCta: string;
}

export const HERO_CONTENT: HeroContent = {
  videoUrl: "https://player.vimeo.com/external/494252666.hd.mp4?s=2f8146747d79679199d7a2f5888d3e6913e618e4&profile_id=175",
  fallbackImageUrl: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/95256d07-9087-4d6c-85b4-80bb5970fa97/hero-fallback-luxury-gift-shop-0be4b709-1776964432048.webp",
  tagline: "The Art of Giving",
  titleTop: "ወንዳየሁ",
  titleBottom: "Gift Shop",
  titleBottomBgUrl: "https://storage.googleapis.com/dala-prod-public-storage/attachments/5d410529-d0aa-49e7-bb80-97b1de8a8f2b/1776965564751_image.png",
  description: "Curated elegance for life's most precious moments. Experience a new standard of luxury gifting with our premium selection of hand-picked treasures.",
  primaryCta: "Explore Collection",
  secondaryCta: "Our Services"
};

export const CONSULTING_CONTENT: ConsultingContent = {
  title: "Personalized Consulting",
  description: "Our expert gift consultants are dedicated to helping you find the perfect expression of your sentiment, from corporate gifting to intimate celebrations.",
  imageUrl: "https://storage.googleapis.com/dala-prod-public-storage/attachments/5d410529-d0aa-49e7-bb80-97b1de8a8f2b/1776965564751_image.png",
  primaryCta: "Book Now",
  secondaryCta: "Corporate"
};

export const FALLBACK_REVIEWS = [
  {
    id: "r1",
    userName: "Selamawit Tadesse",
    userImage: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/95256d07-9087-4d6c-85b4-80bb5970fa97/reviewer-1-9bc97149-1776578462651.webp",
    rating: 5,
    comment: "The Luxury Silk Gift Box surpassed all my expectations. The presentation was flawless!",
    date: "2 days ago",
    productName: "Luxury Silk Gift Box"
  },
  {
    id: "r2",
    userName: "Dawit Girma",
    userImage: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/95256d07-9087-4d6c-85b4-80bb5970fa97/reviewer-2-90bd8712-1776578462717.webp",
    rating: 5,
    comment: "I bought the Executive Leather Belt for my father's birthday. The quality is exceptional.",
    date: "1 week ago",
    productName: "Executive Leather Belt"
  }
];