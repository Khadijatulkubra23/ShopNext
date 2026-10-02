import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

function Products() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "newest";
  const page = Number(params.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(search);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ products: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const updateParams = (changes) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries({ page: "", ...changes }).forEach(([key, value]) =>
        value ? next.set(key, value) : next.delete(key)
      );
      return next;
    });

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== search) updateParams({ search: searchInput.trim() });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    api
      .get("/products", { params: { search, category, sort, page, limit: 12 } })
      .then(({ data }) => !ignore && setData(data))
      .catch((err) => !ignore && setError(err.response?.data?.message || "Could not load products"))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [search, category, sort, page, retry]);

  const clearFilters = () => {
    setSearchInput("");
    setParams({});
  };

  const goToPage = (n) => {
    updateParams({ page: String(n) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasFilters = search || category || sort !== "newest";
  const selectClass =
    "rounded-xl border border-[#dcd8ce] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#315c43]";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#315c43]">Shop</h1>
        <p className="mt-1 text-sm text-[#747970]">
          {loading ? "Loading products..." : `${data.total} product${data.total === 1 ? "" : "s"} found`}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#747970]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-[#dcd8ce] bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#315c43]"
          />
        </div>

        <select value={category} onChange={(e) => updateParams({ category: e.target.value })} className={selectClass}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => updateParams({ sort: e.target.value })} className={selectClass}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name: A-Z</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-white p-10 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setRetry((r) => r + 1)}
            className="mt-4 rounded-full bg-[#315c43] px-6 py-2 text-sm font-medium text-white hover:bg-[#264a35]"
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-[#e5e1d7] bg-white">
              <div className="aspect-square bg-[#efece3]" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-1/3 rounded bg-[#efece3]" />
                <div className="h-4 w-3/4 rounded bg-[#efece3]" />
                <div className="h-5 w-1/4 rounded bg-[#efece3]" />
              </div>
            </div>
          ))}
        </div>
      ) : data.products.length === 0 ? (
        <div className="rounded-3xl border border-[#e5e1d7] bg-white p-12 text-center">
          <p className="text-lg font-semibold text-[#24352b]">No products found</p>
          <p className="mt-1 text-sm text-[#747970]">Try a different search or category.</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-5 rounded-full border border-[#315c43] px-6 py-2 text-sm font-medium text-[#315c43] hover:bg-[#315c43] hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {data.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {data.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-full border border-[#d8d3c7] px-4 py-2 text-sm font-medium text-[#315c43] transition hover:bg-[#315c43] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#315c43]"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-sm text-[#747970]">
                Page {data.page} of {data.pages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= data.pages}
                className="flex items-center gap-1 rounded-full border border-[#d8d3c7] px-4 py-2 text-sm font-medium text-[#315c43] transition hover:bg-[#315c43] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#315c43]"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;