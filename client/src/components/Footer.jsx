import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-20 border-t border-[#e6e2d8] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-[#747970] md:flex-row">
        <div className="text-center md:text-left">
          <p className="text-lg font-bold text-[#315c43]">ShopNest</p>
          <p>Everything you need, all in one nest.</p>
        </div>
        <div className="flex gap-6">
          <Link to="/products" className="hover:text-[#315c43]">Shop</Link>
          <Link to="/cart" className="hover:text-[#315c43]">Cart</Link>
          <Link to="/orders" className="hover:text-[#315c43]">My Orders</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} ShopNest</p>
      </div>
    </footer>
  );
}

export default Footer;