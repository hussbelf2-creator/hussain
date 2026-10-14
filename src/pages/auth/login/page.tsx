import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/seo/SEO";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (user) {
    const redirect = searchParams.get("redirect") || "/dashboard";
    navigate(redirect, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    setLoading(false);

    if (signInError) {
      if (signInError.toLowerCase().includes("invalid login credentials")) {
        setError("بيانات الدخول غير صحيحة. تأكد من البريد الإلكتروني وكلمة المرور.");
      } else {
        setError(signInError);
      }
      return;
    }

    const redirect = searchParams.get("redirect") || "/dashboard";
    navigate(redirect, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4" dir="rtl">
      <SEO title="تسجيل الدخول | لوحة التحكم" robots="noindex, nofollow" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-film-line text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-black text-white">تسجيل الدخول</h1>
          <p className="text-white/40 text-sm mt-2">لوحة تحكم حسن جمال الليل</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0d1b2e] border border-white/10 rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className="ri-error-warning-line"></i>
              </div>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="admin@example.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl mt-6 transition-colors cursor-pointer whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                جاري الدخول...
              </span>
            ) : (
              "دخول"
            )}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          لوحة التحكم محمية · للمسؤول فقط
        </p>
      </div>
    </div>
  );
}