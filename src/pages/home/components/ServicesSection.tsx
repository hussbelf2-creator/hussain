import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { defaultHomeSections, mergeHomeSections, type ServicesTexts } from "@/lib/homeSections";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price: string;
  features: string[];
  order_index: number;
}

interface Testimonial {
  id: string;
  client_name: string;
  client_role: string;
  client_avatar: string;
  content: string;
  rating: number;
}

const ServicesSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [texts, setTexts] = useState<ServicesTexts>(defaultHomeSections.services);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [svcRes, testRes, settingsRes] = await Promise.all([
          supabase.from("services").select("*").order("order_index"),
          supabase.from("testimonials").select("*").eq("featured", true).order("created_at", { ascending: false }),
          supabase.from("site_settings").select("home_sections").eq("id", 1).maybeSingle(),
        ]);

        if (svcRes.error) throw svcRes.error;
        if (testRes.error) throw testRes.error;

        setServices(svcRes.data || []);
        setTestimonials(testRes.data || []);

        if (settingsRes.data?.home_sections) {
          setTexts(mergeHomeSections(settingsRes.data.home_sections).services);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <section id="services" className="py-16 md:py-24 bg-gradient-to-b from-[#0d1b2e] to-[#1a3a5c]" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/60 mt-4 text-sm">جاري تحميل الخدمات...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="services" className="py-16 md:py-24 bg-gradient-to-b from-[#0d1b2e] to-[#1a3a5c]" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <p className="text-red-400 text-sm">حدث خطأ: {error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-blue-400 text-sm underline cursor-pointer">إعادة المحاولة</button>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-16 md:py-24 bg-gradient-to-b from-[#0d1b2e] to-[#1a3a5c]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-0.5 bg-blue-400"></div>
            <span className="text-blue-400 text-xs font-semibold tracking-wider uppercase">{texts.badge}</span>
            <div className="w-6 h-0.5 bg-blue-400"></div>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-3">
            {texts.title}
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
            {texts.subtitle}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-16">
          {services.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.id}`}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 rounded-xl p-5 transition-all duration-300 cursor-pointer block"
            >
              <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors duration-300">
                <i className={`${service.icon} text-blue-400 text-lg`}></i>
              </div>

              <h3 className="text-white font-bold text-base mb-2">{service.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">{service.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-blue-400 font-bold text-sm">
                  {texts.hidden_price_ids?.includes(service.id) ? "حسب الطلب" : (service.price || "اتصل بنا")}
                </span>
                <span className="text-white/40 group-hover:text-white text-sm flex items-center gap-1 transition-colors whitespace-nowrap">
                  تفاصيل
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-arrow-left-line text-xs"></i>
                  </div>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Testimonials */}
        <div className="border-t border-white/10 pt-12">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-black text-white mb-2">{texts.testimonials_title}</h3>
            <p className="text-white/50 text-xs">{texts.testimonials_subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <div key={i} className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-star-fill text-amber-400 text-sm"></i>
                    </div>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4 italic">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                    <img src={t.client_avatar} alt={t.client_name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.client_name}</div>
                    <div className="text-white/40 text-xs">{t.client_role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;