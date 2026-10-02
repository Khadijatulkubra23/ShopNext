import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Banknote, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

const Field = ({ label, error, children }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-[#3f463f]">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const placed = useRef(false);

  const [form, setForm] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [payment, setPayment] = useState("cod");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (items.length === 0 && !placed.current) return <Navigate to="/cart" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleCard = (e) => {
    let { name, value } = e.target;
    if (name === "number") value = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    if (name === "expiry") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    if (name === "cvc") value = value.replace(/\D/g, "").slice(0, 4);
    setCard({ ...card, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const e = {};
    if (form.fullName.trim().length < 2) e.fullName = "Full name is required";
    if (form.address.trim().length < 5) e.address = "Enter your full address";
    if (!form.city.trim()) e.city = "City is required";
    if (!/^[A-Za-z0-9\- ]{3,10}$/.test(form.postalCode.trim())) e.postalCode = "Enter a valid postal code";
    if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";

    if (payment === "mock") {
      if (card.number.replace(/\s/g, "").length !== 16) e.number = "Card number must be 16 digits";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) e.expiry = "Use MM/YY";
      else {
        const [m, y] = card.expiry.split("/");
        if (new Date(2000 + Number(y), Number(m), 1) <= new Date()) e.expiry = "Card has expired";
      }
      if (card.cvc.length < 3) e.cvc = "Enter the CVC";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post("/orders", {
        items: items.map(({ product, quantity }) => ({ product, quantity })),
        shippingAddress: {
          fullName: form.fullName.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          phone: form.phone.trim(),
        },
        paymentMethod: payment,
      });
      placed.current = true;
      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/order-success/${data.order._id}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place your order");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#315c43] ${
      errors[field] ? "border-red-400" : "border-[#dcd8ce]"
    }`;

  const paymentOption = (value, Icon, title, text) => (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
        payment === value ? "border-[#315c43] bg-[#315c43]/5" : "border-[#dcd8ce]"
      }`}
    >
      <input
        type="radio"
        name="payment"
        checked={payment === value}
        onChange={() => setPayment(value)}
        className="accent-[#315c43]"
      />
      <Icon size={22} className="text-[#315c43]" />
      <div>
        <p className="text-sm font-semibold text-[#24352b]">{title}</p>
        <p className="text-xs text-[#747970]">{text}</p>
      </div>
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold text-[#315c43]">Checkout</h1>

      <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-[#e5e1d7] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-[#24352b]">Shipping Details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Full Name" error={errors.fullName}>
                  <input name="fullName" value={form.fullName} onChange={handleChange} className={inputClass("fullName")} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Address" error={errors.address}>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="House, street, area" className={inputClass("address")} />
                </Field>
              </div>
              <Field label="City" error={errors.city}>
                <input name="city" value={form.city} onChange={handleChange} className={inputClass("city")} />
              </Field>
              <Field label="Postal Code" error={errors.postalCode}>
                <input name="postalCode" value={form.postalCode} onChange={handleChange} className={inputClass("postalCode")} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Phone Number" error={errors.phone}>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+92 300 1234567" className={inputClass("phone")} />
                </Field>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#e5e1d7] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-[#24352b]">Payment Method</h2>
            <div className="space-y-3">
              {paymentOption("cod", Banknote, "Cash on Delivery", "Pay when your order arrives")}
              {paymentOption("mock", CreditCard, "Card Payment (Demo)", "Simulated payment, no real charge")}
            </div>

            {payment === "mock" && (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Card Number" error={errors.number}>
                    <input name="number" value={card.number} onChange={handleCard} placeholder="1234 5678 9012 3456" inputMode="numeric" className={inputClass("number")} />
                  </Field>
                </div>
                <Field label="Expiry" error={errors.expiry}>
                  <input name="expiry" value={card.expiry} onChange={handleCard} placeholder="MM/YY" inputMode="numeric" className={inputClass("expiry")} />
                </Field>
                <Field label="CVC" error={errors.cvc}>
                  <input name="cvc" value={card.cvc} onChange={handleCard} placeholder="123" inputMode="numeric" className={inputClass("cvc")} />
                </Field>
                <p className="text-xs text-[#747970] sm:col-span-2">
                  This is a demo. Card details are never sent or stored.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="h-fit rounded-3xl border border-[#e5e1d7] bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-[#24352b]">Order Summary</h2>
          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <div key={item.product} className="flex justify-between gap-3 text-sm">
                <span className="text-[#3f463f]">
                  {item.name} <span className="text-[#747970]">x{item.quantity}</span>
                </span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-[#e5e1d7] pt-4 text-base font-bold text-[#24352b]">
            <span>Total</span>
            <span className="text-[#315c43]">{formatPrice(subtotal)}</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#315c43] py-3 font-medium text-white transition hover:bg-[#264a35] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Placing order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Checkout;