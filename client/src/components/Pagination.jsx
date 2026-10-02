import { ChevronLeft, ChevronRight } from "lucide-react";

const btn =
  "flex items-center gap-1 rounded-full border border-[#d8d3c7] px-4 py-2 text-sm font-medium text-[#315c43] transition hover:bg-[#315c43] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#315c43]";

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className={btn}>
        <ChevronLeft size={16} /> Prev
      </button>
      <span className="text-sm text-[#747970]">
        Page {page} of {pages}
      </span>
      <button onClick={() => onChange(page + 1)} disabled={page >= pages} className={btn}>
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default Pagination;