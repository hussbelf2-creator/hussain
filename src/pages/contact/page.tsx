import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/pages/home/components/Navbar";
import FooterSection from "@/pages/home/components/FooterSection";
import { supabase } from "@/lib/supabase";
import SEO from "@/components/seo/SEO";

interface ContactItem {
  icon: string;
  label: string;
  value: string;
  sub: string;
  href: string;
  visible: boolean;
}

interface Faq {
  q: string;
  a: string;
  visible: boolean;
}

const defaultContactItems: ContactItem[] = [
  { icon: "ri-mail-line", label: "البريد الإلكتروني", value: "hassan@aiartist.com", sub: "رد خلال 24 ساعة", href: "mailto:hassan@aiartist.com", visible: true },
  { icon: "ri-whatsapp-line", label: "واتساب", value: "+966 5X XXX XXXX", sub: "متاح 9 ص – 10 م", href: "https://wa.me/966500000000", visible: true },
  { icon: "ri-instagram-line", label: "إنستغرام", value: "@hassan.ai", sub: "تابعني للمحتوى اليومي", href: "https://instagram.com/hassan.ai", visible: true },
  { icon: "ri-map-pin-line", label: "الموقع", value: "الرياض، المملكة العربية السعودية", sub: "متاح للعمل عن بُعد عالمياً", href: "", visible: true },
];

const defaultFaqs: Faq[] = [
  { q: "كم يستغرق تنفيذ المشروع؟", a: "يعتمد على حجم المشروع. التصوير الفردي 1-2 يوم، المشاريع الكبيرة 3-7 أيام.", visible: true },
  { q: "هل تعمل مع عملاء خارج السعودية؟", a: "نعم! أعمل مع عملاء من جميع أنحاء العالم عن بُعد بدون أي قيود.", visible: true },
  { q: "ما طرق الدفع المتاحة؟", a: "بطاقة بنكية، PayPal، تحويل بنكي، أو كريبتو. الدفع 50% مقدماً والباقي عند التسليم.", visible: true },
  { q: "هل يمكنني طلب تعديلات؟", a: "بالتأكيد! كل مشروع يشمل جولتين من التعديلات المجانية.", visible: true },
];

const ContactPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contactItems, setContactItems] = useState<ContactItem[]>(defaultContactItems);
  const [faqs, setFaqs] = useState<Faq[]>(defaultFaqs);
  const [whatsappNumber, setWhatsappNumber] = useState("966500000000");
  const [consultationMessage, setConsultationMessage] = useState(
    "مرحباً حسن، أرغب بحجز استشارة مجانية لمناقشة مشروعي."
  );
  const [showConsultation, setShowConsultation] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("show_contact, contact_items, contact_faqs, whatsapp_number, whatsapp_consultation_message, show_consultation")
          .eq("id", 1)
          .maybeSingle();

        if (data) {
          if (data.show_contact === false) {
            navigate("/");
            return;
          }
          if (Array.isArray(data.contact_items) && data.contact_items.length > 0) {
            setContactItems(data.contact_items as ContactItem[]);
          }
          if (Array.isArray(data.contact_faqs) && data.contact_faqs.length > 0) {
            setFaqs(data.contact_faqs as Faq[]);
          }
          if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
          if (data.whatsapp_consultation_message) setConsultationMessage(data.whatsapp_consultation_message);
          setShowConsultation(data.show_consultation !== false);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [navigate]);

  const visibleItems = contactItems.filter((item) => item.visible !== false);
  const visibleFaqs = faqs.filter((faq) => faq.visible !== false);

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(consultationMessage)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faff]" dir="rtl">
        <SEO title="تواصل معي | حسن جمال الليل" canonicalPath="/contact" />
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-[#0d1b2e] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff]" dir="rtl">
      <SEO
        title="تواصل معي | حجز استشارة ومناقشة مشروعك القادم"
        description="تواصل مع حسن جمال الليل لحجز استشارة مجانية أو مناقشة مشروعك القادم في التصوير والمونتاج بالذكاء الاصطناعي."
        canonicalPath="/contact"
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 md:px-8 bg-[#0d1b2e] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("https://readdy.ai/api/search-image?query=abstract%20dark%20blue%20geometric%20pattern%2C%20minimal%20lines%20and%20dots%2C%20technology%20background%2C%20dark%20navy%20blue%2C%20subtle%20grid%20pattern%2C%20professional%20studio%20background&width=1440&height=500&seq=contact-hero&orientation=landscape")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b2e]/60 to-[#0d1b2e]"></div>
        <div className="max-w-4xl mx-auto relative text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-white/30"></div>
            <span className="text-white/50 text-xs font-semibold tracking-widest uppercase">تواصل معي</span>
            <div className="w-8 h-0.5 bg-white/30"></div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            لنبني شيئاً <span className="text-white/60">رائعاً</span> معاً
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            سواء كان لديك مشروع، سؤال، أو مجرد فكرة — أنا هنا للاستماع والمساعدة
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-8">
            {visibleItems.map((item) => {
              const inner = (
                <>
                  <div className="w-10 h-10 bg-[#0d1b2e] rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-white text-base`}></i>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">{item.label}</p>
                    <p className="text-[#0d1b2e] font-bold text-sm leading-snug">{item.value}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
                  </div>
                </>
              );

              if (item.href) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("mailto") ? undefined : "_blank"}
                    rel={item.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                    className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 hover:border-[#0d1b2e]/20 transition-all duration-200 cursor-pointer"
                  >
                    {inner}
                  </a>
                );
              }
              return (
                <div
                  key={item.label}
                  className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 hover:border-[#0d1b2e]/20 transition-all duration-200"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free Consultation */}
      {showConsultation && (
        <section className="pb-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#0d1b2e] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `url("https://readdy.ai/api/search-image?query=abstract%20dark%20blue%20geometric%20pattern%2C%20minimal%20lines%20and%20dots%2C%20technology%20background%2C%20dark%20navy%20blue%2C%20subtle%20grid%20pattern%2C%20professional%20studio%20background&width=1200&height=600&seq=contact-consult&orientation=landscape")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
            <div className="relative">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <i className="ri-calendar-check-line text-white text-2xl"></i>
              </div>
              <h2 className="text-white font-black text-2xl md:text-3xl mb-3">استشارة مجانية</h2>
              <p className="text-white/50 text-sm md:text-base mb-8 leading-relaxed max-w-lg mx-auto">
                احجز جلسة 15 دقيقة مجانية لمناقشة مشروعك — راسلني مباشرة على واتساب وسأرد عليك في أقرب وقت
              </p>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-base px-8 py-4 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-whatsapp-line text-lg"></i>
                </div>
                احجز الآن
              </a>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* FAQ */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-6 h-0.5 bg-[#0d1b2e]/30"></div>
              <span className="text-[#0d1b2e]/40 text-xs font-semibold tracking-widest uppercase">الأسئلة الشائعة</span>
              <div className="w-6 h-0.5 bg-[#0d1b2e]/30"></div>
            </div>
            <h2 className="text-3xl font-black text-[#0d1b2e]">أسئلة يسألها الجميع</h2>
          </div>
          <div className="space-y-3">
            {visibleFaqs.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-right cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <span className="text-[#0d1b2e] font-bold text-sm">{question}</span>
        <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <i className="ri-arrow-down-s-line text-gray-400 text-base"></i>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-gray-500 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default ContactPage;