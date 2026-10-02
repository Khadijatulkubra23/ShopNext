import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (form.password.length < 8) newErrors.password = "Use at least 8 characters";
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      newErrors.password = "Include at least one letter and one number";
    if (form.confirmPassword !== form.password) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setLoading(true);
    setServerError("");
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password: form.password });
      toast.success(data.message);
      navigate("/login", { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[#315c43] ${
      errors[field] ? "border-red-400" : "border-[#dcd8ce]"
    }`;

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#e5e1d7] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#315c43]">Reset Password</h1>
          <p className="mt-2 text-sm text-[#747970]">Create a new password for your ShopNest account.</p>
        </div>

        {serverError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {serverError}{" "}
            <Link to="/forgot-password" className="font-medium underline">
              Request a new link
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#3f463f]">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className={`${inputClass("password")} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#747970] hover:text-[#315c43]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#3f463f]">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              className={inputClass("confirmPassword")}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#315c43] py-3 font-medium text-white transition hover:bg-[#264a35] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#747970]">
          <Link to="/login" className="font-medium text-[#315c43] hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;