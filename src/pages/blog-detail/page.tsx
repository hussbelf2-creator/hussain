import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "../home/components/Navbar";
import FooterSection from "../home/components/FooterSection";
import SEO from "@/components/seo/SEO";
import { getArticleSchema } from "@/lib/seo";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  cover_url: string;
  tags: string[];
  created_at: string;
}

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data, error: supaError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();

        if (supaError) throw supaError;
        setArticle(data);

        if (data) {
          const { data: relatedData } = await supabase
            .from("blog_posts")
            .select("id, title, slug, excerpt, content, cover_url, tags, created_at")
            .eq("published", true)
            .neq("id", data.id)
            .order("created_at", { ascending: false })
            .limit(3);
          setRelated(relatedData || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4 text-sm">جاري تحميل المقال...</p>
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

  if (!article) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center" dir="rtl">
        <SEO title="المقال غير موجود | مدونة حسن جمال الليل" robots="noindex, nofollow" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0d1b2e] mb-4">المقال غير موجود</h1>
          <button
            onClick={() => navigate("/blog")}
            className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            العودة للمدونة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff]" dir="rtl">
      <SEO
        title={`${article.title} | مدونة حسن جمال الليل`}
        description={article.excerpt || undefined}
        image={article.cover_url}
        type="article"
        canonicalPath={`/blog/${slug}`}
        publishedTime={article.created_at}
        tags={article.tags}
        schema={getArticleSchema(article)}
      />
      <Navbar />

      {/* Hero Image */}
      <div className="pt-20">
        <div className="w-full h-[300px] md:h-[450px] overflow-hidden">
          <img
            src={article.cover_url}
            alt={article.title}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-blue-600 transition-colors cursor-pointer">
            الرئيسية
          </button>
          <span>/</span>
          <button onClick={() => navigate("/blog")} className="hover:text-blue-600 transition-colors cursor-pointer">
            المدونة
          </button>
          <span>/</span>
          <span className="text-gray-600">{article.title}</span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">
            {article.tags?.[0] || "عام"}
          </span>
          <span className="text-gray-400 text-sm">{formatDate(article.created_at)}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-[#0d1b2e] leading-tight mb-8">
          {article.title}
        </h1>

        {/* Excerpt */}
        <p className="text-lg text-gray-600 leading-relaxed mb-10 border-r-4 border-blue-500 pr-4">
          {article.excerpt}
        </p>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
          {article.content.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-50 text-gray-600 text-xs px-3 py-1.5 rounded-full border border-gray-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="flex items-center gap-4 mt-8">
          <span className="text-gray-500 text-sm font-medium">شارك المقال:</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
            <i className="ri-twitter-x-line"></i>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
            <i className="ri-facebook-fill"></i>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
            <i className="ri-linkedin-fill"></i>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
            <i className="ri-whatsapp-line"></i>
          </button>
        </div>
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-[#0d1b2e] mb-8">مقالات ذات صلة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((rel) => (
              <div
                key={rel.id}
                className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-blue-200 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/blog/${rel.slug}`)}
              >
                <div className="w-full h-40 overflow-hidden">
                  <img
                    src={rel.cover_url}
                    alt={rel.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <span className="text-blue-600 text-xs font-medium">{rel.tags?.[0] || "عام"}</span>
                  <h3 className="text-[#0d1b2e] font-bold text-sm leading-snug mt-1 group-hover:text-blue-600 transition-colors">
                    {rel.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <FooterSection />
    </div>
  );
};

export default BlogDetailPage;