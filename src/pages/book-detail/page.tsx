import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/pages/home/components/Navbar";
import FooterSection from "@/pages/home/components/FooterSection";
import SEO from "@/components/seo/SEO";
import { getBookSchema } from "@/lib/seo";

interface Book {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  price: string;
  category: string;
  featured: boolean;
  buy_url: string;
}

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPayment, setSelectedPayment] = useState<"card" | "paypal" | "crypto">("card");
  const [formData, setFormData] = useState({ name: "", email: "", cardNumber: "", expiry: "", cvv: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data, error: supaError } = await supabase
          .from("books")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (supaError) throw supaError;
        setBook(data);

        if (data) {
          const { data: related } = await supabase
            .from("books")
            .select("*")
            .neq("id", data.id)
            .order("created_at", { ascending: false })
            .limit(3);
          setRelatedBooks(related || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = new URLSearchParams();
      body.append("name", formData.name);
      body.append("email", formData.email);
      body.append("book_title", book?.title || "");
      body.append("book_price", book?.price || "");
      body.append("payment_method", selectedPayment);
      await fetch("https://readdy.ai/api/form/d7ohu99us6nbnotnosa0", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4 text-sm">جاري تحميل الكتاب...</p>
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

  if (!book) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center" dir="rtl">
        <SEO title="الكتاب غير موجود | حسن جمال الليل" robots="noindex, nofollow" />
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">الكتاب غير موجود</p>
          <button onClick={() => navigate("/books")} className="bg-[#0d1b2e] text-white px-6 py-3 rounded-lg cursor-pointer">
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff]" dir="rtl">
      <SEO
        title={`${book.title} | المتجر الرقمي`}
        description={book.description}
        image={book.cover_url}
        type="product"
        canonicalPath={`/books/${id}`}
        schema={getBookSchema(book)}
      />
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 px-4 md:px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-400">
          <button onClick={() => navigate("/")} className="hover:text-gray-600 transition-colors cursor-pointer">الرئيسية</button>
          <i className="ri-arrow-left-s-line text-xs"></i>
          <button onClick={() => navigate("/books")} className="hover:text-gray-600 transition-colors cursor-pointer">المتجر</button>
          <i className="ri-arrow-left-s-line text-xs"></i>
          <span className="text-[#0d1b2e] font-medium">{book.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: Book Cover */}
          <div className="flex flex-col gap-6">
            <div className="relative group">
              <div className="w-full max-w-sm mx-auto">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-auto object-cover object-top"
                  />
                  {book.featured && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                      مميز
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto w-full">
              <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                  <i className="ri-download-cloud-line text-[#0d1b2e] text-lg"></i>
                </div>
                <div className="text-[#0d1b2e] font-black text-sm">تحميل فوري</div>
                <div className="text-gray-400 text-xs mt-0.5">بعد الشراء</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                  <i className="ri-shield-check-line text-[#0d1b2e] text-lg"></i>
                </div>
                <div className="text-[#0d1b2e] font-black text-sm">ضمان 30 يوم</div>
                <div className="text-gray-400 text-xs mt-0.5">استرداد كامل</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                  <i className="ri-customer-service-2-line text-[#0d1b2e] text-lg"></i>
                </div>
                <div className="text-[#0d1b2e] font-black text-sm">دعم مباشر</div>
                <div className="text-gray-400 text-xs mt-0.5">للاستفسارات</div>
              </div>
            </div>
          </div>

          {/* Right: Info + Payment */}
          <div className="flex flex-col gap-6">
            {/* Book Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-0.5 bg-[#0d1b2e]"></div>
                <span className="text-[#0d1b2e]/50 text-xs font-semibold tracking-wider uppercase">{book.category}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[#0d1b2e] leading-tight mb-2">{book.title}</h1>
              <p className="text-gray-500 text-base mb-6 leading-relaxed">{book.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: "ri-download-cloud-line", text: "تحميل فوري بعد الشراء" },
                  { icon: "ri-refresh-line", text: "تحديثات مجانية" },
                  { icon: "ri-shield-check-line", text: "ضمان استرداد 30 يوم" },
                  { icon: "ri-font-sans-serif", text: "محتوى عربي 100%" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg p-3">
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <i className={`${item.icon} text-[#0d1b2e] text-sm`}></i>
                    </div>
                    <span className="text-gray-600 text-xs">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Card */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-[#0d1b2e] px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-white font-black text-3xl">{book.price}</span>
                    </div>
                    <p className="text-white/50 text-xs mt-1">دفعة واحدة · وصول مدى الحياة</p>
                  </div>
                </div>
              </div>

              {submitted ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-check-line text-green-600 text-2xl"></i>
                  </div>
                  <h3 className="text-[#0d1b2e] font-black text-xl mb-2">تم الطلب بنجاح!</h3>
                  <p className="text-gray-500 text-sm mb-6">سيصلك رابط التحميل على بريدك الإلكتروني خلال دقائق</p>
                  <button
                    onClick={() => navigate("/books")}
                    className="bg-[#0d1b2e] text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer hover:bg-[#1a2f4a] transition-colors whitespace-nowrap"
                  >
                    تصفح المزيد من الكتب
                  </button>
                </div>
              ) : (
                <form data-readdy-form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <p className="text-[#0d1b2e] font-bold text-sm mb-3">طريقة الدفع</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(["card", "paypal", "crypto"] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setSelectedPayment(method)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                            selectedPayment === method
                              ? "border-[#0d1b2e] bg-[#0d1b2e]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="w-6 h-6 flex items-center justify-center">
                            <i className={`${
                              method === "card" ? "ri-bank-card-line" :
                              method === "paypal" ? "ri-paypal-line" :
                              "ri-currency-line"
                            } text-[#0d1b2e] text-base`}></i>
                          </div>
                          <span className="text-[#0d1b2e] text-xs font-semibold">
                            {method === "card" ? "بطاقة" : method === "paypal" ? "PayPal" : "كريبتو"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-600 text-xs font-medium block mb-1.5">الاسم الكامل</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="أدخل اسمك الكامل"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1b2e] placeholder-gray-400 focus:outline-none focus:border-[#0d1b2e] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 text-xs font-medium block mb-1.5">البريد الإلكتروني</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="example@email.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1b2e] placeholder-gray-400 focus:outline-none focus:border-[#0d1b2e] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between">
                      <span className="text-[#0d1b2e] font-black text-sm">الإجمالي</span>
                      <span className="text-[#0d1b2e] font-black text-lg">{book.price}</span>
                    </div>
                  </div>

                  <button
                    type={book.buy_url ? "button" : "submit"}
                    disabled={submitting}
                    onClick={() => {
                      if (book.buy_url) {
                        window.open(book.buy_url, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className="w-full bg-[#0d1b2e] hover:bg-[#1a2f4a] text-white font-black text-base py-4 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className="ri-lock-line text-sm"></i>
                        </div>
                        اشترِ الآن · {book.price}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 pt-1">
                    {[
                      { icon: "ri-shield-check-line", text: "دفع آمن" },
                      { icon: "ri-lock-2-line", text: "SSL مشفّر" },
                      { icon: "ri-refund-2-line", text: "ضمان 30 يوم" },
                    ].map((badge) => (
                      <div key={badge.text} className="flex items-center gap-1 text-gray-400">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className={`${badge.icon} text-xs`}></i>
                        </div>
                        <span className="text-xs">{badge.text}</span>
                      </div>
                    ))}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="py-16 px-4 md:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-black text-[#0d1b2e] mb-8">كتب قد تعجبك</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBooks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => navigate(`/books/${b.id}`)}
                  className="group bg-[#f8faff] border border-gray-100 rounded-2xl overflow-hidden hover:border-[#0d1b2e]/20 transition-all duration-300 flex gap-4 p-4 cursor-pointer"
                >
                  <div className="w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                    <img src={b.cover_url} alt={b.title} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-[#0d1b2e] font-black text-sm leading-snug mb-1">{b.title}</h3>
                      <p className="text-gray-400 text-xs line-clamp-2">{b.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#0d1b2e] font-black text-base">{b.price}</span>
                      <span className="text-[#0d1b2e]/50 text-xs group-hover:text-[#0d1b2e] transition-colors flex items-center gap-1">
                        عرض
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-arrow-left-line text-xs"></i>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <FooterSection />
    </div>
  );
};

export default BookDetailPage;