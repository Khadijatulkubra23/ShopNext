import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImageOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const empty = { name: "", description: "", price: "", stock: "", category: "", image: "", featured: false };
const labelClass = "mb-2 block text-sm font-medium text-[#3f463f]";

function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const requests = [api.get("/categories")];
    if (isEdit) requests.push(api.get(`/products/${id}`));

    Promise.all(requests)
      .then(([cats, product]) => {
        setCategories(cats.data);
        if (product) {
          const p = product.data;
          setForm({
            name: p.name,
            description: p.description,
            price: String(p.price),
            stock: String(p.stock),
            category: p.category?._id || "",
            image: p.image || "",
            featured: p.featured,
          });
        }
      })
      .catch((err) => setLoadError(err.response?.data?.message || "Could not load data"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (form.description.trim().length < 10) e.description = "Description must be at least 10 characters";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = "Enter a price greater than 0";
    if (form.stock === "" || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = "Stock must be a whole number, 0 or more";
    if (!form.category) e.category = "Select a category";
    if (form.image.trim() && !/^https?:\/\/\S+$/i.test(form.image.trim()))
      e.image = "Image must be a valid http(s) URL";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      image: form.image.trim(),
      featured: form.featured,
    };

    setSaving(true);
    try {
      if (isEdit) await api.put(`/products/${id}`, payload);
      else await api.post("/products", payload);
      toast.success(isEdit ? "Product updated" : "Product created");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#315c43] ${
      errors[field] ? "border-red-400" : "border-[#dcd8ce]"
    }`;
  const errorText = (field) => errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>;

  if (loading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-[#e5e1d7] bg-white p-10 text-center">
        <p className="text-red-600">{loadError}</p>
        <Link to="/admin/products" className="mt-4 inline-block text-sm font-medium text-[#315c43] hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/products"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[#747970] hover:text-[#315c43]"
        >
          <ArrowLeft size={16} /> Back to products
        </Link>
        <h1 className="text-3xl font-bold text-[#315c43]">{isEdit ? "Edit Product" : "Add Product"}</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-8 rounded-3xl border border-[#e5e1d7] bg-white p-6 shadow-sm lg:grid-cols-3"
      >
        <div className="space-y-5 lg:col-span-2">
          <div>
            <label className={labelClass}>Product Name</label>
            <input name="name" value={form.name} onChange={handleChange} className={inputClass("name")} />
            {errorText("name")}
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              className={inputClass("description")}
            />
            {errorText("description")}
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                className={inputClass("price")}
              />
              {errorText("price")}
            </div>
            <div>
              <label className={labelClass}>Stock</label>
              <input
                type="number"
                min="0"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className={inputClass("stock")}
              />
              {errorText("stock")}
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputClass("category")}>
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errorText("category")}
            </div>
          </div>

          {categories.length === 0 && (
            <p className="text-sm text-amber-700">
              No categories yet.{" "}
              <Link to="/admin/categories" className="font-medium underline">
                Create one first
              </Link>
              .
            </p>
          )}

          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-[#3f463f]">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="h-4 w-4 accent-[#315c43]"
            />
            Show as a featured product on the home page
          </label>
        </div>

        <div className="space-y-5">
          <div>
            <label className={labelClass}>Image URL</label>
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
              className={inputClass("image")}
            />
            {errorText("image")}
          </div>

          <div className="aspect-square overflow-hidden rounded-2xl border border-[#e5e1d7] bg-[#efece3]">
            {form.image.trim() ? (
              <img
                key={form.image}
                src={form.image.trim()}
                alt="Preview"
                onError={(e) => (e.currentTarget.style.display = "none")}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-[#a8a89c]">
                <ImageOff size={32} />
                <span className="text-xs">Image preview</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              to="/admin/products"
              className="flex-1 rounded-xl border border-[#dcd8ce] py-3 text-center text-sm font-medium text-[#3f463f] transition hover:bg-[#f7f5ef]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-[#315c43] py-3 text-sm font-medium text-white transition hover:bg-[#264a35] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminProductForm;