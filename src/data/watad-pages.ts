export interface PricingPlan {
  name: string;
  price: string;
  currency: string;
  period?: string;
  description: string;
  features?: string[];
  cta: { label: string; href: string };
  featured?: boolean;
  badge?: string;
  note?: string;
}

export interface WatadPageSection {
  id?: string;
  title?: string;
  paragraphs?: string[];
  list?: string[];
  paymentOptions?: {
    icon: 'bank' | 'wallet' | 'split' | 'milestone';
    title: string;
    summary: string;
    description: string;
  }[];
  cards?: {
    title: string;
    text: string;
    meta?: string;
    href?: string;
    photo?: string;
    icon?: 'web' | 'mobile' | 'design' | 'security' | 'commerce' | 'cloud' | 'email' | 'instagram';
  }[];
  pricingPlans?: PricingPlan[];
}

export interface WatadPage {
  slug: string;
  title: string;
  eyebrow?: string;
  intro: string;
  sections: WatadPageSection[];
  cta?: { label: string; href: string };
}
