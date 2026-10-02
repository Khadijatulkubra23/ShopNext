import { useState } from "react";
import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { formatPrice } from "../utils/format";

function ProductCard({ product }) {
  const [broken, setBroken] = useState(false);
  const outOfStock = product.stock === 0;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-[#e5e1d7] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-[#efece3]">
        {product.image && !broken ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#a8a89c]">
            <ImageOff size={32} />
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-red-600">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[#747970]">
          {product.category?.name || "Uncategorized"}
        </p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-[#24352b]">{product.name}</h3>
        <p className="mt-auto pt-3 text-lg font-bold text-[#315c43]">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

export default ProductCard;