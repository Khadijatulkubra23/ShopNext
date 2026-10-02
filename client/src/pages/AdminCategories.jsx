import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatDate } from "../utils/format";

const card = "rounded-3xl border border-[#e5e1d7] bg-white shadow-sm";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () =>
    api
      .get("/categories")
      .then(({ data }) => setCategories(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load categories"))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setEditingId(null);
    setNameError("");
  };

  const startEdit = (c) => {
    setForm({ name: c.name, description: c.description || "" });
    setEditingId(c._id);
    setNameError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return setNameError("Name must be at least 2 characters");

    const payload = { name: form.name.trim(), description: form.description.trim() };

    setSaving(true);
    try {
      if (editingId) await api.put(`/categories/${editingId}`, payload);
      else await api.post("/categories", payload);
      toast.success(editingId ? "Category updated" : "Category created");
      resetForm();
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/categories/${toDelete._id}`);
      toast.success("Category deleted");
      if (editingId === toDelete._id) resetForm();
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete category");
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#315c43]">Categories</h1>
        <p className="mt-1 text-sm text-[#747970]">{categories.length} total</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className={`${card} p-6`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#24352b]">{editingId ? "Edit Category" : "Add Category"}</h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1 text-sm font-medium text-[#747970] hover:text-[#315c43]"
            >
              <X size={16} /> Cancel edit
            </button>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#3f463f]">Name</label>
            <input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setNameError("");
              }}
              placeholder="e.g. Home Decor"
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#315c43] ${
                nameError ? "border-red-400" : "border-[#dcd8ce]"
              }`}
            />
            {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#3f463f]">Description (optional)</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="A short description"
              className="w-full rounded-xl border border-[#dcd8ce] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#315c43]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 rounded-xl bg-[#315c43] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#264a35] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : editingId ? "Save Changes" : "Add Category"}
        </button>
      </form>

      <div className={`${card} overflow-hidden`}>
        {error ? (
          <p className="p-10 text-center text-red-600">{error}</p>
        ) : loading ? (
          <div className="animate-pulse space-y-px">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-[#f7f5ef]" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-[#24352b]">No categories yet</p>
            <p className="mt-1 text-sm text-[#747970]">Add your first one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-[#e5e1d7] bg-[#f7f5ef] text-xs uppercase tracking-wide text-[#747970]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Description</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e1d7]">
                {categories.map((c) => (
                  <tr key={c._id} className="transition hover:bg-[#f7f5ef]/60">
                    <td className="px-5 py-3 font-medium text-[#24352b]">{c.name}</td>
                    <td className="max-w-xs truncate px-5 py-3 text-[#747970]">{c.description || "-"}</td>
                    <td className="px-5 py-3 text-[#747970]">{formatDate(c.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => startEdit(c)}
                          className="rounded-full p-2 text-[#747970] transition hover:bg-[#315c43]/10 hover:text-[#315c43]"
                          aria-label="Edit"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          onClick={() => setToDelete(c)}
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

      {toDelete && (
        <ConfirmDialog
          title="Delete category?"
          message={`"${toDelete.name}" will be removed. This only works if no products use it.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

export default AdminCategories;