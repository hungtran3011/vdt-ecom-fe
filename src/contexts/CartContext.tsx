'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface LocalCartItem {
  productId: number;
  variationId?: number;
  quantity: number;
  unitPrice: number;
  addedAt: string;
}

interface LocalCart {
  items: LocalCartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: string;
}

interface CartContextType {
  cart: LocalCart;
  isLoading: boolean;
  addToCart: (productId: number, variationId?: number, quantity?: number, unitPrice?: number) => void;
  removeFromCart: (productId: number, variationId?: number) => void;
  updateQuantity: (productId: number, variationId: number | undefined, quantity: number) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ecommerce_cart';

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { status } = useSession();
  const [cart, setCart] = useState<LocalCart>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    updatedAt: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on component mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart: LocalCart = JSON.parse(storedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // If there's an error parsing, clear the corrupted data
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear cart when user logs out
  useEffect(() => {
    if (status === 'loading') return;
    
    // If user was logged in but now is not (logout)
    if (status === 'unauthenticated') {
      clearCart();
    }
  }, [status]);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, isLoading]);

  const calculateCartTotals = (items: LocalCartItem[]): { totalItems: number; totalPrice: number } => {
    return items.reduce(
      (totals, item) => ({
        totalItems: totals.totalItems + item.quantity,
        totalPrice: totals.totalPrice + (item.unitPrice * item.quantity),
      }),
      { totalItems: 0, totalPrice: 0 }
    );
  };

  const addToCart = (productId: number, variationId?: number, quantity: number = 1, unitPrice: number = 0) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.productId === productId && item.variationId === variationId
      );

      let newItems: LocalCartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item
        const newItem: LocalCartItem = {
          productId,
          variationId,
          quantity,
          unitPrice,
          addedAt: new Date().toISOString(),
        };
        newItems = [...prevCart.items, newItem];
      }

      const totals = calculateCartTotals(newItems);

      return {
        items: newItems,
        totalItems: totals.totalItems,
        totalPrice: totals.totalPrice,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const removeFromCart = (productId: number, variationId?: number) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(
        item => !(item.productId === productId && item.variationId === variationId)
      );

      const totals = calculateCartTotals(newItems);

      return {
        items: newItems,
        totalItems: totals.totalItems,
        totalPrice: totals.totalPrice,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const updateQuantity = (productId: number, variationId: number | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variationId);
      return;
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item => {
        if (item.productId === productId && item.variationId === variationId) {
          return { ...item, quantity };
        }
        return item;
      });

      const totals = calculateCartTotals(newItems);

      return {
        items: newItems,
        totalItems: totals.totalItems,
        totalPrice: totals.totalPrice,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const clearCart = () => {
    const emptyCart: LocalCart = {
      items: [],
      totalItems: 0,
      totalPrice: 0,
      updatedAt: new Date().toISOString(),
    };
    setCart(emptyCart);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const getCartItemCount = () => cart.totalItems;

  const getCartTotal = () => cart.totalPrice;

  const contextValue: CartContextType = {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
