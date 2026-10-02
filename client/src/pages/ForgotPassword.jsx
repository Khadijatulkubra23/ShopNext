import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address");

    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email: email.trim() });
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#e5e1d7] bg-white p-8 shadow-sm">
        {result ? (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#315c43]/10 text-[#315c43]">
              <MailCheck size={30} />
            </div>
            <h1 className="text-2xl font-bold text-[#315c43]">Request received</h1>
            <p className="mt-3 text-sm text-[#747970]">{result.message}</p>

            {result.resetUrl && (
              <div className="mt-6 rounded-2xl bg-[#f7f5ef] p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#747970]">Demo mode</p>
                <p className="mt-1 text-sm text-[#3f463f]">
                  Email sending is off, so use this link to reset your password (valid for 15 minutes).
                </p>
                <Link
                  to={new URL(result.resetUrl).pathname}
                  className="mt-3 block rounded-xl bg-[#315c43] py-2.5 text-center text-sm font-medium text-white hover:bg-[#264a35]"
                >
                  Reset my password
                </Link>
              </div>
            )}

            <Link to="/login" className="mt-6 inline-block text-sm font-medium text-[#315c43] hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-[#315c43]">Forgot Password?</h1>
              <p className="mt-2 text-sm text-[#747970]">
                Enter your email and we'll help you reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3f463f]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your email"
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[#315c43] ${
                    error ? "border-red-400" : "border-[#dcd8ce]"
                  }`}
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#315c43] py-3 font-medium text-white transition hover:bg-[#264a35] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#747970]">
              Remember your password?{" "}
              <Link to="/login" className="font-medium text-[#315c43] hover:underline">
                Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;