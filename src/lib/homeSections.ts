export interface PortfolioTexts {
  title: string;
  subtitle: string;
  button: string;
}

export interface ServicesTexts {
  badge: string;
  title: string;
  subtitle: string;
  testimonials_title: string;
  testimonials_subtitle: string;
  page_badge?: string;
  page_title?: string;
  hidden_price_ids?: string[];
}

export interface PromptsTexts {
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
}

export interface BooksTexts {
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  cta_title: string;
  cta_subtitle: string;
}

export interface BlogTexts {
  badge: string;
  title: string;
  subtitle: string;
}

export interface ClientsTexts {
  badge: string;
  title: string;
  subtitle: string;
}

export interface HomeSections {
  clients: ClientsTexts;
  portfolio: PortfolioTexts;
  services: ServicesTexts;
  prompts: PromptsTexts;
  books: BooksTexts;
  blog: BlogTexts;
}

export const defaultHomeSections: HomeSections = {
  clients: {
    badge: "شركاء النجاح",
    title: "عملاء أفتخر بالعمل معهم",
    subtitle: "",
  },
  portfolio: {
    title: "مشاريع مختارة",
    subtitle: "نماذج من أعمالي في الإنتاج البصري بالذكاء الاصطناعي",
    button: "عرض جميع الأعمال",
  },
  services: {
    badge: "الخدمات",
    title: "ما أقدمه لك",
    subtitle: "خدمات متكاملة في الإنتاج البصري بالذكاء الاصطناعي",
    testimonials_title: "ماذا يقول العملاء",
    testimonials_subtitle: "آراء حقيقية من عملاء حقيقيين",
    page_badge: "الباقات والأسعار",
    page_title: "جميع الخدمات",
    hidden_price_ids: [],
  },
  prompts: {
    badge: "أداة مجانية",
    title: "مولد البرومبت",
    highlight: "الاحترافي",
    subtitle: "حوّل فكرتك إلى برومبت احترافي جاهز للاستخدام في أدوات AI المختلفة",
  },
  books: {
    badge: "المنتجات الرقمية",
    title: "حوّل خبرتي إلى",
    highlight: "أدوات تساعدك",
    subtitle: "كتب ومكتبات برومبتات مصممة لتوفير وقتك وتحسين نتائجك",
    cta_title: "هل تريد مشروعًا مخصصًا؟",
    cta_subtitle: "احجز جلسة استشارية مجانية لمدة 30 دقيقة ونناقش مشروعك",
  },
  blog: {
    badge: "المدونة",
    title: "آخر المقالات",
    subtitle: "تعلم AI Photography وهندسة البرومبتات من خبير المجال",
  },
};

export function mergeHomeSections(data: Partial<HomeSections> | null | undefined): HomeSections {
  return {
    clients: { ...defaultHomeSections.clients, ...(data?.clients || {}) },
    portfolio: { ...defaultHomeSections.portfolio, ...(data?.portfolio || {}) },
    services: {
      ...defaultHomeSections.services,
      ...(data?.services || {}),
      page_badge: data?.services?.page_badge ?? defaultHomeSections.services.page_badge,
      page_title: data?.services?.page_title ?? defaultHomeSections.services.page_title,
      hidden_price_ids: Array.isArray(data?.services?.hidden_price_ids)
        ? data.services.hidden_price_ids
        : defaultHomeSections.services.hidden_price_ids,
    },
    prompts: { ...defaultHomeSections.prompts, ...(data?.prompts || {}) },
    books: { ...defaultHomeSections.books, ...(data?.books || {}) },
    blog: { ...defaultHomeSections.blog, ...(data?.blog || {}) },
  };
}