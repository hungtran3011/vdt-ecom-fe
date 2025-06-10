import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { OrderStatus } from '@/types/Order';

interface NotificationData {
  id: string;
  type: 'order_status_change' | 'order_created' | 'payment_success' | 'payment_failed';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, unknown>;
}

interface UseRealTimeNotificationsOptions {
  enabled?: boolean;
  pollInterval?: number; // in milliseconds
  maxNotifications?: number;
}

export function useRealTimeNotifications(options: UseRealTimeNotificationsOptions = {}) {
  const {
    enabled = true,
    pollInterval = 30000, // 30 seconds
    maxNotifications = 50
  } = options;

  const { data: session } = useSession();
  
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  
  const previousOrdersRef = useRef<Map<string, OrderStatus>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create notification
  const createNotification = useCallback((
    type: NotificationData['type'],
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): NotificationData => {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      data
    };
  }, []);

  // Add notification
  const addNotification = useCallback((notification: NotificationData) => {
    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, maxNotifications);
      return updated;
    });
    setUnreadCount(prev => prev + 1);
  }, [maxNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      const updated = prev.filter(n => n.id !== id);
      
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      
      return updated;
    });
  }, []);

  // Check for order updates
  const checkForUpdates = useCallback(async () => {
    if (!session?.user?.email || !enabled) return;

    try {
      // Get user's recent orders
      const { OrderService } = await import('@/services/orderService');
      const orderService = new OrderService();
      const orders = await orderService.getUserOrders();
      const currentTime = new Date();
      
      orders.forEach(order => {
        const previousStatus = previousOrdersRef.current.get(order.id);
        
        // If this is a new order we haven't seen before
        if (!previousStatus) {
          previousOrdersRef.current.set(order.id, order.status);
          
          // Only create notification for newly created orders (not on first load)
          if (currentTime.getTime() - lastChecked.getTime() < pollInterval * 2) {
            const notification = createNotification(
              'order_created',
              'Đơn hàng mới được tạo',
              `Đơn hàng #${order.id} đã được tạo thành công`,
              { orderId: order.id }
            );
            addNotification(notification);
          }
          return;
        }

        // If status has changed
        if (previousStatus !== order.status) {
          previousOrdersRef.current.set(order.id, order.status);
          
          let title = '';
          let message = '';
          let type: NotificationData['type'] = 'order_status_change';

          switch (order.status) {
            case OrderStatus.PAID:
              title = 'Thanh toán thành công';
              message = `Đơn hàng #${order.id} đã được thanh toán`;
              type = 'payment_success';
              break;
            case OrderStatus.CONFIRMED:
              title = 'Đơn hàng đã xác nhận';
              message = `Đơn hàng #${order.id} đã được xác nhận và đang chuẩn bị`;
              break;
            case OrderStatus.PROCESSING:
              title = 'Đang xử lý đơn hàng';
              message = `Đơn hàng #${order.id} đang được xử lý`;
              break;
            case OrderStatus.SHIPPED:
              title = 'Đơn hàng đã giao vận';
              message = `Đơn hàng #${order.id} đã được giao cho đơn vị vận chuyển`;
              break;
            case OrderStatus.DELIVERED:
              title = 'Đơn hàng đã giao';
              message = `Đơn hàng #${order.id} đã được giao thành công`;
              break;
            case OrderStatus.CANCELLED:
              title = 'Đơn hàng đã hủy';
              message = `Đơn hàng #${order.id} đã bị hủy`;
              break;
            case OrderStatus.PAYMENT_FAILED:
              title = 'Thanh toán thất bại';
              message = `Thanh toán cho đơn hàng #${order.id} đã thất bại`;
              type = 'payment_failed';
              break;
            default:
              title = 'Cập nhật đơn hàng';
              message = `Trạng thái đơn hàng #${order.id} đã được cập nhật`;
          }

          if (title && message) {
            const notification = createNotification(
              type,
              title,
              message,
              { orderId: order.id, status: order.status, previousStatus }
            );
            addNotification(notification);
          }
        }
      });

      setLastChecked(currentTime);
    } catch (error) {
      console.error('Error checking for order updates:', error);
    }
  }, [session, enabled, lastChecked, pollInterval, createNotification, addNotification]);

  // Start/stop polling
  useEffect(() => {
    if (!enabled || !session?.user?.email) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial check
    checkForUpdates();

    // Start polling
    intervalRef.current = setInterval(checkForUpdates, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, session, pollInterval, checkForUpdates]);

  // Browser notification permission and display
  const showBrowserNotification = useCallback((notification: NotificationData) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192x192.png', // Add your app icon
        badge: '/icons/icon-96x96.png',
        tag: notification.id,
        requireInteraction: false,
        silent: false
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);

      // Handle click
      browserNotification.onclick = () => {
        window.focus();
        if (notification.data?.orderId) {
          // Navigate to order details
          window.location.href = `/orders/${notification.data.orderId}`;
        }
        browserNotification.close();
      };
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }, []);

  // Auto-show browser notifications for new notifications
  useEffect(() => {
    const latestNotification = notifications[0];
    if (latestNotification && !latestNotification.read) {
      showBrowserNotification(latestNotification);
    }
  }, [notifications, showBrowserNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
    requestNotificationPermission,
    isPolling: !!intervalRef.current,
    lastChecked
  };
}
