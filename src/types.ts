export interface HeroDeal {
  id: string;
  title: string;
  edition: string;
  tagline: string;
  badge: string;
  discountPercent: number;
  originalPrice: number;
  salePrice: number;
  isFree?: boolean;
  deadlineText: string;
  deadlineTimestamp: number; // For live countdown calculation
  ctaText: string;
  ctaSubtext: string;
  ctaType: 'buy' | 'preorder' | 'free' | 'save';
  image: string;
  perks: string[];
  ecosystemReward?: {
    game: string;
    item: string;
    badge: string;
  };
  accentColor: string;
}

export interface UserPersona {
  id: string;
  title: string;
  role: string;
  avatarIcon: string;
  accentColor: string;
  avatarBg: string;
  keyFrustration: string;
  desiredOutcome: string;
  quote: string;
  idealPerks: string[];
  conversionTrigger: string;
}

export interface CoreFeature {
  id: string;
  name: string;
  benefit: string; // One-line benefit (focus on outcome, not functionality)
  iconName: string;
  metric: string;
  metricLabel: string;
  description: string;
}

export interface CatalogGame {
  id: string;
  title: string;
  developer: string;
  genre: string;
  category: 'spotlight' | 'free' | 'top_sellers' | 'pre_purchase';
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  isFree?: boolean;
  freeUntil?: string;
  rating: number;
  image: string;
  stackedPerk?: string;
  releaseDate?: string;
  epicRewardsCashback: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Savings & Pricing' | 'Free Games' | 'Rewards & Perks' | 'Launcher & Account';
  objectionResolved: string;
}

export interface EcosystemBundle {
  id: string;
  featuredTitle: string;
  featuredGameImage: string;
  featuredPrice: number;
  originalPrice: number;
  discountPercent: number;
  giftTitle: string;
  giftGame: string;
  giftValue: string;
  giftImage: string;
  perkDescription: string;
  deadline: string;
}
