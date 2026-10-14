import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/components/base/Toast";
import { defaultHomeSections, mergeHomeSections } from "@/lib/homeSections";

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  price: string | null;
  features: string[] | null;
  order_index: number | null;
  status: string | null;
  category: string | null;
  created_at: string | null;
  problem_text: string | null;
  solution_text: string | null;
  workflow_steps: { step: number; title: string; description: string }[] | null;
  suitable_for: string[] | null;
  faqs: { question: string; answer: string }[] | null;
}

interface ServiceForm {
  title: string;
  description: string;
  icon: string;
  price: string;
  show_price: boolean;
  features: string;
  order_index: number;
  status: string;
  category: string;
  problem_text: string;
  solution_text: string;
  workflow_steps: string;
  suitable_for: string;
  faqs: string;
}

const emptyForm: ServiceForm = {
  title: "",
  description: "",
  icon: "ri-camera-line",
  price: "",
  show_price: true,
  features: "",
  order_index: 0,
  status: "نشط",
  category: "",
  problem_text: "",
  solution_text: "",
  workflow_steps: "",
  suitable_for: "",
  faqs: "",
};

const serviceCategories = ["تصوير", "أفلام", "إعلانات", "تصميم", "استشارات"];

const DashboardServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Page header texts & price visibility settings
  const [pageBadge, setPageBadge] = useState("الباقات والأسعار");
  const [pageTitle, setPageTitle] = useState("جميع الخدمات");
  const [hiddenPriceIds, setHiddenPriceIds] = useState<string[]>([]);
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);
  const [savingHeaders, setSavingHeaders] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("home_sections")
        .eq("id", 1)
        .maybeSingle();

      if (data?.home_sections) {
        const merged = mergeHomeSections(data.home_sections);
        const svc = merged.services;
        if (svc.page_badge) setPageBadge(svc.page_badge);
        if (svc.page_title) setPageTitle(svc.page_title);
        if (Array.isArray(svc.hidden_price_ids)) setHiddenPriceIds(svc.hidden_price_ids);
      }
    } catch {
      // Keep defaults
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let query = supabase.from("services").select("*");

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }
      if (filterStatus) {
        query = query.eq("status", filterStatus);
      }
      if (filterCategory) {
        query = query.eq("category", filterCategory);
      }

      query = query.order("order_index", { ascending: true });

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setServices(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterStatus, filterCategory]);

  useEffect(() => {
    fetchServices();
    fetchSettings();
  }, [fetchServices, fetchSettings]);

  const syncHiddenPriceIds = async (newIds: string[]) => {
    try {
      setHiddenPriceIds(newIds);
      const { data: currentSettings } = await supabase
        .from("site_settings")
        .select("home_sections")
        .eq("id", 1)
        .maybeSingle();

      const merged = mergeHomeSections(currentSettings?.home_sections);
      const updatedSections = {
        ...merged,
        services: {
          ...merged.services,
          hidden_price_ids: newIds,
        },
      };

      await supabase
        .from("site_settings")
        .update({
          home_sections: updatedSections,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);
    } catch {
      showToast("فشل تحديث إعدادات عرض السعر", "error");
    }
  };

  const togglePriceVisibility = async (serviceId: string) => {
    const isCurrentlyHidden = hiddenPriceIds.includes(serviceId);
    const updated = isCurrentlyHidden
      ? hiddenPriceIds.filter((id) => id !== serviceId)
      : [...hiddenPriceIds, serviceId];

    await syncHiddenPriceIds(updated);
    showToast(
      isCurrentlyHidden ? "تم تفعيل إظهار السعر في الموقع" : "تم إخفاء السعر من الموقع",
      "success"
    );
  };

  const handleSaveHeaders = async () => {
    setSavingHeaders(true);
    try {
      const { data: currentSettings } = await supabase
        .from("site_settings")
        .select("home_sections")
        .eq("id", 1)
        .maybeSingle();

      const merged = mergeHomeSections(currentSettings?.home_sections);
      const updatedSections = {
        ...merged,
        services: {
          ...merged.services,
          page_badge: pageBadge.trim() || defaultHomeSections.services.page_badge,
          page_title: pageTitle.trim() || defaultHomeSections.services.page_title,
        },
      };

      const { error: saveErr } = await supabase
        .from("site_settings")
        .update({
          home_sections: updatedSections,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (saveErr) throw saveErr;
      showToast("تم حفظ عناوين قسم الخدمات بنجاح", "success");
      setShowHeaderSettings(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "فشل حفظ العناوين", "error");
    } finally {
      setSavingHeaders(false);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchQuery("");
    setFilterStatus("");
    setFilterCategory("");
  };

  const categoriesFromData = [...new Set(services.map((s) => s.category || "عام"))];

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, show_price: true, order_index: services.length });
    setShowModal(true);
  };

  const openEditModal = (service: Service) => {
    setEditingId(service.id);
    const workflowStr = (service.workflow_steps || [])
      .map((s: { step: number; title: string; description: string }) => `${s.title}|${s.description}`)
      .join("\n");
    const suitableStr = (service.suitable_for || []).join("\n");
    const faqsStr = (service.faqs || [])
      .map((f: { question: string; answer: string }) => `${f.question}|${f.answer}`)
      .join("\n");

    const isHidden = hiddenPriceIds.includes(service.id);

    setForm({
      title: service.title,
      description: service.description || "",
      icon: service.icon || "ri-camera-line",
      price: service.price || "",
      show_price: !isHidden,
      features: (service.features || []).join("\n"),
      order_index: service.order_index || 0,
      status: service.status || "نشط",
      category: service.category || "",
      problem_text: service.problem_text || "",
      solution_text: service.solution_text || "",
      workflow_steps: workflowStr,
      suitable_for: suitableStr,
      faqs: faqsStr,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);

    const featuresList = form.features.split("\n").map((f) => f.trim()).filter(Boolean);

    const workflowLines = form.workflow_steps.split("\n").filter((l) => l.trim());
    const workflowSteps = workflowLines.map((line, i) => {
      const [title = "", description = ""] = line.split("|").map((s) => s.trim());
      return { step: i + 1, title: title || `الخطوة ${i + 1}`, description };
    });

    const suitableList = form.suitable_for.split("\n").map((s) => s.trim()).filter(Boolean);

    const faqLines = form.faqs.split("\n").filter((l) => l.trim());
    const faqList = faqLines.map((line) => {
      const [question = "", answer = ""] = line.split("|").map((s) => s.trim());
      return { question: question || "سؤال", answer };
    });

    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      icon: form.icon,
      price: form.price || null,
      features: featuresList.length > 0 ? featuresList : null,
      order_index: form.order_index,
      status: form.status || "نشط",
      category: form.category || null,
      problem_text: form.problem_text.trim() || null,
      solution_text: form.solution_text.trim() || null,
      workflow_steps: workflowSteps.length > 0 ? workflowSteps : null,
      suitable_for: suitableList.length > 0 ? suitableList : null,
      faqs: faqList.length > 0 ? faqList : null,
    };

    try {
      if (editingId) {
        await supabase.from("services").update(payload).eq("id", editingId);

        const updatedHidden = form.show_price
          ? hiddenPriceIds.filter((id) => id !== editingId)
          : hiddenPriceIds.includes(editingId)
          ? hiddenPriceIds
          : [...hiddenPriceIds, editingId];

        await syncHiddenPriceIds(updatedHidden);
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from("services")
          .insert(payload)
          .select()
          .single();

        if (insertErr) throw insertErr;

        if (inserted && !form.show_price) {
          await syncHiddenPriceIds([...hiddenPriceIds, inserted.id]);
        }
      }

      setShowModal(false);
      showToast(editingId ? "تم تعديل الخدمة بنجاح" : "تم إضافة الخدمة بنجاح", "success");
      await fetchServices();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from("services").delete().eq("id", id);
      if (hiddenPriceIds.includes(id)) {
        await syncHiddenPriceIds(hiddenPriceIds.filter((i) => i !== id));
      }
      setDeleteConfirm(null);
      await fetchServices();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "فشل الحذف");
    }
  };

  return (
    <DashboardLayout>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(""); fetchServices(); }} className="text-red-400 hover:text-red-300 cursor-pointer px-2">إعادة المحاولة</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة الخدمات</h1>
          <p className="text-white/40 text-sm mt-1 flex items-center gap-2">
            <span>{pageBadge}</span>
            <span>•</span>
            <span>{pageTitle}</span>
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowHeaderSettings(!showHeaderSettings)}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer transition-all border ${
              showHeaderSettings
                ? "bg-blue-600/25 border-blue-500 text-blue-300"
                : "bg-white/5 border-white/10 hover:border-white/20 text-white/90 hover:text-white"
            }`}
          >
            <i className="ri-settings-3-line text-blue-400"></i>
            تعديل العناوين
          </button>
          <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors shadow-lg shadow-blue-600/20">
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-add-line"></i></div>
            إضافة خدمة
          </button>
        </div>
      </div>

      {/* Header Settings Card (الباقات والأسعار & جميع الخدمات) */}
      {showHeaderSettings && (
        <div className="bg-[#0f2238] border border-blue-500/30 rounded-2xl p-5 mb-6 shadow-xl shadow-blue-500/5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <i className="ri-text-snippet text-lg"></i>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">تعديل نصوص وعناوين قسم الخدمات في الموقع</h3>
                <p className="text-white/40 text-xs mt-0.5">يمكنك تغيير الشارة والعنوان المعروضين في صفحة الخدمات</p>
              </div>
            </div>
            <button
              onClick={() => setShowHeaderSettings(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:text-white cursor-pointer transition-colors"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                شارة القسم / النص الصغير العلوي
              </label>
              <input
                type="text"
                value={pageBadge}
                onChange={(e) => setPageBadge(e.target.value)}
                placeholder="الباقات والأسعار"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
              <p className="text-white/30 text-[11px] mt-1">يظهر كشارة صغيرة أعلى العنوان (مثل: الباقات والأسعار)</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                العنوان الرئيسي لقسم الخدمات
              </label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="جميع الخدمات"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
              <p className="text-white/30 text-[11px] mt-1">العنوان الرئيسي البارز للقسم (مثل: جميع الخدمات)</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setPageBadge("الباقات والأسعار");
                setPageTitle("جميع الخدمات");
              }}
              type="button"
              className="text-xs text-white/40 hover:text-white px-3 py-2 cursor-pointer transition-colors"
            >
              استعادة الافتراضي
            </button>
            <button
              onClick={handleSaveHeaders}
              disabled={savingHeaders}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {savingHeaders ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <i className="ri-check-line text-base"></i>
                  حفظ العناوين
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-[#0d1b2e] border border-white/10 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 w-full">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0"><i className="ri-search-line text-white/40"></i></div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="بحث في الخدمات..."
            className="flex-1 text-sm text-white/70 placeholder-white/30 focus:outline-none bg-transparent min-w-0"
          />
          <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-sm cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1.5">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-search-line"></i></div>
            بحث
          </button>
          {(searchQuery || filterStatus || filterCategory) && (
            <button onClick={handleClear} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/60 cursor-pointer flex-shrink-0">
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/60 focus:outline-none focus:border-blue-500 cursor-pointer">
            <option value="" className="bg-[#0d1b2e]">كل الحالات</option>
            <option value="نشط" className="bg-[#0d1b2e]">نشط</option>
            <option value="مسودة" className="bg-[#0d1b2e]">مسودة</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/60 focus:outline-none focus:border-blue-500 cursor-pointer">
            <option value="" className="bg-[#0d1b2e]">كل التصنيفات</option>
            {categoriesFromData.map((c) => (<option key={c} value={c} className="bg-[#0d1b2e]">{c}</option>))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : services.length === 0 ? (
        <div className="bg-[#0d1b2e] border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-search-line text-white/30 text-2xl"></i></div>
          <p className="text-white/40 text-sm">لا توجد خدمات{searchQuery ? " تطابق بحثك" : ""}</p>
          {searchQuery || filterStatus || filterCategory ? (
            <button onClick={handleClear} className="text-blue-400 text-sm mt-2 hover:text-blue-300 cursor-pointer">مسح الفلاتر</button>
          ) : (
            <button onClick={openAddModal} className="text-blue-400 text-sm mt-2 hover:text-blue-300 cursor-pointer">أضف أول خدمة</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const isPriceHidden = hiddenPriceIds.includes(service.id);
            return (
              <div key={service.id} className="bg-[#0d1b2e] border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                      <i className={`${service.icon || "ri-camera-line"} text-blue-400`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{service.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {service.category && <span className="text-white/30 text-xs">{service.category}</span>}
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${service.status === "مسودة" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>{service.status === "مسودة" ? "مسودة" : "نشط"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/dashboard/services/${service.id}`)} className="w-7 h-7 flex items-center justify-center text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-colors cursor-pointer" title="عرض التفاصيل"><i className="ri-eye-line text-xs"></i></button>
                    <button onClick={() => openEditModal(service)} className="w-7 h-7 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-amber-600/20 rounded-lg transition-colors cursor-pointer" title="تعديل"><i className="ri-edit-line text-xs"></i></button>
                    <button onClick={() => setDeleteConfirm(service.id)} className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer" title="حذف"><i className="ri-delete-bin-line text-xs"></i></button>
                  </div>
                </div>
                <p className="text-white/40 text-xs mb-4 line-clamp-2">{service.description || "—"}</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-lg font-black text-white">{(service.features || []).length}</div>
                    <div className="text-xs text-white/40">ميزات</div>
                  </div>
                  <div className="bg-blue-600/20 rounded-xl p-2.5 text-center flex flex-col justify-between">
                    <div className="text-sm font-black text-blue-400 truncate" title={service.price || "—"}>{service.price || "—"}</div>
                    <button
                      onClick={() => togglePriceVisibility(service.id)}
                      title={isPriceHidden ? "اضغط لإظهار السعر في الموقع" : "اضغط لإخفاء السعر من الموقع"}
                      className={`mt-1 inline-flex items-center justify-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        isPriceHidden
                          ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      }`}
                    >
                      <i className={isPriceHidden ? "ri-eye-off-line" : "ri-eye-line"}></i>
                      {isPriceHidden ? "السعر مخفي" : "السعر معروض"}
                    </button>
                  </div>
                  <div className="bg-emerald-500/20 rounded-xl p-3 text-center">
                    <div className="text-sm font-black text-emerald-400">#{service.order_index ?? 0}</div>
                    <div className="text-xs text-white/40">الترتيب</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0d1b2e] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-white">{editingId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white cursor-pointer"><i className="ri-close-line text-xl"></i></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">اسم الخدمة *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="تصوير المنتجات بالـ AI" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">الأيقونة (Remix Icon)</label>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${form.icon || "ri-camera-line"} text-blue-400 text-lg`}></i>
                    </div>
                    <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="ri-camera-line" />
                  </div>
                  <p className="text-white/25 text-xs mt-1">اكتب اسم الأيقونة من remixicon.com</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">السعر</label>
                  <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="يبدأ من 500$" />
                </div>
              </div>

              {/* Price Visibility Switch */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${form.show_price ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                    <i className={form.show_price ? "ri-eye-line text-base" : "ri-eye-off-line text-base"}></i>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">إظهار السعر في الموقع</div>
                    <p className="text-[11px] text-white/40">
                      {form.show_price ? "السعر سيظهر للزوار في صفحة الخدمات والصفحة الرئيسية" : "سيتم إخفاء السعر من العرض وعرض (حسب الطلب)"}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={form.show_price}
                    onChange={(e) => setForm({ ...form, show_price: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">التصنيف</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer">
                    <option value="" className="bg-[#0d1b2e]">بدون تصنيف</option>
                    {serviceCategories.map((c) => (<option key={c} className="bg-[#0d1b2e]">{c}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">الحالة</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer">
                    <option value="نشط" className="bg-[#0d1b2e]">نشط</option>
                    <option value="مسودة" className="bg-[#0d1b2e]">مسودة</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">الوصف</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none" rows={2} maxLength={300} placeholder="وصف مختصر للخدمة..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">المميزات (كل سطر ميزة)</label>
                <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none" rows={4} maxLength={1000} placeholder="تسليم خلال 48 ساعة&#10;3 مراجعات مجانية&#10;ملفات عالية الدقة" />
              </div>

              {/* تفاصيل صفحة الخدمة المتقدمة */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-white/60 text-xs mb-3 mt-1">تفاصيل صفحة الخدمة (تظهر للزوار)</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">نص المشكلة</label>
                    <textarea value={form.problem_text} onChange={(e) => setForm({ ...form, problem_text: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none" rows={3} maxLength={300} placeholder="الإنتاج البصري التقليدي مكلف ويستغرق وقتاً طويلاً..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">نص الحل</label>
                    <textarea value={form.solution_text} onChange={(e) => setForm({ ...form, solution_text: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none" rows={3} maxLength={300} placeholder="باستخدام أحدث أدوات الذكاء الاصطناعي، ننتج محتوى بصري احترافي..." />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-white/70 mb-1.5">آلية العمل (كل سطر: العنوان|الوصف)</label>
                  <textarea value={form.workflow_steps} onChange={(e) => setForm({ ...form, workflow_steps: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none" rows={4} maxLength={600} placeholder="تحليل الاحتياج|نفهم مشروعك وأهدافك والأسلوب المناسب&#10;التخطيط|نضع خطة واضحة مع الجدول الزمني&#10;التنفيذ|نبدأ الإنتاج باستخدام أحدث الأدوات&#10;التسليم|تسليم المشروع مع ضمان الجودة" />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-white/70 mb-1.5">مناسبة لـ (كل سطر تصنيف)</label>
                  <textarea value={form.suitable_for} onChange={(e) => setForm({ ...form, suitable_for: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none" rows={3} maxLength={400} placeholder="العلامات التجارية&#10;المتاجر الإلكترونية&#10;صناع المحتوى" />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-white/70 mb-1.5">الأسئلة الشائعة (كل سطر: السؤال|الجواب)</label>
                  <textarea value={form.faqs} onChange={(e) => setForm({ ...form, faqs: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none" rows={4} maxLength={800} placeholder="كيف يمكنني طلب الخدمة؟|يمكنك التواصل معي مباشرة عبر صفحة التواصل&#10;ما هي مدة التسليم؟|تختلف المدة حسب الباقة من 3 إلى 7 أيام" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">الترتيب</label>
                <input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" min={0} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving || !form.title.trim()} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
                {saving ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "إضافة الخدمة"}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-white/60 font-medium py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0d1b2e] border border-white/10 rounded-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-error-warning-line text-red-400 text-xl"></i></div>
            <h3 className="text-lg font-black text-white text-center mb-2">تأكيد الحذف</h3>
            <p className="text-white/50 text-sm text-center mb-5">هل أنت متأكد من حذف هذه الخدمة؟</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-sm">نعم، احذف</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-white/10 text-white/60 font-medium py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardServicesPage;