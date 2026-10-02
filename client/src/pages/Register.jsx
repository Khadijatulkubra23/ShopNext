import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    else if (form.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Enter a valid email";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8) newErrors.password = "Use at least 8 characters";
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      newErrors.password = "Include at least one letter and one number";

    if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await register(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      toast.success(`Welcome to ShopNest, ${user.name}!`);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[#315c43] ${
      errors[field] ? "border-red-400" : "border-[#dcd8ce]"
    }`;

  const labelClass = "mb-2 block text-sm font-medium text-[#3f463f]";
  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#e5e1d7] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#315c43]">Create Account</h1>
          <p className="mt-2 text-sm text-[#747970]">
            Join ShopNest and start shopping today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={inputClass("name")}
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={inputClass("email")}
            />
            {errors.email && <p className={errorClass}>{errors.email}</p>}
          </div>

          <div>
            <label className={labelClass}>Password</label>
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
            {errors.password && <p className={errorClass}>{errors.password}</p>}
          </div>

          <div>
            <label className={labelClass}>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={inputClass("confirmPassword")}
            />
            {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#315c43] py-3 font-medium text-white transition hover:bg-[#264a35] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#747970]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[#315c43] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;