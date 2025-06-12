'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { cartService } from '@/services/cartService';
import { stockService } from '@/services/stockService';
import { CartDto } from '@/types/Cart';

interface LocalCartItem {
  productId: number;
  variationId?: number;
  quantity: number;
  unitPrice: number;
  addedAt: string;
  selected: boolean;
}

interface LocalCart {
  items: LocalCartItem[];
  totalItems: number;
  totalPrice: number;
  selectedItems: number;
  selectedTotalPrice: number;
  updatedAt: string;
}

interface CartContextType {
  cart: LocalCart;
  isLoading: boolean;
  addToCart: (productId: number, variationId?: number, quantity?: number, unitPrice?: number) => void;
  removeFromCart: (productId: number, variationId?: number) => void;
  updateQuantity: (productId: number, variationId: number | undefined, quantity: number) => void;
  toggleItemSelection: (productId: number, variationId?: number) => void;
  selectAllItems: (selected: boolean) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  getCartTotal: () => number;
  getSelectedItemsCount: () => number;
  getSelectedItemsTotal: () => number;
  getSelectedItems: () => LocalCartItem[];
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
    selectedItems: 0,
    selectedTotalPrice: 0,
    updatedAt: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on component mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart: LocalCart = JSON.parse(storedCart);
        // Ensure backward compatibility - set selected to true for existing items
        const updatedItems = parsedCart.items.map(item => ({
          ...item,
          selected: item.selected !== undefined ? item.selected : true
        }));
        const totals = calculateCartTotals(updatedItems);
        const selectedTotals = calculateSelectedTotals(updatedItems);
        setCart({
          ...parsedCart,
          items: updatedItems,
          totalItems: totals.totalItems,
          totalPrice: totals.totalPrice,
          selectedItems: selectedTotals.selectedItems,
          selectedTotalPrice: selectedTotals.selectedTotalPrice,
        });
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

  const calculateSelectedTotals = (items: LocalCartItem[]): { selectedItems: number; selectedTotalPrice: number } => {
    return items
      .filter(item => item.selected)
      .reduce(
        (totals, item) => ({
          selectedItems: totals.selectedItems + item.quantity,
          selectedTotalPrice: totals.selectedTotalPrice + (item.unitPrice * item.quantity),
        }),
        { selectedItems: 0, selectedTotalPrice: 0 }
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
        // Add new item (selected by default)
        const newItem: LocalCartItem = {
          productId,
          variationId,
          quantity,
          unitPrice,
          addedAt: new Date().toISOString(),
          selected: true,
        };
        newItems = [...prevCart.items, newItem];
      }

      const totals = calculateCartTotals(newItems);
      const selectedTotals = calculateSelectedTotals(newItems);

      return {
        items: newItems,
        totalItems: totals.totalItems,
        totalPrice: totals.totalPrice,
        selectedItems: selectedTotals.selectedItems,
        selectedTotalPrice: selectedTotals.selectedTotalPrice,
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
      const selectedTotals = calculateSelectedTotals(newItems);

      return {
        items: newItems,
        totalItems: totals.totalItems,
        totalPrice: totals.totalPrice,
        selectedItems: selectedTotals.selectedItems,
        selectedTotalPrice: selectedTotals.selectedTotalPrice,
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
      const selectedTotals = calculateSelectedTotals(newItems);

      return {
        items: newItems,
        totalItems: totals.totalItems,
        totalPrice: totals.totalPrice,
        selectedItems: selectedTotals.selectedItems,
        selectedTotalPrice: selectedTotals.selectedTotalPrice,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const toggleItemSelection = (productId: number, variationId?: number) => {
    setCart(prevCart => {
      const newItems = prevCart.items.map(item => {
        if (item.productId === productId && item.variationId === variationId) {
          return { ...item, selected: !item.selected };
        }
        return item;
      });

      const totals = calculateCartTotals(newItems);
      const selectedTotals = calculateSelectedTotals(newItems);

      return {
        items: newItems,
        totalItems: totals.totalItems,
        totalPrice: totals.totalPrice,
        selectedItems: selectedTotals.selectedItems,
        selectedTotalPrice: selectedTotals.selectedTotalPrice,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const selectAllItems = (selected: boolean) => {
    setCart(prevCart => {
      const newItems = prevCart.items.map(item => ({
        ...item,
        selected,
      }));

      const totals = calculateCartTotals(newItems);
      const selectedTotals = calculateSelectedTotals(newItems);

      return {
        items: newItems,
        totalItems: totals.totalItems,
        totalPrice: totals.totalPrice,
        selectedItems: selectedTotals.selectedItems,
        selectedTotalPrice: selectedTotals.selectedTotalPrice,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const clearCart = () => {
    const emptyCart: LocalCart = {
      items: [],
      totalItems: 0,
      totalPrice: 0,
      selectedItems: 0,
      selectedTotalPrice: 0,
      updatedAt: new Date().toISOString(),
    };
    setCart(emptyCart);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const getCartItemCount = () => cart.totalItems;
  const getCartTotal = () => cart.totalPrice;
  const getSelectedItemsCount = () => cart.selectedItems;
  const getSelectedItemsTotal = () => cart.selectedTotalPrice;
  const getSelectedItems = () => cart.items.filter(item => item.selected);

  const contextValue: CartContextType = {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleItemSelection,
    selectAllItems,
    clearCart,
    getCartItemCount,
    getCartTotal,
    getSelectedItemsCount,
    getSelectedItemsTotal,
    getSelectedItems,
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
