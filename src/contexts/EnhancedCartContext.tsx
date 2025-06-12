'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { cartService } from '@/services/cartService';
import { stockService } from '@/services/stockService';
import { 
  CartDto, 
  CartItemDto, 
  AddToCartRequest, 
  UpdateCartItemRequest 
} from '@/types/Cart';

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
  backendCart: CartDto | null;
  isLoading: boolean;
  isConnectedToBackend: boolean;
  addToCart: (productId: number, variationId?: number, quantity?: number, unitPrice?: number) => Promise<void>;
  removeFromCart: (productId: number, variationId?: number) => Promise<void>;
  updateQuantity: (productId: number, variationId: number | undefined, quantity: number) => Promise<void>;
  toggleItemSelection: (productId: number, variationId?: number) => void;
  selectAllItems: (selected: boolean) => void;
  clearCart: () => Promise<void>;
  getCartItemCount: () => number;
  getCartTotal: () => number;
  getSelectedItemsCount: () => number;
  getSelectedItemsTotal: () => number;
  getSelectedItems: () => LocalCartItem[];
  syncCartToBackend: () => Promise<void>;
  removeSelectedFromCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ecommerce_cart';

interface CartProviderProps {
  children: ReactNode;
}

export const EnhancedCartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<LocalCart>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    selectedItems: 0,
    selectedTotalPrice: 0,
    updatedAt: new Date().toISOString(),
  });
  const [backendCart, setBackendCart] = useState<CartDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectedToBackend, setIsConnectedToBackend] = useState(false);

  // Calculate cart totals
  const calculateCartTotals = (items: LocalCartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return { totalItems, totalPrice };
  };

  // Calculate selected items totals
  const calculateSelectedTotals = (items: LocalCartItem[]) => {
    const selectedItems = items.filter(item => item.selected);
    const selectedItemsCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const selectedTotalPrice = selectedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return { selectedItems: selectedItemsCount, selectedTotalPrice };
  };

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
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load cart from backend for authenticated users
  const loadBackendCart = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      setIsLoading(true);
      // Use JWT-based endpoint to get user's cart items
      const userCartItems = await cartService.getCurrentUserCartItems(0, 100);
      
      if (userCartItems.content.length > 0) {
        // Convert backend cart items to local format
        const backendItems: LocalCartItem[] = userCartItems.content.map((item: CartItemDto) => ({
          productId: item.productId,
          variationId: item.variationId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          addedAt: item.addedAt,
          selected: true, // Default to selected
        }));

        const totals = calculateCartTotals(backendItems);
        const selectedTotals = calculateSelectedTotals(backendItems);

        setCart({
          items: backendItems,
          totalItems: totals.totalItems,
          totalPrice: totals.totalPrice,
          selectedItems: selectedTotals.selectedItems,
          selectedTotalPrice: selectedTotals.selectedTotalPrice,
          updatedAt: new Date().toISOString(),
        });

        setIsConnectedToBackend(true);
      }
    } catch (error) {
      console.error('Error loading backend cart:', error);
      // Fallback to localStorage cart
      setIsConnectedToBackend(false);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  // Sync local cart to backend
  const syncCartToBackend = useCallback(async () => {
    if (!session?.user?.email || cart.items.length === 0) return;

    try {
      // Get or create a cart for the current user using JWT
      const newCart = await cartService.getOrCreateCurrentUserCart();
      setBackendCart(newCart);

      // Add each cart item to backend
      for (const item of cart.items) {
        const addRequest: AddToCartRequest = {
          productId: item.productId,
          variationId: item.variationId,
          quantity: item.quantity,
        };

        await cartService.addItemToCurrentUserCart(addRequest);
      }

      setIsConnectedToBackend(true);
      // Clear localStorage after successful sync
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error syncing cart to backend:', error);
    }
  }, [session?.user?.email, cart.items]);

  // Handle cart synchronization with backend when user logs in/out
  useEffect(() => {
    if (status === 'loading') return;
    
    const handleAuthChange = async () => {
      if (session?.user) {
        // User is logged in - sync cart with backend
        await syncCartToBackend();
        await loadBackendCart();
      } else {
        // User logged out - disconnect from backend
        setBackendCart(null);
        setIsConnectedToBackend(false);
        // Keep localStorage cart for guest users
      }
    };

    handleAuthChange();
  }, [session, status, syncCartToBackend, loadBackendCart]);

  // Save cart to localStorage whenever cart changes (for guest users)
  useEffect(() => {
    if (!isConnectedToBackend && !isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, isConnectedToBackend, isLoading]);

  // Add item to cart
  const addToCart = async (productId: number, variationId?: number, quantity: number = 1, unitPrice: number = 0) => {
    try {
      // Validate stock availability first
      const stockValidation = await stockService.validateProductStockAvailability(productId, quantity);
      if (!stockValidation.available) {
        throw new Error(stockValidation.message || 'Insufficient stock');
      }

      if (isConnectedToBackend && session?.user?.email) {
        // Add to backend cart
        const addRequest: AddToCartRequest = {
          productId,
          variationId,
          quantity,
        };

        await cartService.addItemToCurrentUserCart(addRequest);
        // Reload backend cart
        await loadBackendCart();
      } else {
        // Add to local cart
        const existingItemIndex = cart.items.findIndex(
          item => item.productId === productId && item.variationId === variationId
        );

        let updatedItems: LocalCartItem[];
        if (existingItemIndex >= 0) {
          // Update existing item
          updatedItems = cart.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          const newItem: LocalCartItem = {
            productId,
            variationId,
            quantity,
            unitPrice,
            addedAt: new Date().toISOString(),
            selected: true,
          };
          updatedItems = [...cart.items, newItem];
        }

        const totals = calculateCartTotals(updatedItems);
        const selectedTotals = calculateSelectedTotals(updatedItems);

        setCart({
          items: updatedItems,
          totalItems: totals.totalItems,
          totalPrice: totals.totalPrice,
          selectedItems: selectedTotals.selectedItems,
          selectedTotalPrice: selectedTotals.selectedTotalPrice,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: number, variationId?: number) => {
    try {
      if (isConnectedToBackend && session?.user?.email) {
        // Find the cart item in backend
        const userCartItems = await cartService.getCurrentUserCartItems(0, 100);
        const itemToRemove = userCartItems.content.find(
          item => item.productId === productId && item.variationId === variationId
        );

        if (itemToRemove) {
          await cartService.removeItemFromCurrentUserCart(itemToRemove.id);
          await loadBackendCart();
        }
      } else {
        // Remove from local cart
        const updatedItems = cart.items.filter(
          item => !(item.productId === productId && item.variationId === variationId)
        );

        const totals = calculateCartTotals(updatedItems);
        const selectedTotals = calculateSelectedTotals(updatedItems);

        setCart({
          items: updatedItems,
          totalItems: totals.totalItems,
          totalPrice: totals.totalPrice,
          selectedItems: selectedTotals.selectedItems,
          selectedTotalPrice: selectedTotals.selectedTotalPrice,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: number, variationId: number | undefined, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId, variationId);
      return;
    }

    try {
      // Validate stock availability
      const stockValidation = await stockService.validateProductStockAvailability(productId, quantity);
      if (!stockValidation.available) {
        throw new Error(stockValidation.message || 'Insufficient stock');
      }

      if (isConnectedToBackend && session?.user?.email) {
        // Update in backend cart
        const userCartItems = await cartService.getCurrentUserCartItems(0, 100);
        const itemToUpdate = userCartItems.content.find(
          item => item.productId === productId && item.variationId === variationId
        );

        if (itemToUpdate) {
          const updateRequest: UpdateCartItemRequest = { quantity };
          await cartService.updateCurrentUserCartItem(itemToUpdate.id, updateRequest);
          await loadBackendCart();
        }
      } else {
        // Update local cart
        const updatedItems = cart.items.map(item =>
          item.productId === productId && item.variationId === variationId
            ? { ...item, quantity }
            : item
        );

        const totals = calculateCartTotals(updatedItems);
        const selectedTotals = calculateSelectedTotals(updatedItems);

        setCart({
          items: updatedItems,
          totalItems: totals.totalItems,
          totalPrice: totals.totalPrice,
          selectedItems: selectedTotals.selectedItems,
          selectedTotalPrice: selectedTotals.selectedTotalPrice,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  // Toggle item selection (local only, since backend doesn't store selection state)
  const toggleItemSelection = (productId: number, variationId?: number) => {
    const updatedItems = cart.items.map(item =>
      item.productId === productId && item.variationId === variationId
        ? { ...item, selected: !item.selected }
        : item
    );

    const totals = calculateCartTotals(updatedItems);
    const selectedTotals = calculateSelectedTotals(updatedItems);

    setCart({
      items: updatedItems,
      totalItems: totals.totalItems,
      totalPrice: totals.totalPrice,
      selectedItems: selectedTotals.selectedItems,
      selectedTotalPrice: selectedTotals.selectedTotalPrice,
      updatedAt: new Date().toISOString(),
    });
  };

  // Select/deselect all items
  const selectAllItems = (selected: boolean) => {
    const updatedItems = cart.items.map(item => ({ ...item, selected }));
    const totals = calculateCartTotals(updatedItems);
    const selectedTotals = calculateSelectedTotals(updatedItems);

    setCart({
      items: updatedItems,
      totalItems: totals.totalItems,
      totalPrice: totals.totalPrice,
      selectedItems: selectedTotals.selectedItems,
      selectedTotalPrice: selectedTotals.selectedTotalPrice,
      updatedAt: new Date().toISOString(),
    });
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      if (isConnectedToBackend && session?.user?.email) {
        // Clear backend cart
        await cartService.clearCurrentUserCart();
        setBackendCart(null);
        setIsConnectedToBackend(false);
      }

      // Clear local cart
      setCart({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        selectedItems: 0,
        selectedTotalPrice: 0,
        updatedAt: new Date().toISOString(),
      });

      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  // Remove only selected items from cart (for post-purchase)
  const removeSelectedFromCart = async () => {
    try {
      const selectedItems = cart.items.filter(item => item.selected);
      
      if (isConnectedToBackend && session?.user?.email) {
        // Remove selected items from backend
        const userCartItems = await cartService.getCurrentUserCartItems(0, 100);
        
        for (const localItem of selectedItems) {
          const backendItem = userCartItems.content.find(
            item => item.productId === localItem.productId && item.variationId === localItem.variationId
          );
          
          if (backendItem) {
            await cartService.removeItemFromCurrentUserCart(backendItem.id);
          }
        }
        
        await loadBackendCart();
      } else {
        // Remove selected items from local cart
        const remainingItems = cart.items.filter(item => !item.selected);
        const totals = calculateCartTotals(remainingItems);
        const selectedTotals = calculateSelectedTotals(remainingItems);

        setCart({
          items: remainingItems,
          totalItems: totals.totalItems,
          totalPrice: totals.totalPrice,
          selectedItems: selectedTotals.selectedItems,
          selectedTotalPrice: selectedTotals.selectedTotalPrice,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error removing selected items:', error);
      throw error;
    }
  };

  // Utility functions
  const getCartItemCount = () => cart.totalItems;
  const getCartTotal = () => cart.totalPrice;
  const getSelectedItemsCount = () => cart.selectedItems;
  const getSelectedItemsTotal = () => cart.selectedTotalPrice;
  const getSelectedItems = () => cart.items.filter(item => item.selected);

  const value: CartContextType = {
    cart,
    backendCart,
    isLoading,
    isConnectedToBackend,
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
    syncCartToBackend,
    removeSelectedFromCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

export default EnhancedCartProvider;
