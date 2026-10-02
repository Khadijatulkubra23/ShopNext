import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";
import { formatDate } from "../utils/format";

const PER_PAGE = 10;

function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const [updatingId, setUpdatingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/users")
      .then(({ data }) => setUsers(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load users"))
      .finally(() => setLoading(false));
  }, [reload]);

  const changeRole = async (u, role) => {
    setUpdatingId(u._id);
    try {
      const { data } = await api.put(`/users/${u._id}/role`, { role });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, role: data.user.role } : x)));
      toast.success(`${u.name} is now ${role === "admin" ? "an admin" : "a regular user"}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/users/${toDelete._id}`);
      setUsers((prev) => prev.filter((x) => x._id !== toDelete._id));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete user");
    } finally {
      setToDelete(null);
      setDeleting(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = users.filter(
    (u) =>
      (!roleFilter || u.role === roleFilter) &&
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#315c43]">Users</h1>
        <p className="mt-1 text-sm text-[#747970]">
          {users.length} total, {adminCount} admin{adminCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#747970]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-[#dcd8ce] bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#315c43]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-[#dcd8ce] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#315c43]"
        >
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
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
            <p className="font-semibold text-[#24352b]">No users found</p>
            <p className="mt-1 text-sm text-[#747970]">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-[#e5e1d7] bg-[#f7f5ef] text-xs uppercase tracking-wide text-[#747970]">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 text-right font-semibold">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e1d7]">
                {visible.map((u) => {
                  const isMe = u._id === me.id;
                  return (
                    <tr key={u._id} className="transition hover:bg-[#f7f5ef]/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#315c43] text-sm font-bold text-white">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[#24352b]">
                              {u.name}
                              {isMe && (
                                <span className="ml-2 rounded-full bg-[#315c43]/10 px-2 py-0.5 text-xs font-semibold text-[#315c43]">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-[#747970]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={u.role}
                          disabled={isMe || updatingId === u._id}
                          onChange={(e) => changeRole(u, e.target.value)}
                          className="rounded-full border border-[#dcd8ce] bg-white px-3 py-1.5 text-xs font-medium capitalize outline-none transition focus:border-[#315c43] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-3 text-[#747970]">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setToDelete(u)}
                          disabled={isMe}
                          className="rounded-full p-2 text-[#747970] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#747970]"
                          aria-label="Delete user"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={current} pages={pages} onChange={setPage} />

      {toDelete && (
        <ConfirmDialog
          title="Delete user?"
          message={`${toDelete.name} (${toDelete.email}) will be permanently removed. Users with orders can't be deleted.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

export default AdminUsers;