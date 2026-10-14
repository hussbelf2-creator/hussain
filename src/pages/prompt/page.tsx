import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "../home/components/Navbar";
import FooterSection from "../home/components/FooterSection";
import SEO from "@/components/seo/SEO";

interface PromptItem {
  id: string;
  title: string;
  prompt_text: string;
  category: string;
  example_url: string;
}

const PromptCard = ({ prompt }: { prompt: PromptItem }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-400/30 transition-all duration-300 group">
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img
          src={prompt.example_url}
          alt={prompt.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-blue-600/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {prompt.category}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-white font-bold text-sm mb-3">{prompt.title}</h3>

        <div className="bg-black/30 border border-white/10 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-400 text-xs font-semibold flex items-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-code-line text-xs"></i>
              </div>
              البرومبت
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-white/40 hover:text-blue-400 text-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <i className={copied ? "ri-check-line text-xs" : "ri-file-copy-line text-xs"}></i>
              </div>
              {copied ? "تم النسخ!" : "نسخ"}
            </button>
          </div>
          <p className="text-white/50 text-xs font-mono leading-relaxed line-clamp-3">
            {prompt.prompt_text}
          </p>
        </div>
      </div>
    </div>
  );
};

const PromptPage = () => {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryCategory, setGalleryCategory] = useState("الكل");
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("show_prompts")
          .eq("id", 1)
          .maybeSingle();
        if (data) setSectionEnabled(data.show_prompts !== false);
      } catch {
        // default enabled
      } finally {
        setChecking(false);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const { data, error: supaError } = await supabase
          .from("prompts")
          .select("*")
          .order("created_at", { ascending: false });

        if (supaError) throw supaError;
        setPrompts(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
  }, []);

  const allCategories = ["الكل", ...new Set(prompts.map((p) => p.category).filter(Boolean))];
  const filtered = galleryCategory === "الكل" ? prompts : prompts.filter((p) => p.category === galleryCategory);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0d1b2e] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/60 mt-4 text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!sectionEnabled) {
    return (
      <div className="min-h-screen bg-[#0d1b2e] flex items-center justify-center" dir="rtl">
        <SEO title="مكتبة البرومبت غير متاحة | حسن جمال الليل" robots="noindex, nofollow" />
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-eye-off-line text-white/30 text-2xl"></i>
          </div>
          <h2 className="text-white font-black text-lg mb-2">القسم غير متاح حالياً</h2>
          <p className="text-white/40 text-sm mb-6">تم إخفاء قسم البرومبتات من إعدادات الموقع. يمكنك تفعيله من لوحة التحكم.</p>
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
      <div className="min-h-screen bg-[#0d1b2e] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/60 mt-4 text-sm">جاري تحميل البرومبتات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1b2e] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-400 text-sm">حدث خطأ: {error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-blue-400 text-sm underline cursor-pointer">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1b2e]" dir="rtl">
      <SEO
        title="مولد ومكتبة البرومبت الاحترافية | حسن جمال الليل"
        description="مكتبة أوامر وبرومبتات احترافية لتوليد الصور والفيديوهات الإبداعية بالذكاء الاصطناعي مع أمثلة عملية."
        canonicalPath="/prompt"
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=AI%20generated%20cinematic%20images%20gallery%20dark%20background%2C%20multiple%20stunning%20photographs%20created%20by%20artificial%20intelligence%2C%20professional%20photography%20collection%2C%20dark%20moody%20atmosphere%2C%20ultra%20realistic&width=1400&height=600&seq=prompthero&orientation=landscape"
            alt="AI Prompt Gallery"
            className="w-full h-full object-cover object-top opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b2e]/60 via-[#0d1b2e]/40 to-[#0d1b2e]"></div>
        </div>
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
            <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">معرض البرومبتات</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            برومبتات <span className="text-blue-400">سينمائية</span> احترافية
          </h1>
          <p className="text-white/50 text-lg max-w-2xl">
            أعمال حقيقية أُنتجت بالذكاء الاصطناعي — انسخ البرومبت الاحترافي مباشرة واستخدمه في مشاريعك.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-8">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  galleryCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-lightbulb-flash-line text-blue-400 text-lg"></i>
            </div>
            <div>
              <p className="text-blue-400 font-semibold text-sm mb-1">كيف تستخدم المعرض؟</p>
              <p className="text-white/50 text-xs leading-relaxed">
                كل صورة في المعرض أُنتجت بالكامل عبر الذكاء الاصطناعي باستخدام البرومبت المعروض. اضغط على <strong className="text-white/70">نسخ</strong> لنسخ البرومبت مباشرة واستخدامه في أدواتك المفضلة.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" data-product-shop>
            {filtered.map((item) => (
              <PromptCard key={item.id} prompt={item} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-code-line text-white/20 text-xl"></i>
              </div>
              <h3 className="text-white/50 font-bold text-sm mb-1">لا توجد برومبتات</h3>
              <p className="text-white/30 text-xs">جرب تغيير التصنيف</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 md:px-8 bg-[#0f2035]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">لماذا هذا المعرض مختلف؟</h2>
            <p className="text-white/50">مبني على خبرة +200 مشروع و4 كتب في مجال AI Photography</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "ri-image-2-line", title: "أمثلة حقيقية", desc: "كل صورة في المعرض أُنتجت فعلاً بالذكاء الاصطناعي مع برومبتها الكامل" },
              { icon: "ri-brain-line", title: "هندسة البرومبتات", desc: "برومبتات مبنية على فهم عميق لكيفية عمل كل أداة" },
              { icon: "ri-camera-lens-line", title: "مصطلحات سينمائية", desc: "إضاءة، عدسات، كاميرا، وتكوين احترافي" },
              { icon: "ri-file-copy-line", title: "نسخ بضغطة واحدة", desc: "انسخ البرومبت الكامل أو Negative Prompt بضغطة واحدة" },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-blue-400/30 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className={`${f.icon} text-blue-400 text-xl`}></i>
                </div>
                <h3 className="text-white font-bold text-sm mb-2">{f.title}</h3>
                <p className="text-white/40 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">تبي برومبتات مخصصة؟</h2>
          <p className="text-white/50 mb-8">اطلب مكتبة برومبتات مخصصة لمشروعك أو علامتك التجارية</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/services/prompt-engineering")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              اطلب برومبتات مخصصة
            </button>
            <button
              onClick={() => navigate("/books")}
              className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              اشتري مكتبة برومبتات
            </button>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default PromptPage;