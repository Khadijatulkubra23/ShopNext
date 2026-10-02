import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ImageOff, Minus, Plus, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

function ProductDetails() {
  const { id } = useParams();
  const { addItem, getQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    setQuantity(1);
    setBroken(false);

    api
      .get(`/products/${id}`)
      .then(({ data }) => !ignore && setProduct(data))
      .catch((err) => !ignore && setError(err.response?.data?.message || "Could not load product"))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto grid max-w-6xl animate-pulse gap-10 px-6 py-10 md:grid-cols-2">
        <div className="aspect-square rounded-3xl bg-[#efece3]" />
        <div className="space-y-4 py-4">
          <div className="h-4 w-1/4 rounded bg-[#efece3]" />
          <div className="h-8 w-3/4 rounded bg-[#efece3]" />
          <div className="h-6 w-1/4 rounded bg-[#efece3]" />
          <div className="h-24 rounded bg-[#efece3]" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-lg font-semibold text-[#24352b]">{error || "Product not found"}</p>
        <Link
          to="/products"
          className="mt-5 inline-block rounded-full bg-[#315c43] px-6 py-2 text-sm font-medium text-white hover:bg-[#264a35]"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const inCart = getQuantity(product._id);
  const available = product.stock - inCart;
  const outOfStock = product.stock === 0;

  const handleAdd = () => {
    if (quantity > available) {
      toast.error("You've reached the available stock");
      return;
    }
    addItem(product, quantity);
    toast.success("Added to cart");
    setQuantity(1);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        to="/products"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#747970] hover:text-[#315c43]"
      >
        <ArrowLeft size={16} /> Back to shop
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-3xl border border-[#e5e1d7] bg-[#efece3]">
          {product.image && !broken ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setBroken(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#a8a89c]">
              <ImageOff size={48} />
            </div>
          )}
        </div>

        <div className="py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#747970]">
            {product.category?.name || "Uncategorized"}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#24352b]">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-[#315c43]">{formatPrice(product.price)}</p>

          <p
            className={`mt-3 text-sm font-medium ${
              outOfStock ? "text-red-600" : product.stock <= 5 ? "text-amber-600" : "text-[#315c43]"
            }`}
          >
            {outOfStock
              ? "Out of stock"
              : product.stock <= 5
              ? `Only ${product.stock} left`
              : "In stock"}
          </p>

          <p className="mt-6 whitespace-pre-line leading-relaxed text-[#3f463f]">
            {product.description}
          </p>

          <div className="mt-8 border-t border-[#e5e1d7] pt-8">
            {outOfStock ? (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-[#315c43] py-3 font-medium text-white opacity-50"
              >
                Out of stock
              </button>
            ) : available <= 0 ? (
              <div>
                <p className="text-sm text-[#747970]">
                  All available stock ({product.stock}) is already in your cart.
                </p>
                <Link
                  to="/cart"
                  className="mt-3 block rounded-xl bg-[#315c43] py-3 text-center font-medium text-white hover:bg-[#264a35]"
                >
                  View cart
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex items-center justify-between rounded-xl border border-[#dcd8ce] bg-white px-2 sm:w-36">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="rounded-lg p-3 text-[#315c43] disabled:opacity-30"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(available, q + 1))}
                    disabled={quantity >= available}
                    className="rounded-lg p-3 text-[#315c43] disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#315c43] py-3 font-medium text-white transition hover:bg-[#264a35]"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;