import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "../home/components/Navbar";
import FooterSection from "../home/components/FooterSection";
import SEO from "@/components/seo/SEO";

interface Book {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  price: string;
  category: string;
  featured: boolean;
  buy_url: string;
}

interface StoreFeature {
  title: string;
  desc: string;
}

interface StoreFaq {
  q: string;
  a: string;
}

const BooksPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [checking, setChecking] = useState(true);
  const [storeHeroTitle, setStoreHeroTitle] = useState("خبرتي في");
  const [storeHeroHighlight, setStoreHeroHighlight] = useState("يدك");
  const [storeHeroSubtitle, setStoreHeroSubtitle] = useState(
    "كتب إلكترونية، مكتبات برومبتات، وقوالب احترافية. كلها مصممة لتوفير وقتك وتحسين نتائجك في الإنتاج البصري بالذكاء الاصطناعي."
  );
  const [features, setFeatures] = useState<StoreFeature[]>([
    { title: "تحميل فوري", desc: "احصل على ملفاتك مباشرة بعد الشراء" },
    { title: "تحديثات مجانية", desc: "كل التحديثات المستقبلية مجاناً" },
    { title: "ضمان 30 يوم", desc: "استرداد كامل إذا لم تكن راضياً" },
    { title: "دعم مباشر", desc: "تواصل مباشر للأسئلة والاستفسارات" },
  ]);
  const [faqs, setFaqs] = useState<StoreFaq[]>([
    { q: "ما صيغة الملفات؟", a: "الكتب بصيغة PDF عالية الجودة. البرومبتات بصيغة TXT وPDF. القوالب بصيغة PSD." },
    { q: "هل يمكنني طباعة الكتب؟", a: "نعم! الكتب مرخصة للاستخدام الشخصي ويمكن طباعتها." },
    { q: "هل هناك تحديثات مستقبلية؟", a: "Bundle الكامل يشمل تحديثات مجانية مدى الحياة. الكتب الفردية تحصل على تحديثات لمدة سنة." },
    { q: "كيف أحصل على الملفات بعد الشراء؟", a: "تحميل فوري عبر رابط يرسل إلى بريدك الإلكتروني مباشرة بعد إتمام الدفع." },
    { q: "هل هناك ضمان استرداد؟", a: "نعم، ضمان استرداد كامل خلال 30 يوم إذا لم تكن راضياً عن المنتج." },
  ]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("show_books, store_hero_title, store_hero_title_highlight, store_hero_subtitle, store_features, store_faqs")
          .eq("id", 1)
          .maybeSingle();

        if (data) {
          setSectionEnabled(data.show_books !== false);
          if (data.store_hero_title) setStoreHeroTitle(data.store_hero_title);
          if (data.store_hero_title_highlight) setStoreHeroHighlight(data.store_hero_title_highlight);
          if (data.store_hero_subtitle) setStoreHeroSubtitle(data.store_hero_subtitle);
          if (Array.isArray(data.store_features) && data.store_features.length > 0) {
            setFeatures(data.store_features as StoreFeature[]);
          }
          if (Array.isArray(data.store_faqs) && data.store_faqs.length > 0) {
            setFaqs(data.store_faqs as StoreFaq[]);
          }
        }
      } catch {
        // use defaults
      } finally {
        setChecking(false);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error: supaError } = await supabase
          .from("books")
          .select("*")
          .order("created_at", { ascending: false });

        if (supaError) throw supaError;
        setBooks(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4 text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!sectionEnabled) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center" dir="rtl">
        <SEO title="المتجر الرقمي غير متاح | حسن جمال الليل" robots="noindex, nofollow" />
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-eye-off-line text-gray-400 text-2xl"></i>
          </div>
          <h2 className="text-[#0d1b2e] font-black text-lg mb-2">القسم غير متاح حالياً</h2>
          <p className="text-gray-500 text-sm mb-6">تم إخفاء هذا القسم من إعدادات الموقع. يمكنك تفعيله من لوحة التحكم.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap text-sm"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4 text-sm">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-500 text-sm">حدث خطأ: {error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 text-sm underline cursor-pointer">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff]" dir="rtl">
      <SEO
        title="المتجر الرقمي والكتب الإلكترونية | حسن جمال الليل"
        description="كتب إلكترونية ومكتبات برومبتات وقوالب احترافية لتوفير وقتك وتحسين نتائجك في الإنتاج البصري بالذكاء الاصطناعي."
        canonicalPath="/books"
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 md:px-8 bg-[#0d1b2e] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
        <div className="max-w-6xl mx-auto relative">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-arrow-right-line"></i>
            </div>
            العودة للرئيسية
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-blue-400"></div>
            <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">المتجر</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            {storeHeroTitle} <span className="text-blue-400">{storeHeroHighlight}</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mb-8">
            {storeHeroSubtitle}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {features.map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-product-shop>
            {books.map((book) => (
              <div
                key={book.id}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="relative overflow-hidden">
                  <div className="w-full h-64 overflow-hidden">
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {book.featured && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      مميز
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <span className="text-blue-600 text-xs font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block w-fit mb-2">{book.category}</span>
                  <h3 className="text-[#0d1b2e] font-black text-base mb-1 leading-snug">{book.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{book.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-blue-600 font-black text-xl">{book.price}</span>
                    <button
                      onClick={() => {
                        if (book.buy_url) {
                          window.open(book.buy_url, "_blank", "noopener,noreferrer");
                        } else {
                          navigate(`/books/${book.id}`);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
                    >
                      اشترِ الآن
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0d1b2e] mb-4">الأسئلة الشائعة</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
                <h4 className="text-[#0d1b2e] font-bold text-sm mb-2">{faq.q}</h4>
                <p className="text-gray-500 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-8 bg-[#0d1b2e]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            محتاج مساعدة في الاختيار؟
          </h2>
          <p className="text-white/50 mb-8">
            احجز جلسة استشارية مجانية لمدة 15 دقيقة وسأساعدك تختار المناسب
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/services/consultation")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              احجز استشارة مجانية
            </button>
            <button
              onClick={() => navigate("/")}
              className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default BooksPage;