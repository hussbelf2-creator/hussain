import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  price: string | null;
  features: string[] | null;
  order_index: number | null;
  created_at: string | null;
  problem_text: string | null;
  solution_text: string | null;
  workflow_steps: { step: number; title: string; description: string }[] | null;
  suitable_for: string[] | null;
  faqs: { question: string; answer: string }[] | null;
}

const DashboardServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [hiddenPriceIds, setHiddenPriceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [svcRes, settingsRes] = await Promise.all([
          supabase.from("services").select("*").eq("id", id).maybeSingle(),
          supabase.from("site_settings").select("home_sections").eq("id", 1).maybeSingle(),
        ]);

        if (svcRes.error) throw svcRes.error;
        setService(svcRes.data);

        const hidden = settingsRes.data?.home_sections?.services?.hidden_price_ids;
        if (Array.isArray(hidden)) setHiddenPriceIds(hidden);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "فشل تحميل البيانات");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const isPriceHidden = service ? hiddenPriceIds.includes(service.id) : false;

  return (
    <DashboardLayout>
      <button
        onClick={() => navigate("/dashboard/services")}
        className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors cursor-pointer"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-arrow-right-line"></i>
        </div>
        العودة للخدمات
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => navigate("/dashboard/services")} className="text-red-400 hover:text-red-300 text-sm mt-2 cursor-pointer">العودة</button>
        </div>
      ) : !service ? (
        <div className="bg-[#0d1b2e] border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-white/30 text-2xl"></i>
          </div>
          <p className="text-white/40 text-sm">الخدمة غير موجودة</p>
          <button onClick={() => navigate("/dashboard/services")} className="text-blue-400 text-sm mt-2 hover:text-blue-300 cursor-pointer">العودة للقائمة</button>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#0d1b2e] border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <i className={`${service.icon || "ri-customer-service-2-line"} text-blue-400 text-xl`}></i>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white">{service.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-white/40 text-sm">#{service.order_index ?? 0}</span>
                  {service.price && (
                    <span className="bg-blue-600/20 text-blue-400 text-xs px-2.5 py-1 rounded-full font-medium">
                      {service.price}
                    </span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${isPriceHidden ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                    <i className={isPriceHidden ? "ri-eye-off-line" : "ri-eye-line"}></i>
                    {isPriceHidden ? "السعر مخفي في الموقع" : "السعر معروض في الموقع"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-lg font-black text-white">{(service.features || []).length}</div>
                <div className="text-xs text-white/40 mt-1">ميزات</div>
              </div>
              <div className="bg-blue-600/20 rounded-xl p-4 text-center">
                <div className="text-lg font-black text-blue-400">{service.price || "—"}</div>
                <div className="text-xs text-white/40 mt-1 flex items-center justify-center gap-1">
                  <span>السعر</span>
                  <span>({isPriceHidden ? "مخفي" : "معروض"})</span>
                </div>
              </div>
              <div className="bg-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-lg font-black text-emerald-400">#{service.order_index ?? 0}</div>
                <div className="text-xs text-white/40 mt-1">الترتيب</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-bold text-sm mb-3">الوصف</h3>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/60 text-sm leading-relaxed">
                {service.description || "لا يوجد وصف"}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-bold text-sm mb-3">المميزات</h3>
              {service.features && service.features.length > 0 ? (
                <div className="space-y-2">
                  {service.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-check-line text-emerald-400 text-xs"></i>
                      </div>
                      <span className="text-white/70 text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm">لا توجد مميزات</p>
              )}
            </div>

            {service.created_at && (
              <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-white/30 text-xs">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-calendar-line"></i>
                </div>
                تاريخ الإنشاء: {new Date(service.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            )}

            {/* Problem & Solution */}
            {(service.problem_text || service.solution_text) && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white font-bold text-sm mb-3">المشكلة والحل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                    <span className="text-red-400 text-xs font-semibold">المشكلة</span>
                    <p className="text-white/60 text-sm mt-1">{service.problem_text || "—"}</p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                    <span className="text-emerald-400 text-xs font-semibold">الحل</span>
                    <p className="text-white/60 text-sm mt-1">{service.solution_text || "—"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Workflow Steps */}
            {service.workflow_steps && service.workflow_steps.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white font-bold text-sm mb-3">آلية العمل</h3>
                <div className="space-y-3">
                  {service.workflow_steps.map((step) => (
                    <div key={step.step} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{step.step}</div>
                      <div>
                        <p className="text-white font-semibold text-sm">{step.title}</p>
                        <p className="text-white/50 text-xs mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suitable For */}
            {service.suitable_for && service.suitable_for.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white font-bold text-sm mb-3">مناسبة لـ</h3>
                <div className="flex flex-wrap gap-2">
                  {service.suitable_for.map((item, i) => (
                    <span key={i} className="bg-blue-600/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">{item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {service.faqs && service.faqs.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white font-bold text-sm mb-3">الأسئلة الشائعة</h3>
                <div className="space-y-3">
                  {service.faqs.map((faq, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-white font-semibold text-sm">{faq.question}</p>
                      <p className="text-white/50 text-xs mt-1">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => navigate("/dashboard/services")}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              <i className="ri-arrow-right-line ml-2"></i>
              العودة للقائمة
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardServiceDetailPage;