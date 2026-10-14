import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../home/components/Navbar";
import FooterSection from "../home/components/FooterSection";
import SEO from "@/components/seo/SEO";

const plans = [
  {
    id: "free",
    name: "مجاني",
    price: "0$",
    period: "",
    description: "ابدأ وجرّب الأدوات",
    color: "border-gray-200",
    badge: "",
    features: [
      { text: "تجربة مولد البرومبت 5 مرات/شهر", included: true },
      { text: "تصفح المعرض والأعمال", included: true },
      { text: "قراءة المدونة", included: true },
      { text: "حفظ البرومبتات", included: false },
      { text: "قوالب جاهزة", included: false },
      { text: "تصدير PDF", included: false },
      { text: "مكتبة برومبتات", included: false },
      { text: "دعم مباشر", included: false },
    ],
    cta: "ابدأ مجاناً",
    ctaStyle: "border border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600",
  },
  {
    id: "basic",
    name: "Basic",
    price: "19$",
    period: "/شهر",
    description: "للمبتدئين والمتعلمين",
    color: "border-blue-200",
    badge: "",
    features: [
      { text: "مولد البرومبت غير محدود", included: true },
      { text: "حفظ حتى 50 برومبت", included: true },
      { text: "10 قوالب جاهزة", included: true },
      { text: "تصدير PDF", included: true },
      { text: "مكتبة برومبتات كاملة", included: false },
      { text: "أدوات فيديو AI", included: false },
      { text: "قوالب إعلانات", included: false },
      { text: "دعم مباشر", included: false },
    ],
    cta: "اشترك الآن",
    ctaStyle: "bg-blue-600 hover:bg-blue-500 text-white",
  },
  {
    id: "pro",
    name: "Pro",
    price: "49$",
    period: "/شهر",
    description: "للمحترفين وصناع المحتوى",
    color: "border-blue-500",
    badge: "الأكثر طلباً",
    features: [
      { text: "مولد البرومبت غير محدود", included: true },
      { text: "حفظ برومبتات غير محدود", included: true },
      { text: "مكتبة 500+ قالب", included: true },
      { text: "تصدير PDF وTXT", included: true },
      { text: "5 نسخ من كل برومبت", included: true },
      { text: "سجل الاستخدام الكامل", included: true },
      { text: "أدوات فيديو AI", included: false },
      { text: "دعم مباشر", included: false },
    ],
    cta: "اشترك Pro",
    ctaStyle: "bg-blue-600 hover:bg-blue-500 text-white",
  },
  {
    id: "studio",
    name: "Studio",
    price: "99$",
    period: "/شهر",
    description: "للمنتجين والاستوديوهات",
    color: "border-violet-300",
    badge: "",
    features: [
      { text: "كل مميزات Pro", included: true },
      { text: "أدوات فيديو AI متقدمة", included: true },
      { text: "قوالب إعلانات جاهزة", included: true },
      { text: "مشاركة الفريق (3 أعضاء)", included: true },
      { text: "API Access", included: true },
      { text: "دعم مباشر", included: false },
      { text: "قوالب مخصصة", included: false },
      { text: "استخدام تجاري كامل", included: false },
    ],
    cta: "اشترك Studio",
    ctaStyle: "bg-violet-600 hover:bg-violet-500 text-white",
  },
  {
    id: "business",
    name: "Business",
    price: "199$",
    period: "/شهر",
    description: "للشركات والوكالات",
    color: "border-emerald-300",
    badge: "للشركات",
    features: [
      { text: "كل مميزات Studio", included: true },
      { text: "استخدام تجاري كامل", included: true },
      { text: "دعم مباشر 24/7", included: true },
      { text: "قوالب مخصصة لعلامتك", included: true },
      { text: "مشاركة الفريق (10 أعضاء)", included: true },
      { text: "تقارير تحليلية", included: true },
      { text: "SLA مضمون", included: true },
      { text: "مدير حساب مخصص", included: true },
    ],
    cta: "تواصل معنا",
    ctaStyle: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
];

const featuresList = [
  { icon: "ri-save-line", title: "حفظ البرومبتات", desc: "مكتبة خاصة لكل مستخدم" },
  { icon: "ri-file-copy-line", title: "توليد نسخ متعددة", desc: "5 نسخ مختلفة من البرومبت" },
  { icon: "ri-file-pdf-line", title: "تصدير PDF", desc: "احفظ برومبتاتك كملف" },
  { icon: "ri-stack-line", title: "مكتبة قوالب", desc: "500+ برومبت جاهز" },
  { icon: "ri-history-line", title: "سجل الاستخدام", desc: "كل ما ولدته محفوظ" },
  { icon: "ri-heart-line", title: "المفضلة", desc: "احفظ أفضل نتائجك" },
  { icon: "ri-sticky-note-line", title: "ملاحظات", desc: "أضف ملاحظاتك على البرومبت" },
  { icon: "ri-share-line", title: "مشاركة", desc: "رابط قابل للمشاركة" },
];

const MembershipsPage = () => {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-[#f8faff]" dir="rtl">
      <SEO
        title="خطط العضوية والاشتراكات | أدوات الإنتاج بالذكاء الاصطناعي"
        description="اختر الباقة المناسبة لاحتياجاتك واستفد من مولد البرومبت ومكتبة القوالب الاحترافية للإنتاج البصري بالذكاء الاصطناعي."
        canonicalPath="/memberships"
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 md:px-8 bg-[#0d1b2e] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
        <div className="max-w-6xl mx-auto relative text-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors cursor-pointer mx-auto"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-arrow-right-line"></i>
            </div>
            العودة للرئيسية
          </button>

          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-blue-400"></div>
            <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">العضويات</span>
            <div className="w-8 h-0.5 bg-blue-400"></div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            اختر خطتك <span className="text-blue-400">المناسبة</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
            من التجربة المجانية إلى الاستخدام التجاري الكامل. خطط مرنة تناسب كل احتياج
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${billing === "monthly" ? "text-white" : "text-white/40"}`}>شهري</span>
            <button
              onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${billing === "yearly" ? "bg-blue-600" : "bg-white/20"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${billing === "yearly" ? "left-6" : "left-0.5"}`}></div>
            </button>
            <span className={`text-sm font-medium ${billing === "yearly" ? "text-white" : "text-white/40"}`}>
              سنوي
              <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">وفّر 20%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white border-2 ${plan.color} rounded-2xl p-5 flex flex-col hover:border-blue-400 transition-all duration-300`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-[#0d1b2e] font-black text-lg">{plan.name}</h3>
                  <p className="text-gray-400 text-xs mt-1">{plan.description}</p>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-black text-[#0d1b2e]">
                    {billing === "yearly" && plan.price !== "0$"
                      ? `${Math.round(parseInt(plan.price) * 0.8)}$`
                      : plan.price}
                  </span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className={`${feat.included ? "ri-check-line text-emerald-500" : "ri-close-line text-gray-300"} text-xs`}></i>
                      </div>
                      <span className={feat.included ? "text-gray-600" : "text-gray-300"}>{feat.text}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${plan.ctaStyle}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#0d1b2e] mb-4">مميزات العضوية المدفوعة</h2>
            <p className="text-gray-500">كل ما تحتاجه لإنتاج محتوى AI احترافي</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featuresList.map((feat) => (
              <div key={feat.title} className="bg-[#f8faff] border border-gray-100 rounded-2xl p-5 text-center hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className={`${feat.icon} text-blue-600 text-xl`}></i>
                </div>
                <h3 className="text-[#0d1b2e] font-bold text-sm mb-1">{feat.title}</h3>
                <p className="text-gray-400 text-xs">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-[#0d1b2e] text-center mb-10">أسئلة شائعة</h2>
          <div className="space-y-4">
            {[
              { q: "هل يمكنني إلغاء الاشتراك في أي وقت؟", a: "نعم، يمكنك إلغاء اشتراكك في أي وقت دون رسوم إضافية. ستستمر في الاستفادة من الخطة حتى نهاية الفترة المدفوعة." },
              { q: "هل هناك فترة تجريبية مجانية؟", a: "نعم! الخطة المجانية تتيح لك تجربة مولد البرومبت 5 مرات شهرياً بدون بطاقة ائتمان." },
              { q: "كيف يتم الدفع؟", a: "نقبل جميع بطاقات الائتمان والخصم عبر Stripe. الدفع آمن ومشفر." },
              { q: "هل يمكن الترقية أو التخفيض؟", a: "بالتأكيد! يمكنك تغيير خطتك في أي وقت. الفرق في السعر يُحسب بشكل تناسبي." },
            ].map((faq, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
                <h4 className="text-[#0d1b2e] font-bold text-sm mb-2">{faq.q}</h4>
                <p className="text-gray-500 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default MembershipsPage;