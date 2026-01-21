// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from "../../../Context/AuthContext";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const loadCart = (key) => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error("Failed to parse cart from localStorage", err);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user?.email ? `weldpro-cart-${user.email}` : "weldpro-cart-guest";

  const [cartItems, setCartItems] = useState(() => loadCart(storageKey));

  // When logged-in user changes (login/logout/switch), load that user's cart
  useEffect(() => {
    setCartItems(loadCart(storageKey));
  }, [storageKey]);

  // Save cart to localStorage whenever cartItems or user context changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart to localStorage", err);
    }
  }, [storageKey, cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product?.id) return;
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      const normalizedProduct = {
        ...product,
        image: product.image || product.imageUrl || '',
        quantity: quantity || 1,
      };
      return [...prevItems, normalizedProduct];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);

  const value = {
    // Original properties (for backward compatibility)
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    // Additional properties expected by Checkout.jsx
    items: cartItems, // Alias for cartItems
    subtotal, // Calculated subtotal
    removeItem: removeFromCart // Alias for removeFromCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};