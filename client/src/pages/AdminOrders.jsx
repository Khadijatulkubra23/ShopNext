import { useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import ConfirmDialog from "../components/ConfirmDialog";
import OrderModal from "../components/OrderModal";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import { formatDate, formatPrice, shortId } from "../utils/format";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PER_PAGE = 10;

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [viewing, setViewing] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toCancel, setToCancel] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/orders")
      .then(({ data }) =>
        setOrders([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      )
      .catch((err) => setError(err.response?.data?.message || "Could not load orders"))
      .finally(() => setLoading(false));
  }, [reload]);

  const updateStatus = async (order, orderStatus) => {
    setUpdatingId(order._id);
    try {
      const { data } = await api.put(`/orders/${order._id}/status`, { orderStatus });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? { ...o, orderStatus: data.order.orderStatus, paymentStatus: data.order.paymentStatus }
            : o
        )
      );
      toast.success(`Order marked as ${orderStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update order");
    } finally {
      setUpdatingId(null);
      setToCancel(null);
    }
  };

  const handleStatusChange = (order, value) =>
    value === "cancelled" ? setToCancel(order) : updateStatus(order, value);

  const count = (s) => (s === "all" ? orders.length : orders.filter((o) => o.orderStatus === s).length);

  const q = search.trim().toLowerCase().replace("#", "");
  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.orderStatus !== filter) return false;
    if (!q) return true;
    return (
      shortId(o._id).toLowerCase().replace("#", "").includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q)
    );
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#315c43]">Orders</h1>
        <p className="mt-1 text-sm text-[#747970]">{orders.length} total</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", ...statuses].map((s) => (
          <button
            key={s}
            onClick={() => {
              setFilter(s);
              setPage(1);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              filter === s
                ? "bg-[#315c43] text-white"
                : "border border-[#d8d3c7] bg-white text-[#3f463f] hover:bg-[#315c43]/10"
            }`}
          >
            {s} ({count(s)})
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#747970]" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by order number, customer name or email..."
          className="w-full rounded-xl border border-[#dcd8ce] bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#315c43]"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#e5e1d7] bg-white shadow-sm">
        {error ? (
          <div className="p-10 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setReload((r) => r + 1)}
              className="mt-4 rounded-full bg-[#315c43] px-6 py-2 text-sm font-medium text-white hover:bg-[#264a35]"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="animate-pulse space-y-px">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#f7f5ef]" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-[#24352b]">No orders found</p>
            <p className="mt-1 text-sm text-[#747970]">Try a different filter or search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-[#e5e1d7] bg-[#f7f5ef] text-xs uppercase tracking-wide text-[#747970]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e1d7]">
                {visible.map((o) => (
                  <tr key={o._id} className="transition hover:bg-[#f7f5ef]/60">
                    <td className="px-5 py-3 font-semibold text-[#24352b]">{shortId(o._id)}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#24352b]">{o.user?.name || "Deleted user"}</p>
                      <p className="text-xs text-[#747970]">{o.user?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-[#747970]">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3 font-semibold text-[#315c43]">{formatPrice(o.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={o.paymentStatus} />
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={o.orderStatus}
                        disabled={o.orderStatus === "cancelled" || updatingId === o._id}
                        onChange={(e) => handleStatusChange(o, e.target.value)}
                        className="rounded-full border border-[#dcd8ce] bg-white px-3 py-1.5 text-xs font-medium capitalize outline-none transition focus:border-[#315c43] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setViewing(o)}
                        className="rounded-full p-2 text-[#747970] transition hover:bg-[#315c43]/10 hover:text-[#315c43]"
                        aria-label="View order"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={current} pages={pages} onChange={setPage} />

      {viewing && <OrderModal order={viewing} onClose={() => setViewing(null)} />}

      {toCancel && (
        <ConfirmDialog
          title={`Cancel order ${shortId(toCancel._id)}?`}
          message="The order will be marked as cancelled and its items returned to stock. This can't be undone."
          confirmLabel="Cancel order"
          loading={updatingId === toCancel._id}
          onConfirm={() => updateStatus(toCancel, "cancelled")}
          onCancel={() => setToCancel(null)}
        />
      )}
    </div>
  );
}

export default AdminOrders;