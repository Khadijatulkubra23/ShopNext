export const formatPrice = (value) => `$${Number(value).toFixed(2)}`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const shortId = (id) => `#${id.slice(-6).toUpperCase()}`;

export const paymentLabel = (method) =>
  method === "mock" ? "Online payment (demo)" : "Cash on Delivery";
export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  for (const [name, size] of [["day", 86400], ["hour", 3600], ["minute", 60]]) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${name}${n === 1 ? "" : "s"} ago`;
  }
};