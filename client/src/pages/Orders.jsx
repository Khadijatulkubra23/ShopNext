import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { formatDate, formatPrice, shortId } from "../utils/format";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders/my")
      .then(({ data }) => setOrders(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load your orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold text-[#315c43]">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl border border-[#e5e1d7] bg-white" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-white p-10 text-center text-red-600">{error}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-[#e5e1d7] bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#315c43]/10 text-[#315c43]">
            <Package size={30} />
          </div>
          <p className="text-lg font-semibold text-[#24352b]">No orders yet</p>
          <p className="mt-1 text-sm text-[#747970]">When you place an order, it will show up here.</p>
          <Link
            to="/products"
            className="mt-5 inline-block rounded-full bg-[#315c43] px-8 py-3 text-sm font-medium text-white hover:bg-[#264a35]"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="flex items-center justify-between gap-4 rounded-3xl border border-[#e5e1d7] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-[#24352b]">Order {shortId(order._id)}</p>
                    <StatusBadge status={order.orderStatus} />
                  </div>
                  <p className="mt-1 text-sm text-[#747970]">
                    {formatDate(order.createdAt)} · {itemCount} item{itemCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-[#315c43]">{formatPrice(order.totalAmount)}</p>
                  <ChevronRight size={18} className="text-[#747970]" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;