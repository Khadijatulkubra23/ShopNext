import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Package } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";

const card = "rounded-3xl border border-[#e5e1d7] bg-white p-6 shadow-sm";
const labelClass = "mb-2 block text-sm font-medium text-[#3f463f]";
const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#315c43]";

function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [memberSince, setMemberSince] = useState("");
  const [name, setName] = useState(user.name);
  const [nameError, setNameError] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    api
      .get("/users/profile")
      .then(({ data }) => setMemberSince(formatDate(data.user.createdAt)))
      .catch(() => {});
  }, []);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setNameError("Name must be at least 2 characters");

    setSavingName(true);
    try {
      const { data } = await api.put("/users/profile", { name: name.trim() });
      updateUser(data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setSavingName(false);
    }
  };

  const handlePwChange = (e) => {
    setPw({ ...pw, [e.target.name]: e.target.value });
    setPwErrors({ ...pwErrors, [e.target.name]: "" });
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pw.currentPassword) errors.currentPassword = "Enter your current password";
    if (pw.newPassword.length < 8) errors.newPassword = "Use at least 8 characters";
    else if (!/[A-Za-z]/.test(pw.newPassword) || !/\d/.test(pw.newPassword))
      errors.newPassword = "Include at least one letter and one number";
    if (pw.confirmPassword !== pw.newPassword) errors.confirmPassword = "Passwords do not match";

    setPwErrors(errors);
    if (Object.keys(errors).length) return;

    setSavingPw(true);
    try {
      await api.put("/users/password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      toast.success("Password updated");
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update password");
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const pwInput = (field, label, placeholder) => (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type="password"
        name={field}
        value={pw[field]}
        onChange={handlePwChange}
        placeholder={placeholder}
        className={`${inputBase} ${pwErrors[field] ? "border-red-400" : "border-[#dcd8ce]"}`}
      />
      {pwErrors[field] && <p className="mt-1 text-xs text-red-500">{pwErrors[field]}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold text-[#315c43]">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className={`${card} h-fit text-center`}>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#315c43] text-3xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 text-lg font-bold text-[#24352b]">{user.name}</h2>
          <p className="text-sm text-[#747970]">{user.email}</p>
          <span className="mt-3 inline-block rounded-full bg-[#315c43]/10 px-3 py-1 text-xs font-semibold capitalize text-[#315c43]">
            {user.role}
          </span>
          {memberSince && <p className="mt-3 text-xs text-[#747970]">Member since {memberSince}</p>}

          <div className="mt-6 space-y-2 border-t border-[#e5e1d7] pt-6">
            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#d8d3c7] py-2.5 text-sm font-medium text-[#315c43] transition hover:bg-[#315c43] hover:text-white"
            >
              <Package size={16} /> My Orders
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-[#747970] transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <div className="space-y-6 md:col-span-2">
          <form onSubmit={handleNameSubmit} noValidate className={card}>
            <h2 className="mb-5 text-lg font-bold text-[#24352b]">Account Details</h2>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                  }}
                  className={`${inputBase} ${nameError ? "border-red-400" : "border-[#dcd8ce]"}`}
                />
                {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  value={user.email}
                  disabled
                  className={`${inputBase} cursor-not-allowed border-[#dcd8ce] bg-[#f3f1ea] text-[#747970]`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={savingName || name.trim() === user.name}
              className="mt-6 rounded-xl bg-[#315c43] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#264a35] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingName ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <form onSubmit={handlePwSubmit} noValidate className={card}>
            <h2 className="mb-5 text-lg font-bold text-[#24352b]">Change Password</h2>
            <div className="space-y-5">
              {pwInput("currentPassword", "Current Password", "Enter current password")}
              {pwInput("newPassword", "New Password", "At least 8 characters")}
              {pwInput("confirmPassword", "Confirm New Password", "Re-enter new password")}
            </div>
            <button
              type="submit"
              disabled={savingPw}
              className="mt-6 rounded-xl bg-[#315c43] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#264a35] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPw ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;