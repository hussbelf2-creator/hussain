import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "../home/components/Navbar";
import FooterSection from "../home/components/FooterSection";
import SEO from "@/components/seo/SEO";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string;
  tags: string[];
  published: boolean;
  created_at: string;
}

const BlogPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("show_blog")
          .eq("id", 1)
          .maybeSingle();
        if (data) setSectionEnabled(data.show_blog !== false);
      } catch {
        // default enabled
      } finally {
        setChecking(false);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error: supaError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });

        if (supaError) throw supaError;
        setPosts(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitting(true);
    try {
      const body = new URLSearchParams();
      body.append("email", newsletterEmail);
      await fetch("https://readdy.ai/api/form/d8jefvphmtkvo7bfra00", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      setNewsletterSubmitted(true);
      setNewsletterEmail("");
    } catch {
      setNewsletterSubmitted(true);
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  const allCategories = ["الكل", ...new Set(posts.flatMap((p) => p.tags || []).filter(Boolean))];
  const filtered = activeCategory === "الكل" ? posts : posts.filter((p) => (p.tags || []).includes(activeCategory));
  const featured = posts.slice(0, 2);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  };

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
        <SEO title="المدونة غير متاحة | حسن جمال الليل" robots="noindex, nofollow" />
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-eye-off-line text-gray-400 text-2xl"></i>
          </div>
          <h2 className="text-[#0d1b2e] font-black text-lg mb-2">القسم غير متاح حالياً</h2>
          <p className="text-gray-500 text-sm mb-6">تم إخفاء قسم المدونة من إعدادات الموقع. يمكنك تفعيله من لوحة التحكم.</p>
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
          <p className="text-gray-500 mt-4 text-sm">جاري تحميل المقالات...</p>
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
        title="المدونة | مقالات ودروس في التصوير والمونتاج بالذكاء الاصطناعي"
        description="مقالات متخصصة، شروحات تقنية، ونصائح عملية في التصوير والمونتاج بالذكاء الاصطناعي وهندسة البرومبتات."
        canonicalPath="/blog"
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 md:px-8 bg-[#0d1b2e] relative overflow-hidden">
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
            <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">المدونة</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            تعلم <span className="text-blue-400">AI</span> من الخبير
          </h1>
          <p className="text-white/50 text-lg max-w-2xl">
            مقالات تعليمية عملية في AI Photography وهندسة البرومبتات وإنتاج الأفلام بالذكاء الاصطناعي
          </p>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span className="text-blue-600 text-sm font-semibold">مقالات مميزة</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {featured.map((post) => (
                <div
                  key={post.id}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  <div className="w-full h-52 overflow-hidden">
                    <img
                      src={post.cover_url}
                      alt={post.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium">{post.tags?.[0] || "عام"}</span>
                      <span className="text-gray-400 text-xs">{formatDate(post.created_at)}</span>
                    </div>
                    <h2 className="text-[#0d1b2e] font-black text-lg leading-snug mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">{post.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Filter */}
      <section className="px-4 md:px-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {allCategories.slice(0, 8).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 transition-all duration-300 cursor-pointer flex flex-col"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="w-full h-44 overflow-hidden">
                  <img
                    src={post.cover_url}
                    alt={post.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium">{post.tags?.[0] || "عام"}</span>
                    <span className="text-gray-400 text-xs">{formatDate(post.created_at)}</span>
                  </div>
                  <h3 className="text-[#0d1b2e] font-black text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors flex-1">{post.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-gray-400 text-xs">{formatDate(post.created_at)}</span>
                    <span className="text-blue-600 text-xs font-medium">اقرأ المزيد</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-article-line text-gray-300 text-xl"></i>
              </div>
              <h3 className="text-gray-500 font-bold text-sm mb-1">لا توجد مقالات</h3>
              <p className="text-gray-400 text-xs">جرب تغيير التصنيف</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-8 bg-[#0d1b2e]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            تبي تتعلم أكثر؟
          </h2>
          <p className="text-white/50 mb-8">
            اشترك في النشرة البريدية واحصل على مقالات حصرية ونصائح أسبوعية
          </p>
          {newsletterSubmitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 max-w-md mx-auto">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-check-line text-emerald-400 text-lg"></i>
              </div>
              <p className="text-white font-bold text-sm">تم الاشتراك بنجاح!</p>
              <p className="text-white/50 text-xs mt-1">شكراً لانضمامك. ستصلك مقالات حصرية قريباً.</p>
            </div>
          ) : (
          <form data-readdy-form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              name="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="بريدك الإلكتروني"
              required
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={newsletterSubmitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {newsletterSubmitting ? "جاري..." : "اشترك"}
            </button>
          </form>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default BlogPage;