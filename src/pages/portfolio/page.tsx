import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "../home/components/Navbar";
import FooterSection from "../home/components/FooterSection";
import SEO from "@/components/seo/SEO";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  video_url: string | null;
  tags: string[];
  featured: boolean;
}

interface VideoEmbed {
  type: "youtube" | "vimeo";
  embedUrl: string;
}

function getVideoEmbed(url: string): VideoEmbed | null {
  if (!url) return null;

  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (ytMatch) {
    return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0` };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
  }

  return null;
}

const PortfolioPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState("الكل");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSection() {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("show_portfolio")
          .eq("id", 1)
          .maybeSingle();
        if (data) setSectionEnabled(data.show_portfolio !== false);
      } catch {
        // keep defaults
      } finally {
        setChecking(false);
      }
    }
    checkSection();
  }, []);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data, error: supaError } = await supabase
          .from("portfolio_items")
          .select("*")
          .order("sort_order", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: true });

        if (supaError) throw supaError;
        setItems(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const filtered = items.filter((item) => {
    if (activeType === "الكل") return true;
    if (activeType === "صورة") return !item.video_url;
    if (activeType === "فيديو") return !!item.video_url;
    return true;
  });

  const selectedItem = selectedItemId ? items.find((i) => i.id === selectedItemId) : null;
  const selectedVideo = selectedItem?.video_url ? getVideoEmbed(selectedItem.video_url) : null;

  const portfolioTypes = ["الكل", "صورة", "فيديو"];

  const imageCount = items.filter((i) => !i.video_url).length;
  const videoCount = items.filter((i) => !!i.video_url).length;

  if (checking) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground-600 mt-4 text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!sectionEnabled) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-background-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-eye-off-line text-foreground-500 text-2xl"></i>
          </div>
          <h2 className="text-foreground-950 font-black text-lg mb-2">القسم غير متاح حالياً</h2>
          <p className="text-foreground-600 text-sm mb-6">تم إخفاء قسم الأعمال من إعدادات الموقع. يمكنك تفعيله من لوحة التحكم.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap text-sm"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground-600 mt-4 text-sm">جاري تحميل الأعمال...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-400 text-sm">حدث خطأ: {error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-primary-500 text-sm underline cursor-pointer">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50" dir="rtl">
      <SEO
        title="معرض الأعمال | تصوير وإعلانات سينمائية بالذكاء الاصطناعي"
        description="استعرض أحدث أعمال ومشاريع حسن جمال الليل في إنتاج الصور التجارية والفيديو السينمائي باستخدام تقنيات AI المتقدمة."
        canonicalPath="/portfolio"
      />
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-foreground-600 hover:text-foreground-950 text-xs mb-6 transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-right-line text-sm"></i>
            </div>
            العودة للرئيسية
          </button>

          <h1 className="text-2xl md:text-3xl font-black text-foreground-950 leading-tight mb-2">
            أعمالي
          </h1>
          <p className="text-foreground-600 text-sm">
            نماذج من مشاريع الإنتاج البصري بالذكاء الاصطناعي
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-6 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {portfolioTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeType === type
                    ? "bg-foreground-950 text-background-50 font-bold"
                    : "bg-background-100 text-foreground-600 hover:text-foreground-950 hover:bg-background-200 border border-background-200"
                }`}
              >
                {type === "صورة" && `${type} (${imageCount})`}
                {type === "فيديو" && `${type} (${videoCount})`}
                {type === "الكل" && `${type} (${items.length})`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 md:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" data-product-shop>
            {filtered.map((item) => {
              const hasVideo = !!item.video_url;
              return (
                <div
                  key={item.id}
                  className="group rounded-lg overflow-hidden cursor-pointer bg-background-50 border border-background-200/70 flex flex-col"
                  onClick={() => setSelectedItemId(item.id)}
                >
                  <div className="w-full aspect-[4/5] overflow-hidden relative">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />

                    {hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                          <i className="ri-play-fill text-white text-xl md:text-2xl ml-0.5"></i>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-background-50 p-3 md:p-4 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-primary-600 text-xs font-semibold">
                        {item.category}
                      </span>
                      {hasVideo && (
                        <span className="bg-accent-100 text-accent-700 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <div className="w-3 h-3 flex items-center justify-center">
                            <i className="ri-video-line text-[8px]"></i>
                          </div>
                          فيديو
                        </span>
                      )}
                    </div>
                    <h3 className="text-foreground-950 font-bold text-xs md:text-sm leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-12 h-12 bg-background-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-image-line text-foreground-400 text-xl"></i>
              </div>
              <h3 className="text-foreground-700 font-bold text-sm mb-1">لا توجد أعمال بهذه الفلاتر</h3>
              <p className="text-foreground-500 text-xs">جرب تغيير الفلاتر لرؤية المزيد من الأعمال</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedItemId(null)}
        >
          <div
            className="bg-background-50 rounded-xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-background-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {selectedVideo ? (
                <div className="w-full aspect-video bg-black">
                  <iframe
                    src={selectedVideo.embedUrl}
                    title={selectedItem.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-56 md:h-80 object-cover object-top"
                />
              )}
              <button
                onClick={() => setSelectedItemId(null)}
                className="absolute top-3 left-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-sm"></i>
              </button>

              {!selectedVideo && selectedItem.video_url && (
                <a
                  href={selectedItem.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <div className="w-3.5 h-3.5 flex items-center justify-center">
                    <i className="ri-external-link-line"></i>
                  </div>
                  فتح الفيديو
                </a>
              )}
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-primary-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">{selectedItem.category}</span>
                {(selectedItem.tags || []).map((tag) => (
                  <span key={tag} className="bg-background-100 text-foreground-600 text-xs px-2.5 py-1 rounded-full">{tag}</span>
                ))}
                {selectedItem.video_url && (
                  <span className="bg-accent-100 text-accent-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className="ri-play-circle-fill text-[10px]"></i>
                    </div>
                    فيديو
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-foreground-950 mb-2">{selectedItem.title}</h2>
              <p className="text-foreground-600 text-sm leading-relaxed">{selectedItem.description}</p>

              {selectedItem.video_url && selectedVideo && (
                <a
                  href={selectedItem.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-primary-500 hover:text-primary-600 text-xs font-medium transition-colors cursor-pointer"
                >
                  <div className="w-3.5 h-3.5 flex items-center justify-center">
                    <i className="ri-external-link-line"></i>
                  </div>
                  مشاهدة على {selectedVideo.type === "youtube" ? "YouTube" : "Vimeo"}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-14 px-4 md:px-8 bg-background-100 border-t border-background-200/70">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-black text-foreground-950 mb-3">
            عندك مشروع في بالك؟
          </h2>
          <p className="text-foreground-600 text-sm mb-6">
            دعنا نحوّل فكرتك إلى عمل بصري احترافي
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/services/ai-product-photography")}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              اطلب مشروعك
            </button>
            <button
              onClick={() => navigate("/about")}
              className="border border-background-300/60 hover:border-background-400 text-foreground-950 px-6 py-3 rounded-full font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              تعرف عليّ
            </button>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default PortfolioPage;