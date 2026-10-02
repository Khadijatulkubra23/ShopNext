import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const perks = [
  { icon: Sparkles, title: "Carefully chosen", text: "Quality everyday pieces picked with care." },
  { icon: ShieldCheck, title: "Secure shopping", text: "Protected accounts and safe checkout." },
  { icon: PackageCheck, title: "Track every order", text: "Follow your order from placed to delivered." },
];

function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data.slice(0, 6)))
      .catch(() => {});

    api
      .get("/products", { params: { featured: true, limit: 4 } })
      .then(async ({ data }) => {
        if (data.products.length) return setProducts(data.products);
        const res = await api.get("/products", { params: { limit: 4 } });
        setProducts(res.data.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#315c43] px-8 py-16 text-center sm:px-16 sm:py-24">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/5" />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-[#cfe0d3]">
              Welcome to ShopNest
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-[#f7f5ef] sm:text-5xl">
              Everything you need, all in one nest.
            </h1>
            <p className="mt-4 text-[#d7e4da]">
              Thoughtfully selected home, lifestyle and everyday essentials, delivered to your door.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f7f5ef] px-8 py-3 text-sm font-semibold text-[#315c43] transition hover:bg-white"
              >
                Shop now <ArrowRight size={16} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full border border-[#f7f5ef]/40 px-8 py-3 text-sm font-semibold text-[#f7f5ef] transition hover:bg-white/10"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-16">
          <h2 className="text-2xl font-bold text-[#24352b]">Shop by category</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${c._id}`}
                className="group rounded-3xl border border-[#e5e1d7] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="font-semibold text-[#24352b]">{c.name}</h3>
                {c.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-[#747970]">{c.description}</p>
                )}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#315c43]">
                  Browse <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pt-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-[#24352b]">Featured products</h2>
          <Link to="/products" className="text-sm font-medium text-[#315c43] hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl border border-[#e5e1d7] bg-white" />
              ))
            : products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4 rounded-3xl bg-[#315c43]/5 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#315c43] text-white">
                <Icon size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-[#24352b]">{title}</h3>
                <p className="mt-1 text-sm text-[#747970]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;