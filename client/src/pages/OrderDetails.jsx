import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, ImageOff } from "lucide-react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { formatDate, formatPrice, paymentLabel, shortId } from "../utils/format";

const steps = ["pending", "processing", "shipped", "delivered"];

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load order"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-4xl animate-pulse px-6 py-10"><div className="h-96 rounded-3xl bg-white" /></div>;
  }

  if (error || !order) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-lg font-semibold text-[#24352b]">{error || "Order not found"}</p>
        <Link to="/orders" className="mt-5 inline-block rounded-full bg-[#315c43] px-6 py-2 text-sm font-medium text-white hover:bg-[#264a35]">
          Back to orders
        </Link>
      </div>
    );
  }

  const current = steps.indexOf(order.orderStatus);
  const cancelled = order.orderStatus === "cancelled";
  const card = "rounded-3xl border border-[#e5e1d7] bg-white p-6 shadow-sm";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#747970] hover:text-[#315c43]">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#315c43]">Order {shortId(order._id)}</h1>
          <p className="mt-1 text-sm text-[#747970]">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>

      <div className={`${card} mb-6`}>
        {cancelled ? (
          <p className="text-center text-sm font-medium text-red-600">This order was cancelled.</p>
        ) : (
          <div className="flex items-start">
            {steps.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : i <= current ? "bg-[#315c43]" : "bg-[#e5e1d7]"}`} />
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                      i <= current ? "bg-[#315c43]" : "bg-[#d8d3c7]"
                    }`}
                  >
                    {i <= current && <Check size={16} />}
                  </div>
                  <div className={`h-0.5 flex-1 ${i === steps.length - 1 ? "opacity-0" : i < current ? "bg-[#315c43]" : "bg-[#e5e1d7]"}`} />
                </div>
                <p className={`mt-2 text-xs font-medium capitalize ${i <= current ? "text-[#315c43]" : "text-[#747970]"}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className={`${card} md:col-span-2`}>
          <h2 className="mb-4 text-lg font-bold text-[#24352b]">Items</h2>
          <div className="divide-y divide-[#e5e1d7]">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#efece3]">
                  {item.product?.image ? (
                    <img src={item.product.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#a8a89c]">
                      <ImageOff size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#24352b]">{item.name}</p>
                  <p className="text-sm text-[#747970]">
                    {formatPrice(item.price)} x {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-[#e5e1d7] pt-4 text-base font-bold">
            <span>Total</span>
            <span className="text-[#315c43]">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className={card}>
            <h2 className="mb-3 text-lg font-bold text-[#24352b]">Shipping</h2>
            <p className="text-sm font-medium">{order.shippingAddress.fullName}</p>
            <p className="mt-1 text-sm text-[#3f463f]">
              {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
            </p>
            <p className="mt-1 text-sm text-[#747970]">{order.shippingAddress.phone}</p>
          </div>

          <div className={card}>
            <h2 className="mb-3 text-lg font-bold text-[#24352b]">Payment</h2>
            <p className="text-sm text-[#3f463f]">{paymentLabel(order.paymentMethod)}</p>
            <div className="mt-2">
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;