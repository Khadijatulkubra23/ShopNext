import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ImageOff, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatPrice } from "../utils/format";

const card = "rounded-3xl border border-[#e5e1d7] bg-white shadow-sm";

function AdminProducts() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ products: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    api
      .get("/products", { params: { search: query, category, page, limit: 10 } })
      .then(({ data }) => !ignore && setData(data))
      .catch((err) => !ignore && setError(err.response?.data?.message || "Could not load products"))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [query, category, page, reload]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/${toDelete._id}`);
      toast.success("Product deleted");
      setToDelete(null);
      if (data.products.length === 1 && page > 1) setPage(page - 1);
      else setReload((r) => r + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete product");
    } finally {
      setDeleting(false);
    }
  };

  const stockBadge = (stock) =>
    stock === 0 ? (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">Out of stock</span>
    ) : stock <= 5 ? (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{stock} left</span>
    ) : (
      <span className="text-sm text-[#3f463f]">{stock}</span>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#315c43]">Products</h1>
          <p className="mt-1 text-sm text-[#747970]">{data.total} total</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#315c43] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#264a35]"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#747970]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-[#dcd8ce] bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#315c43]"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-[#dcd8ce] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#315c43]"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className={`${card} overflow-hidden`}>
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
        ) : data.products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-[#24352b]">No products found</p>
            <p className="mt-1 text-sm text-[#747970]">Try a different search or add a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#e5e1d7] bg-[#f7f5ef] text-xs uppercase tracking-wide text-[#747970]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e1d7]">
                {data.products.map((p) => (
                  <tr key={p._id} className="transition hover:bg-[#f7f5ef]/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#efece3]">
                          {p.image ? (
                            <img src={p.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[#a8a89c]">
                              <ImageOff size={16} />
                            </div>
                          )}
                        </div>
                        <span className="flex items-center gap-2 font-medium text-[#24352b]">
                          {p.name}
                          {p.featured && <Star size={14} className="fill-amber-400 text-amber-400" />}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#3f463f]">{p.category?.name || "-"}</td>
                    <td className="px-5 py-3 font-semibold text-[#315c43]">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3">{stockBadge(p.stock)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="rounded-full p-2 text-[#747970] transition hover:bg-[#315c43]/10 hover:text-[#315c43]"
                          aria-label="Edit"
                        >
                          <Pencil size={17} />
                        </Link>
                        <button
                          onClick={() => setToDelete(p)}
                          className="rounded-full p-2 text-[#747970] transition hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded-full border border-[#d8d3c7] px-4 py-2 text-sm font-medium text-[#315c43] transition hover:bg-[#315c43] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#315c43]"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="text-sm text-[#747970]">
            Page {data.page} of {data.pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= data.pages}
            className="flex items-center gap-1 rounded-full border border-[#d8d3c7] px-4 py-2 text-sm font-medium text-[#315c43] transition hover:bg-[#315c43] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#315c43]"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete product?"
          message={`"${toDelete.name}" will be permanently removed from the shop.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

export default AdminProducts;