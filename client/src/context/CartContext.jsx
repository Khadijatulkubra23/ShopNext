import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

const getStoredCart = () => {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(getStoredCart);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product === product._id
            ? { ...i, stock: product.stock, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });
  };

  const updateQuantity = (id, quantity) =>
    setItems((prev) =>
      prev.map((i) =>
        i.product === id ? { ...i, quantity: Math.min(Math.max(quantity, 1), i.stock) } : i
      )
    );

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.product !== id));
  const clearCart = () => setItems([]);
  const getQuantity = (id) => items.find((i) => i.product === id)?.quantity || 0;

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, addItem, updateQuantity, removeItem, clearCart, getQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);