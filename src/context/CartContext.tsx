import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types.ts';

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, size?: string, openDrawer?: boolean) => void;
  updateQuantity: (productId: string, color: string, size: string, newQty: number) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  setDeliveryCharge: (charge: number) => void;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'arabian_saaj_cart_v1';
const MAX_CART_QUANTITY = 5;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(70); // default Inside Dhaka ৳70

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [items]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    color?: string,
    size?: string,
    openDrawer: boolean = false
  ) => {
    const requestedQuantity = Math.max(1, Math.min(MAX_CART_QUANTITY, quantity));
    const chosenColor = color || (product.colors && product.colors[0]) || 'Classic';
    const chosenSize = size || (product.sizes && product.sizes[0]) || 'Standard';

    setItems(prev => {
      const existingIndex = prev.findIndex(
        item =>
          (item.product._id === product._id || item.product.id === product._id) &&
          item.selectedColor === chosenColor &&
          item.selectedSize === chosenSize
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(MAX_CART_QUANTITY, next[existingIndex].quantity + requestedQuantity)
        };
        return next;
      }

      return [
        ...prev,
        {
          product,
          quantity: requestedQuantity,
          selectedColor: chosenColor,
          selectedSize: chosenSize
        }
      ];
    });

    if (openDrawer) {
      setIsCartOpen(true);
    } else {
      setIsCartOpen(false);
    }
  };

  const updateQuantity = (productId: string, color: string, size: string, newQty: number) => {
    const boundedQuantity = Math.max(1, Math.min(MAX_CART_QUANTITY, newQty));

    setItems(prev =>
      prev.map(item => {
        if (
          (item.product._id === productId || item.product.id === productId) &&
          item.selectedColor === color &&
          item.selectedSize === size
        ) {
          return { ...item, quantity: boundedQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, color: string, size: string) => {
    setItems(prev =>
      prev.filter(
        item =>
          !(
            (item.product._id === productId || item.product.id === productId) &&
            item.selectedColor === color &&
            item.selectedSize === size
          )
      )
    );
    showToast('Item removed from cart', undefined, 'info');
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.product.discountPrice !== undefined && item.product.discountPrice > 0
      ? item.product.discountPrice
      : item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const total = subtotal + (items.length > 0 ? deliveryCharge : 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        itemCount,
        subtotal,
        deliveryCharge,
        setDeliveryCharge,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
