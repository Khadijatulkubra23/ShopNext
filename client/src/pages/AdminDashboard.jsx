import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ClipboardList, Package, ShoppingBag, UserPlus, Users, Wallet } from "lucide-react";
import api from "../api/axios";
import { formatPrice, shortId, timeAgo } from "../utils/format";

const statusColors = {
  pending: "#d9a441",
  processing: "#8aa86b",
  shipped: "#3f8f8a",
  delivered: "#315c43",
  cancelled: "#c9573f",
};

const card = "rounded-3xl border border-[#e5e1d7] bg-white p-6 shadow-sm";

const dayLabel = (key) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load dashboard"))
      .finally(() => setLoading(false));
  }, [retry]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-3xl bg-white" />
          ))}
        </div>
        <div className="h-80 rounded-3xl bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${card} text-center`}>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => setRetry((r) => r + 1)}
          className="mt-4 rounded-full bg-[#315c43] px-6 py-2 text-sm font-medium text-white hover:bg-[#264a35]"
        >
          Try again
        </button>
      </div>
    );
  }

  const statCards = [
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), sub: "Excluding cancelled", icon: Wallet },
    { label: "Orders", value: stats.totalOrders, sub: `${stats.pendingOrders} pending`, icon: ClipboardList },
    { label: "Products", value: stats.totalProducts, sub: `${stats.lowStockCount} low on stock`, icon: Package },
    { label: "Customers", value: stats.totalUsers, sub: "Registered users", icon: Users },
  ];

  const revenueData = stats.revenueByDay.map((d) => ({ ...d, label: dayLabel(d.date) }));
  const statusData = Object.entries(stats.ordersByStatus)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));
  const maxSold = Math.max(1, ...stats.topProducts.map((p) => p.sold));

  const activity = [
    ...stats.recentOrders.map((o) => ({
      type: "order",
      date: o.createdAt,
      text: `${o.user?.name || "A customer"} placed order ${shortId(o._id)}`,
      extra: formatPrice(o.totalAmount),
    })),
    ...stats.recentUsers.map((u) => ({
      type: "user",
      date: u.createdAt,
      text: `${u.name} joined ShopNest`,
      extra: "",
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#315c43]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#747970]">A quick look at how ShopNest is doing.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className={card}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#747970]">{label}</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#315c43]/10 text-[#315c43]">
                <Icon size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#24352b]">{value}</p>
            <p className="mt-1 text-xs text-[#747970]">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`${card} lg:col-span-2`}>
          <h2 className="mb-4 text-lg font-bold text-[#24352b]">Revenue, last 7 days</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e1d7" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#747970" }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={55}
                  tick={{ fontSize: 12, fill: "#747970" }}
                  tickFormatter={(v) => formatPrice(v).replace(/\.00$/, "")}
                />
                <Tooltip
                  cursor={{ fill: "#315c43", fillOpacity: 0.06 }}
                  formatter={(value) => [formatPrice(value), "Revenue"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e1d7" }}
                />
                <Bar dataKey="revenue" fill="#315c43" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-lg font-bold text-[#24352b]">Orders by status</h2>
          {statusData.length === 0 ? (
            <p className="py-16 text-center text-sm text-[#747970]">No orders yet</p>
          ) : (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {statusData.map((s) => (
                        <Cell key={s.name} fill={statusColors[s.name]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e1d7" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 capitalize text-[#3f463f]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColors[s.name] }} />
                      {s.name}
                    </span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={card}>
          <h2 className="mb-4 text-lg font-bold text-[#24352b]">Top selling products</h2>
          {stats.topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#747970]">No sales yet</p>
          ) : (
            <div className="space-y-4">
              {stats.topProducts.map((p) => (
                <div key={p._id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate pr-3 font-medium text-[#24352b]">{p._id}</span>
                    <span className="shrink-0 text-[#747970]">{p.sold} sold</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#efece3]">
                    <div
                      className="h-2 rounded-full bg-[#315c43]"
                      style={{ width: `${(p.sold / maxSold) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={card}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#24352b]">Low stock</h2>
            <Link to="/admin/products" className="text-sm font-medium text-[#315c43] hover:underline">
              Manage
            </Link>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#747970]">All products are well stocked</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 truncate pr-3 text-[#24352b]">
                    <AlertTriangle size={15} className="shrink-0 text-amber-600" />
                    {p.name}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      p.stock === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={card}>
        <h2 className="mb-4 text-lg font-bold text-[#24352b]">Recent activity</h2>
        {activity.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#747970]">Nothing yet</p>
        ) : (
          <div className="divide-y divide-[#e5e1d7]">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#315c43]/10 text-[#315c43]">
                  {a.type === "order" ? <ShoppingBag size={16} /> : <UserPlus size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[#24352b]">{a.text}</p>
                  <p className="text-xs text-[#747970]">{timeAgo(a.date)}</p>
                </div>
                {a.extra && <span className="shrink-0 text-sm font-semibold text-[#315c43]">{a.extra}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;