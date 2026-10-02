import { Link, NavLink, Outlet } from "react-router-dom";
import { ClipboardList, LayoutDashboard, Package, Store, Tags, Users } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/users", label: "Users", icon: Users },
];

function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row">
      <aside className="lg:sticky lg:top-24 lg:w-56 lg:shrink-0 lg:self-start">
        <nav className="flex gap-2 overflow-x-auto rounded-3xl border border-[#e5e1d7] bg-white p-3 shadow-sm lg:flex-col lg:overflow-visible">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#315c43] text-white"
                    : "text-[#3f463f] hover:bg-[#315c43]/10"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-[#747970] transition hover:bg-[#315c43]/10 lg:mt-2 lg:border-t lg:border-[#e5e1d7] lg:pt-4"
          >
            <Store size={18} />
            Back to store
          </Link>
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;