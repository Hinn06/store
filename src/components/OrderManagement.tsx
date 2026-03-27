import React, { useState } from 'react';
import { Search, Filter, Eye, ShoppingCart, Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Trash2, Minus } from 'lucide-react';
import { Order, Product, Customer } from '../types';
import { formatCurrency, formatDate, cn } from '../utils';

interface OrderManagementProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  onAddOrder: (order: Omit<Order, 'id' | 'storeId'> & { customerPhone?: string }) => void;
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onDeleteOrder: (id: string) => void;
  permission: 'view' | 'manage' | 'none';
}

export default function OrderManagement({ orders, products, customers, onAddOrder, onUpdateStatus, onDeleteOrder, permission }: OrderManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<{ start: string, end: string }>({ start: '', end: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // New Order State
  const [newOrderItems, setNewOrderItems] = useState<{ productId: string, quantity: number }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter.start || dateFilter.end) {
      const orderDate = new Date(o.createdAt);
      if (dateFilter.start) {
        const start = new Date(dateFilter.start);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) matchesDate = false;
      }
      if (dateFilter.end) {
        const end = new Date(dateFilter.end);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) matchesDate = false;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  const filteredProductsForOrder = products.filter(p => 
    (p.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleAddProductToOrder = (productId: string) => {
    const existing = newOrderItems.find(item => item.productId === productId);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (existing) {
      if (existing.quantity >= product.stock) return;
      setNewOrderItems(newOrderItems.map(item => 
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setNewOrderItems([...newOrderItems, { productId, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setNewOrderItems(newOrderItems.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        if (newQty > product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleRemoveFromOrder = (productId: string) => {
    setNewOrderItems(newOrderItems.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return newOrderItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleCreateOrder = () => {
    if (newOrderItems.length === 0) return;
    if (!isNewCustomer && !selectedCustomerId) return;
    if (isNewCustomer && !newCustomerName) return;

    let customerName = '';
    let customerId = selectedCustomerId;

    if (isNewCustomer) {
      customerName = newCustomerName;
      customerId = 'new'; // Special ID to indicate new customer creation
    } else {
      const customer = customers.find(c => c.id === selectedCustomerId);
      customerName = customer?.name || 'Khách lẻ';
    }

    const orderItems = newOrderItems.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        costPrice: product.costPrice
      };
    });

    onAddOrder({
      customerId: customerId,
      customerName: customerName,
      customerPhone: isNewCustomer ? newCustomerPhone : undefined, // Pass phone for new customer
      items: orderItems,
      totalAmount: calculateTotal(),
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    setIsModalOpen(false);
    setNewOrderItems([]);
    setSelectedCustomerId('');
    setIsNewCustomer(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'pending': return <Clock size={16} className="text-amber-500" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Chờ xử lý';
      case 'cancelled': return 'Đã hủy';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Quản lý đơn hàng</h1>
          <p className="text-sm text-zinc-500">Theo dõi và quản lý các giao dịch bán hàng.</p>
        </div>
        {permission === 'manage' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            Tạo đơn hàng mới
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm mã đơn, khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors",
              (dateFilter.start || dateFilter.end) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <Calendar size={18} />
            {dateFilter.start || dateFilter.end ? 'Đã lọc thời gian' : 'Thời gian'}
          </button>
          
          {isDateFilterOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-zinc-100 p-4 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Từ ngày</label>
                  <input 
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Đến ngày</label>
                  <input 
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => {
                      setDateFilter({ start: '', end: '' });
                      setIsDateFilterOpen(false);
                    }}
                    className="flex-1 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    Xóa lọc
                  </button>
                  <button 
                    onClick={() => setIsDateFilterOpen(false)}
                    className="flex-1 py-2 text-xs font-bold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-zinc-50 border-bottom border-zinc-200">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mã đơn</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-zinc-900">#{order.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-zinc-900">{order.customerName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-500">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-zinc-900">{formatCurrency(order.totalAmount)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      order.status === 'completed' ? "bg-emerald-50 text-emerald-700" :
                      order.status === 'pending' ? "bg-amber-50 text-amber-700" :
                      "bg-red-50 text-red-700"
                    )}>
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 lg:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      {permission === 'manage' && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl h-[95vh] sm:h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 sm:p-6 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900">Tạo đơn hàng mới</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Product Selection */}
              <div className="flex-1 p-4 lg:p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-zinc-100 min-h-0">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-zinc-700">Khách hàng</label>
                    <button 
                      onClick={() => setIsNewCustomer(!isNewCustomer)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      {isNewCustomer ? 'Chọn từ danh sách' : '+ Thêm khách mới'}
                    </button>
                  </div>
                  
                  {!isNewCustomer ? (
                    <select 
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                    </select>
                  ) : (
                    <div className="space-y-3 p-4 bg-zinc-50 rounded-xl border border-emerald-100">
                      <input 
                        type="text"
                        placeholder="Tên khách hàng *"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                      <input 
                        type="text"
                        placeholder="Số điện thoại"
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Tìm kiếm sản phẩm</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input 
                      type="text"
                      placeholder="Tên sản phẩm, danh mục..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 mb-4">Danh sách sản phẩm</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProductsForOrder.map(product => (
                    <div key={product.id} className="p-4 border border-zinc-100 rounded-xl hover:border-emerald-200 transition-colors">
                      <p className="text-sm font-bold text-zinc-900">{product.name}</p>
                      <p className="text-xs text-zinc-500 mb-2">{formatCurrency(product.price)}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          product.stock > 10 ? "bg-emerald-50 text-emerald-600" : 
                          product.stock > 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                        )}>
                          Tồn: {product.stock}
                        </span>
                        <button 
                          onClick={() => handleAddProductToOrder(product.id)}
                          disabled={product.stock === 0}
                          className="flex-1 py-1.5 text-xs font-semibold bg-zinc-50 hover:bg-emerald-50 text-zinc-600 hover:text-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {product.stock > 0 ? 'Thêm' : 'Hết hàng'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-80 bg-zinc-50 p-4 sm:p-6 flex flex-col h-1/2 lg:h-full">
                <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Chi tiết đơn hàng
                </h3>
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 sm:mb-6">
                  {newOrderItems.map(item => {
                    const product = products.find(p => p.id === item.productId)!;
                    return (
                      <div key={item.productId} className="bg-white p-3 rounded-xl border border-zinc-100 shadow-sm">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-900 truncate">{product.name}</p>
                            <p className="text-xs text-zinc-500">{formatCurrency(product.price)}</p>
                          </div>
                          <button 
                            onClick={() => handleRemoveFromOrder(item.productId)}
                            className="text-zinc-400 hover:text-red-500"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-zinc-100 rounded-lg p-1">
                            <button 
                              onClick={() => handleUpdateQuantity(item.productId, -1)}
                              className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-zinc-600 hover:text-emerald-600"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.productId, 1)}
                              className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-zinc-600 hover:text-emerald-600"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-emerald-600">{formatCurrency(item.quantity * product.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {newOrderItems.length === 0 && (
                    <p className="text-center text-zinc-400 text-sm py-12">Chưa có sản phẩm nào</p>
                  )}
                </div>
                <div className="pt-4 border-t border-zinc-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-zinc-500">Tổng tiền:</span>
                    <span className="text-xl font-bold text-emerald-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                  <button 
                    onClick={handleCreateOrder}
                    disabled={(isNewCustomer ? !newCustomerName : !selectedCustomerId) || newOrderItems.length === 0}
                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-100"
                  >
                    Thanh toán
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 sm:p-6 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900">Chi tiết đơn hàng</h2>
                <p className="text-[10px] sm:text-xs text-zinc-500">Mã đơn: #{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-400 uppercase font-semibold">Khách hàng</p>
                  <p className="text-sm font-bold text-zinc-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 uppercase font-semibold">Ngày tạo</p>
                  <p className="text-sm font-bold text-zinc-900">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-zinc-400 uppercase font-semibold">Sản phẩm</p>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-zinc-600">{item.productName} (x{Number(item.quantity) || 0})</span>
                    <span className="font-medium text-zinc-900">{formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-zinc-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-zinc-900">Tổng cộng</span>
                  <span className="text-lg font-bold text-emerald-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="flex gap-4">
                {permission === 'manage' && (
                  <button 
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
                        onDeleteOrder(selectedOrder.id);
                        setSelectedOrder(null);
                      }
                    }}
                    className="flex-1 py-2.5 border border-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Xóa đơn
                  </button>
                )}
                {permission === 'manage' && selectedOrder.status !== 'cancelled' && (
                  <button 
                    onClick={() => onUpdateStatus(selectedOrder.id, 'cancelled')}
                    className="flex-1 py-2.5 border border-amber-100 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-colors"
                  >
                    Hủy đơn
                  </button>
                )}
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
