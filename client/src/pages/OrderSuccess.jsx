import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { formatPrice, paymentLabel, shortId } from "../utils/format";

function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load order"));
  }, [id]);

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#315c43]/10 text-[#315c43]">
        <CheckCircle2 size={40} />
      </div>
      <h1 className="text-3xl font-bold text-[#315c43]">Thank you for your order!</h1>
      <p className="mt-2 text-sm text-[#747970]">
        We've received your order and will start preparing it soon.
      </p>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {order && (
        <div className="mt-8 space-y-3 rounded-3xl border border-[#e5e1d7] bg-white p-6 text-left text-sm shadow-sm">
          <div className="flex justify-between">
            <span className="text-[#747970]">Order number</span>
            <span className="font-semibold">{shortId(order._id)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#747970]">Total</span>
            <span className="font-semibold text-[#315c43]">{formatPrice(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#747970]">Payment</span>
            <span className="font-medium">{paymentLabel(order.paymentMethod)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#747970]">Status</span>
            <StatusBadge status={order.orderStatus} />
          </div>
          <div className="border-t border-[#e5e1d7] pt-3">
            <p className="text-[#747970]">Shipping to</p>
            <p className="mt-1 font-medium">{order.shippingAddress.fullName}</p>
            <p>
              {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          to={`/orders/${id}`}
          className="rounded-full bg-[#315c43] px-8 py-3 text-sm font-medium text-white hover:bg-[#264a35]"
        >
          View order
        </Link>
        <Link
          to="/products"
          className="rounded-full border border-[#315c43] px-8 py-3 text-sm font-medium text-[#315c43] hover:bg-[#315c43] hover:text-white"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccess;