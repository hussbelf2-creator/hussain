import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "../home/components/Navbar";
import FooterSection from "../home/components/FooterSection";
import SEO from "@/components/seo/SEO";

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number | null;
}

const ClientsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("client_logos")
          .select("id, name, logo_url, website_url, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: true });

        if (fetchError) throw fetchError;
        setClients(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل تحميل الشركاء");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const withWebsite = clients.filter((c) => !!c.website_url).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground-600 mt-4 text-sm">جاري تحميل الشركاء...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md px-4">
          <div className="w-14 h-14 bg-background-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-red-400 text-xl"></i>
          </div>
          <p className="text-foreground-700 text-sm mb-4">حدث خطأ: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap text-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50" dir="rtl">
      <SEO
        title="شركاء النجاح والعملاء | حسن جمال الليل"
        description="علامات تجارية وصنّاع محتوى ومشاريع وثقت بالتعاون مع حسن جمال الليل في إنتاجها البصري وتصويرها بالذكاء الاصطناعي."
        canonicalPath="/clients"
      />
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-10 px-4 md:px-8 bg-background-100 border-b border-background-200/70">
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

          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-0.5 bg-primary-500"></div>
            <span className="text-primary-600 text-xs font-semibold tracking-wider uppercase">شركاء النجاح</span>
            <div className="w-6 h-0.5 bg-primary-500"></div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-foreground-950 leading-tight mb-3">
            شركاء النجاح
          </h1>
          <p className="text-foreground-600 text-sm max-w-2xl leading-relaxed">
            علامات تجارية وصنّاع محتوى ومشاريع وثقت بالتعاون معنا في إنتاجها البصري بالذكاء الاصطناعي.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mt-8">
            <div className="bg-background-50 border border-background-200/70 rounded-lg px-5 py-3">
              <div className="text-xl md:text-2xl font-black text-foreground-950">{clients.length}</div>
              <div className="text-foreground-600 text-xs mt-1">شريك نجاح</div>
            </div>
            <div className="bg-background-50 border border-background-200/70 rounded-lg px-5 py-3">
              <div className="text-xl md:text-2xl font-black text-accent-600">{withWebsite}</div>
              <div className="text-foreground-600 text-xs mt-1">شريك له موقع إلكتروني</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {clients.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 bg-background-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-building-2-line text-foreground-400 text-2xl"></i>
              </div>
              <h3 className="text-foreground-700 font-bold text-sm mb-1">لا يوجد شركاء بعد</h3>
              <p className="text-foreground-500 text-xs">سيظهر شركاء النجاح هنا بمجرد إضافتهم</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {clients.map((client) => {
                const CardInner = (
                  <>
                    <div className="w-full h-32 md:h-40 bg-background-50 border-b border-background-200/70 flex items-center justify-center p-5 overflow-hidden">
                      {client.logo_url ? (
                        <img
                          src={client.logo_url}
                          alt={client.name}
                          title={client.name}
                          className="max-w-full max-h-full object-contain grayscale opacity-80 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-black text-2xl">{client.name?.[0] || "?"}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-between gap-2">
                      <h3 className="text-foreground-950 font-bold text-sm leading-snug truncate">
                        {client.name}
                      </h3>
                      {client.website_url && (
                        <div className="w-6 h-6 flex items-center justify-center text-foreground-500 group-hover:text-primary-600 transition-colors flex-shrink-0">
                          <i className="ri-external-link-line text-sm"></i>
                        </div>
                      )}
                    </div>
                  </>
                );

                const cardClass =
                  "group bg-background-100 border border-background-200/70 rounded-lg overflow-hidden flex flex-col transition-all duration-300 hover:border-primary-300 hover:-translate-y-0.5";

                return client.website_url ? (
                  <a
                    key={client.id}
                    href={client.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={client.name}
                    className={`${cardClass} cursor-pointer`}
                  >
                    {CardInner}
                  </a>
                ) : (
                  <div key={client.id} title={client.name} className={cardClass}>
                    {CardInner}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 md:px-8 bg-background-100 border-t border-background-200/70">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-black text-foreground-950 mb-3">
            تحب تكون الشريك القادم؟
          </h2>
          <p className="text-foreground-600 text-sm mb-6">
            خلّينا نحوّل فكرتك إلى عمل بصري احترافي يمثّل علامتك بأفضل صورة
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/services/ai-product-photography")}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              اطلب مشروعك
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="border border-background-300/60 hover:border-background-400 text-foreground-950 px-6 py-3 rounded-full font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              تواصل معي
            </button>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default ClientsPage;