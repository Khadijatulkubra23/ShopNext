const styles = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-[#e9efe4] text-[#4f6b3a]",
  shipped: "bg-teal-100 text-teal-700",
  delivered: "bg-[#315c43] text-white",
  cancelled: "bg-red-100 text-red-600",
  paid: "bg-[#e1efe6] text-[#315c43]",
  failed: "bg-red-100 text-red-600",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;