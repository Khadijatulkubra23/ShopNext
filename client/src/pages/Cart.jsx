import { Link } from "react-router-dom";
import { ImageOff, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

function Cart() {
  const { items, count, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="px-6 py-24 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#315c43]/10 text-[#315c43]">
          <ShoppingBag size={36} />
        </div>
        <h1 className="text-2xl font-bold text-[#24352b]">Your cart is empty</h1>
        <p className="mt-2 text-sm text-[#747970]">Looks like you haven't added anything yet.</p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-full bg-[#315c43] px-8 py-3 text-sm font-medium text-white hover:bg-[#264a35]"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  const handleRemove = (item) => {
    removeItem(item.product);
    toast.success(`${item.name} removed`);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#315c43]">Your Cart</h1>
          <p className="mt-1 text-sm text-[#747970]">
            {count} item{count === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm font-medium text-[#747970] hover:text-red-600"
        >
          Clear cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.product}
              className="flex gap-4 rounded-3xl border border-[#e5e1d7] bg-white p-4 shadow-sm"
            >
              <Link
                to={`/products/${item.product}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#efece3] sm:h-28 sm:w-28"
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#a8a89c]">
                    <ImageOff size={24} />
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/products/${item.product}`}
                      className="line-clamp-2 font-semibold text-[#24352b] hover:text-[#315c43]"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-[#747970]">{formatPrice(item.price)} each</p>
                  </div>
                  <button
                    onClick={() => handleRemove(item)}
                    className="rounded-full p-2 text-[#747970] transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-xl border border-[#dcd8ce]">
                    <button
                      onClick={() => updateQuantity(item.product, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-2 text-[#315c43] disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-2 text-[#315c43] disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="font-bold text-[#315c43]">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-3xl border border-[#e5e1d7] bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-[#24352b]">Order Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-[#747970]">
              <span>Items ({count})</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between border-t border-[#e5e1d7] pt-3 text-base font-bold text-[#24352b]">
              <span>Total</span>
              <span className="text-[#315c43]">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block rounded-xl bg-[#315c43] py-3 text-center font-medium text-white transition hover:bg-[#264a35]"
          >
            Proceed to Checkout
          </Link>
          <Link
            to="/products"
            className="mt-3 block text-center text-sm font-medium text-[#315c43] hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;