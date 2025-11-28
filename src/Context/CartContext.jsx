import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const storageKey = "cartItems";

const readInitialCart = () => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Failed to parse cart items", err);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => readInitialCart());

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    if (!product?.id) return;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min((item.quantity || 1) + quantity, product.stock || 999) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          quantity: quantity || 1,
          imageUrl: product.imageUrl || product.image || "",
          stock: product.stock ?? 0,
          category: product.category,
        },
      ];
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, item.stock || 999)),
            }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((count, item) => count + (item.quantity || 0), 0),
    [items]
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

