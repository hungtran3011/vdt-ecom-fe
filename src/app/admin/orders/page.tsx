import OrdersManagement from '@/components/admin/OrdersManagement';

export default function AdminOrdersPage() {
  return <OrdersManagement showAnalytics={true} />;
}

// interface OrderItem {
//   id: string;
//   productId: string;
//   productName: string;
//   quantity: number;
//   price: number;
// }

// interface Order {
//   id: string;
//   userId: string;
//   userName: string;
//   userEmail: string;
//   status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
//   totalAmount: number;
//   items: OrderItem[];
//   shippingAddress: string;
//   createdAt: string;
//   updatedAt: string;
// }

// const statusColors = {
//   PENDING: 'bg-yellow-100 text-yellow-800',
//   PROCESSING: 'bg-blue-100 text-blue-800',
//   SHIPPED: 'bg-purple-100 text-purple-800',
//   DELIVERED: 'bg-green-100 text-green-800',
//   CANCELLED: 'bg-red-100 text-red-800',
// };

// export default function AdminOrdersPage() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await api.get('/v1/orders');
//       setOrders(response.data);
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//       setError('Failed to fetch orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
//     try {
//       await api.patch(`/v1/orders/${orderId}`, { status: newStatus });
//       setOrders(orders.map(order => 
//         order.id === orderId ? { ...order, status: newStatus } : order
//       ));
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       alert('Failed to update order status');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <div className="text-red-600 mb-4">{error}</div>
//         <button 
//           onClick={fetchOrders}
//           className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders Management</h2>

//       <div className="bg-white shadow overflow-hidden sm:rounded-md">
//         {orders.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-gray-500 text-lg">No orders found</p>
//           </div>
//         ) : (
//           <ul className="divide-y divide-gray-200">
//             {orders.map((order) => (
//               <li key={order.id}>
//                 <div className="px-4 py-4 sm:px-6">
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="text-sm font-medium text-gray-900">
//                             Order #{order.id}
//                           </p>
//                           <p className="text-sm text-gray-500">
//                             Customer: {order.userName} ({order.userEmail})
//                           </p>
//                           <p className="text-sm text-gray-500">
//                             Total: ${order.totalAmount.toFixed(2)}
//                           </p>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
//                             {order.status}
//                           </span>
//                         </div>
//                       </div>
                      
//                       {/* Order Items */}
//                       <div className="mt-2">
//                         <p className="text-xs text-gray-500 mb-1">Items:</p>
//                         <div className="space-y-1">
//                           {order.items.map((item) => (
//                             <div key={item.id} className="text-xs text-gray-600">
//                               {item.productName} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Status Update Dropdown */}
//                       <div className="mt-3">
//                         <label className="text-xs text-gray-500">Update Status:</label>
//                         <select
//                           value={order.status}
//                           onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
//                           className="ml-2 text-xs border border-gray-300 rounded px-2 py-1"
//                         >
//                           <option value="PENDING">Pending</option>
//                           <option value="PROCESSING">Processing</option>
//                           <option value="SHIPPED">Shipped</option>
//                           <option value="DELIVERED">Delivered</option>
//                           <option value="CANCELLED">Cancelled</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="mt-2">
//                     <p className="text-xs text-gray-500">
//                       Shipping Address: {order.shippingAddress}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       Created: {new Date(order.createdAt).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }
