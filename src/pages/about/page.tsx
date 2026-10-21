import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../home/components/Navbar";
import FooterSection from "../home/components/FooterSection";
import { supabase } from "@/lib/supabase";
import SEO from "@/components/seo/SEO";
import { getPersonSchema } from "@/lib/seo";

interface AboutPageSettings {
  about_name: string;
  about_title: string;
  about_bio_2: string;
  about_years_exp: string;
  about_photo_url: string;
  about_specializations: { icon: string; label: string; desc: string }[];
  about_timeline: { year: string; title: string; desc: string }[];
  about_tech_stack: { name: string; category: string; logo: string }[];
}

const AboutPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AboutPageSettings>({
    about_name: "حسن جمال الليل",
    about_title: "فني AI",
    about_bio_2: "أدمج بين الحس البصري للمصور، عقلية المونتير، وقوة الذكاء الاصطناعي لصناعة صور وأفلام تخدم هدفًا واضحًا: جذب الانتباه، بناء الثقة، وتحويل الفكرة إلى محتوى قابل للبيع.",
    about_years_exp: "7+",
    about_photo_url: "https://static.readdy.ai/image/8d67d4b5b60a62e7b1df4167f7b5245a/063058724ec35e84d75517ddfc59765d.png",
    about_specializations: [
      { icon: "ri-camera-3-line", label: "AI Photography", desc: "توليد صور احترافية بجودة تجارية" },
      { icon: "ri-film-line", label: "AI Film Editing", desc: "إنتاج مشاهد سينمائية بالذكاء الاصطناعي" },
      { icon: "ri-code-s-slash-line", label: "Prompt Engineering", desc: "بناء برومبتات احترافية محسّنة" },
      { icon: "ri-palette-line", label: "Visual Direction", desc: "إخراج بصري وهوية بصرية متكاملة" },
    ],
    about_timeline: [
      { year: "2017", title: "بداية الرحلة", desc: "بدأت كمصور تقليدي متخصص في التصوير التجاري والمنتجات" },
      { year: "2019", title: "دخول عالم المونتاج", desc: "تخصصت في مونتاج الأفلام والإعلانات باستخدام Premiere وDaVinci" },
      { year: "2022", title: "اكتشاف AI", desc: "بدأت تجربة Midjourney واكتشفت إمكانيات الذكاء الاصطناعي في الإنتاج البصري" },
      { year: "2023", title: "التحول الكامل", desc: "انتقلت للعمل بالكامل باستخدام AI مع الحفاظ على الجودة الاحترافية" },
      { year: "2024", title: "خبير معتمد", desc: "+200 مشروع منجز، +50 عميل، و4 كتب منشورة في مجال AI Photography" },
    ],
    about_tech_stack: [
      { name: "Nano Banana", category: "توليد صور", logo: "https://storage.readdy-site.link/project_files/89593955-b165-4908-8cef-673a8d5d832b/dfde18d1-b547-4ec3-ab01-06eb0da84871_freepik_0001.png?v=550ab4386af970390c5b15c202db9dde" },
      { name: "Seedance", category: "فيديو AI", logo: "https://storage.readdy-site.link/project_files/89593955-b165-4908-8cef-673a8d5d832b/8465421b-079a-4d93-9dfd-cd36c70f1375_seedance2.0.png?v=f8fae0b69939478ea896f09c3ea4be56" },
      { name: "Kling", category: "فيديو AI", logo: "https://storage.readdy-site.link/project_files/89593955-b165-4908-8cef-673a8d5d832b/5b702725-7462-4b31-b38c-e479b1724044_kling-color.png?v=d250a56f0191e5cea945b29e397b94d5" },
      { name: "Premiere Pro", category: "مونتاج", logo: "https://storage.readdy-site.link/project_files/89593955-b165-4908-8cef-673a8d5d832b/cfc13a8e-ef49-438b-abdc-5d0ff0885aa9_Adobe_Premiere_Pro_CC_icon.svg.png?v=3f275fd0f657e830dbd9763f97119ea3" },
    ],
  });
  const [stats, setStats] = useState<Array<{ icon?: string; value: string; label: string; detail?: string }>>([
    { icon: "ri-briefcase-4-line", value: "+15", label: "مشروع منجز", detail: "في تصوير المنتجات والأفلام والإعلانات" },
    { icon: "ri-user-star-line", value: "+100", label: "عميل راضٍ", detail: "من عدة دول حول العالم" },
    { icon: "ri-book-2-line", value: "10", label: "كتب منشورة", detail: "في مجال AI Photography وهندسة البرومبتات" },
    { icon: "ri-eye-line", value: "1k+", label: "مشاهدة", detail: "لمحتوى الإنتاج البصري" },
    { icon: "ri-star-fill", value: "4.9", label: "متوسط التقييم", detail: "تقييم العملاء للخدمات" },
    { icon: "ri-time-line", value: "24h", label: "متوسط وقت الرد", detail: "سرعة في التواصل والتنفيذ" },
  ]);

  const [showServices, setShowServices] = useState(true);

  const tools = settings.about_tech_stack;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("about_name, about_title, about_bio_2, about_years_exp, about_photo_url, about_specializations, about_timeline, about_tech_stack, home_stats, show_services")
        .eq("id", 1)
        .maybeSingle();
      if (data) {
        if (data.show_services !== undefined && data.show_services !== null) {
          setShowServices(data.show_services !== false);
        }
        setSettings({
          about_name: data.about_name || settings.about_name,
          about_title: data.about_title || settings.about_title,
          about_bio_2: data.about_bio_2 || settings.about_bio_2,
          about_years_exp: data.about_years_exp || settings.about_years_exp,
          about_photo_url: data.about_photo_url || settings.about_photo_url,
          about_specializations: (data.about_specializations || settings.about_specializations).map((s) => ({ icon: s.icon || "ri-star-line", label: s.label || "", desc: s.desc || "" })),
          about_timeline: data.about_timeline || settings.about_timeline,
          about_tech_stack: data.about_tech_stack?.length ? data.about_tech_stack : settings.about_tech_stack,
        });

        if (data.home_stats && Array.isArray(data.home_stats) && data.home_stats.length > 0) {
          const detailMap: Record<string, string> = {
            "مشروع منجز": "في تصوير المنتجات والأفلام والإعلانات",
            "عميل راضٍ": "من عدة دول حول العالم",
            "عملاء راضون": "من عدة دول حول العالم",
            "كتب منشورة": "في مجال AI Photography وهندسة البرومبتات",
            "كتب رقمية": "في مجال AI Photography وهندسة البرومبتات",
            "مشاهدة": "لمحتوى الإنتاج البصري",
            "سنوات خبرة": "في التصوير والمونتاج والذكاء الاصطناعي",
            "متوسط التقييم": "تقييم العملاء للخدمات",
            "متوسط وقت الرد": "سرعة في التواصل والتنفيذ",
            "دولة": "عملاء من مختلف أنحاء العالم",
          };

          setStats(
            data.home_stats.map((s: { value: string; label: string; icon?: string; detail?: string }) => ({
              value: s.value,
              label: s.label,
              icon: s.icon || "ri-bar-chart-line",
              detail: s.detail || detailMap[s.label] || "",
            }))
          );
        }
      }
    } catch { /* keep defaults */ }
  };

  const { about_name, about_title, about_bio_2, about_years_exp, about_photo_url, about_specializations, about_timeline, about_tech_stack } = settings;

  return (
    <div className="min-h-screen bg-[#f8faff]" dir="rtl">
      <SEO
        title="من أنا | خبرتي في الإنتاج البصري والمونتاج بالذكاء الاصطناعي"
        description={`${about_name} - ${about_title}. خبرة ${about_years_exp} في التصوير التجاري ومونتاج الأفلام بالذكاء الاصطناعي.`}
        canonicalPath="/about"
        image={about_photo_url}
        type="profile"
        schema={getPersonSchema()}
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

          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-64 h-80 md:w-72 md:h-96 rounded-3xl overflow-hidden border-4 border-blue-500/30 shadow-2xl">
                  <img
                    src={about_photo_url}
                    alt={about_name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white rounded-2xl p-4 shadow-xl">
                  <div className="text-2xl font-black">{about_years_exp}</div>
                  <div className="text-xs text-blue-100">سنوات خبرة</div>
                </div>
                <div className="absolute -top-3 -left-3 w-20 h-20 border-2 border-blue-400/30 rounded-full"></div>
              </div>
            </div>

            <div className="flex-1 text-center lg:text-right">
              {/* <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                <div className="w-8 h-0.5 bg-blue-400"></div>
                <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">المصور</span>
              </div> */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
                {about_name}
              </h1>
              <p className="text-white/60 text-lg leading-relaxed max-w-xl">
                {about_bio_2}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((ach, idx) => (
              <div key={`${ach.label}-${idx}`} className="bg-[#f8faff] border border-gray-100 rounded-2xl p-5 text-center hover:border-blue-200 transition-colors">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className={`${ach.icon || "ri-bar-chart-line"} text-blue-600 text-lg`}></i>
                </div>
                <div className="text-2xl font-black text-[#0d1b2e]">{ach.value}</div>
                <div className="text-gray-700 text-sm font-semibold mt-1">{ach.label}</div>
                {ach.detail && <div className="text-gray-400 text-xs mt-1">{ach.detail}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story / Timeline */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-0.5 bg-blue-500"></div>
            <span className="text-blue-600 text-sm font-semibold tracking-wider uppercase">القصة</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#0d1b2e] mb-8">كيف وصلت لهنا</h2>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-blue-200 hidden md:block"></div>
            <div className="space-y-8">
              {about_timeline.map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
                  <div className="flex items-center gap-4 md:w-32 flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10 flex-shrink-0">
                      {item.year}
                    </div>
                    <div className="md:hidden h-0.5 flex-1 bg-blue-200"></div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 flex-1 hover:border-blue-200 transition-colors">
                    <h4 className="text-[#0d1b2e] font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-0.5 bg-blue-500"></div>
            <span className="text-blue-600 text-sm font-semibold tracking-wider uppercase">التخصصات</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#0d1b2e] mb-10">مجالات الخبرة</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {about_specializations.map((spec) => (
              <div key={spec.label} className="bg-[#f8faff] border border-gray-100 rounded-2xl p-6 hover:border-blue-200 transition-all duration-300 group">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <i className={`${spec.icon} text-blue-600 text-2xl`}></i>
                </div>
                <h3 className="text-[#0d1b2e] font-bold text-lg mb-2">{spec.label}</h3>
                <p className="text-gray-500 text-sm">{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-0.5 bg-blue-500"></div>
            <span className="text-blue-600 text-sm font-semibold tracking-wider uppercase">الأدوات</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#0d1b2e] mb-10">المكدس التقني</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <div key={tool.name} className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-3 hover:border-gray-200 transition-all">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                  <img src={tool.logo} alt={tool.name} className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <div className="text-[#0d1b2e] font-bold text-sm">{tool.name}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{tool.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-8 bg-[#0d1b2e]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            تعمل معي؟
          </h2>
          <p className="text-white/50 mb-8">
            دعنا نناقش مشروعك ونرى كيف يمكن للذكاء الاصطناعي أن يحول فكرتك إلى واقع
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {showServices && (
              <button
                onClick={() => navigate("/services")}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                اكتشف الخدمات
              </button>
            )}
            <button
              onClick={() => navigate("/")}
              className={`${
                showServices
                  ? "border border-white/20 hover:border-white/40 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              } px-8 py-4 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap`}
            >
              شوف الأعمال
            </button>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default AboutPage;