import { ImageOff, X } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatDate, formatPrice, paymentLabel, shortId } from "../utils/format";

function OrderModal({ order, onClose }) {
  const { shippingAddress: a } = order;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#315c43]">Order {shortId(order._id)}</h2>
            <p className="mt-1 text-sm text-[#747970]">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.orderStatus} />
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#747970] hover:bg-[#f7f5ef]"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f7f5ef] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#747970]">Customer</p>
            <p className="mt-2 font-medium text-[#24352b]">{order.user?.name || "Deleted user"}</p>
            <p className="text-[#747970]">{order.user?.email}</p>
          </div>
          <div className="rounded-2xl bg-[#f7f5ef] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#747970]">Ship to</p>
            <p className="mt-2 font-medium text-[#24352b]">{a.fullName}</p>
            <p className="text-[#3f463f]">
              {a.address}, {a.city} {a.postalCode}
            </p>
            <p className="text-[#747970]">{a.phone}</p>
          </div>
          <div className="rounded-2xl bg-[#f7f5ef] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#747970]">Payment</p>
            <p className="mt-2 text-[#3f463f]">{paymentLabel(order.paymentMethod)}</p>
            <div className="mt-2">
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>
        </div>

        <div className="mt-6 divide-y divide-[#e5e1d7]">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#efece3]">
                {item.product?.image ? (
                  <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#a8a89c]">
                    <ImageOff size={18} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#24352b]">{item.name}</p>
                <p className="text-sm text-[#747970]">
                  {formatPrice(item.price)} x {item.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 flex justify-between border-t border-[#e5e1d7] pt-4 text-base font-bold">
          <span>Total</span>
          <span className="text-[#315c43]">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}

export default OrderModal;