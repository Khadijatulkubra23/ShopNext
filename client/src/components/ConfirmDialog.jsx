import { AlertTriangle } from "lucide-react";

function ConfirmDialog({ title, message, confirmLabel = "Delete", loading, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-6"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={22} />
        </div>
        <h3 className="mt-4 text-center text-lg font-bold text-[#24352b]">{title}</h3>
        <p className="mt-2 text-center text-sm text-[#747970]">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-[#dcd8ce] py-2.5 text-sm font-medium text-[#3f463f] transition hover:bg-[#f7f5ef]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;