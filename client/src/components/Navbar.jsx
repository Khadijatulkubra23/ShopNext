import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, ShoppingCart, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Shop" },
    ...(user ? [{ to: "/orders", label: "My Orders" }, { to: "/profile", label: "Profile" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-[#315c43] ${
      isActive ? "text-[#315c43]" : "text-[#3f463f]"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e6e2d8] bg-[#f7f5ef]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold tracking-tight text-[#315c43]">
          ShopNest
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
            <Link
            to="/cart"
            className="group flex items-center gap-2 rounded-full border border-[#d8d3c7] px-4 py-2 text-sm font-medium text-[#315c43] transition hover:bg-[#315c43] hover:text-white"
            >
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">Cart</span>
                {count > 0 && (
                    <span className="rounded-full bg-[#315c43] px-2 py-0.5 text-xs font-semibold text-white group-hover:bg-white group-hover:text-[#315c43]">
                        {count}
                        </span>
                    )}
                    </Link>
          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-sm font-medium text-[#3f463f]">
                Hi, {user.name.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full bg-[#315c43] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#264a35]"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-full bg-[#315c43] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#264a35] md:block"
            >
              Login
            </Link>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="rounded-full p-2 text-[#315c43] md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-1 border-t border-[#e6e2d8] px-6 py-4 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-medium ${
                  isActive ? "bg-[#315c43]/10 text-[#315c43]" : "text-[#3f463f]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-2 rounded-xl bg-[#315c43] px-4 py-3 text-sm font-medium text-white"
            >
              <LogOut size={16} />
              Logout ({user.name.split(" ")[0]})
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-xl bg-[#315c43] px-4 py-3 text-center text-sm font-medium text-white"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;