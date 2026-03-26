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
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Plus size={20} />
            Tạo đơn hàng mới
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text"
            placeholder="Tìm kiếm mã đơn, khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-5 py-3 border rounded-2xl font-semibold transition-all active:scale-95",
              (dateFilter.start || dateFilter.end) 
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100" 
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <Calendar size={20} />
            <span className="text-sm">
              {dateFilter.start || dateFilter.end ? 'Đã lọc thời gian' : 'Thời gian'}
            </span>
          </button>
          
          {isDateFilterOpen && (
            <div className="absolute right-0 sm:right-0 mt-2 w-full sm:w-80 bg-white rounded-3xl shadow-2xl border border-zinc-100 p-5 z-20 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900">Lọc theo ngày</h3>
                  <button onClick={() => setIsDateFilterOpen(false)} className="text-zinc-400">
                    <Plus className="rotate-45" size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 ml-1">Từ ngày</label>
                    <input 
                      type="date"
                      value={dateFilter.start}
                      onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 ml-1">Đến ngày</label>
                    <input 
                      type="date"
                      value={dateFilter.end}
                      onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-zinc-50"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setDateFilter({ start: '', end: '' });
                      setIsDateFilterOpen(false);
                    }}
                    className="flex-1 py-3 text-xs font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors"
                  >
                    Xóa lọc
                  </button>
                  <button 
                    onClick={() => setIsDateFilterOpen(false)}
                    className="flex-1 py-3 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop View: Table */}
      <div className="hidden lg:block bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-200">
                <th className="px-6 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Mã đơn</th>
                <th className="px-6 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-zinc-900">#{order.id}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-zinc-900">{order.customerName}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-zinc-500">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-indigo-600">{formatCurrency(order.totalAmount)}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold",
                      order.status === 'completed' ? "bg-emerald-50 text-emerald-700" :
                      order.status === 'pending' ? "bg-amber-50 text-amber-700" :
                      "bg-red-50 text-red-700"
                    )}>
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                      >
                        <Eye size={20} />
                      </button>
                      {permission === 'manage' && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                        >
                          <Trash2 size={20} />
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

      {/* Mobile/Tablet View: Cards */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <div 
            key={order.id} 
            className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            onClick={() => setSelectedOrder(order)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase mb-1">#{order.id}</p>
                <h3 className="text-lg font-bold text-zinc-900">{order.customerName}</h3>
              </div>
              <div className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                order.status === 'completed' ? "bg-emerald-50 text-emerald-700" :
                order.status === 'pending' ? "bg-amber-50 text-amber-700" :
                "bg-red-50 text-red-700"
              )}>
                {getStatusIcon(order.status)}
                {getStatusLabel(order.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-zinc-50 p-3 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Tổng tiền</p>
                <p className="text-base font-bold text-indigo-600">{formatCurrency(order.totalAmount)}</p>
              </div>
              <div className="bg-zinc-50 p-3 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Ngày tạo</p>
                <p className="text-xs font-semibold text-zinc-600">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-2 text-zinc-400">
                <ShoppingCart size={16} />
                <span className="text-xs font-medium">{order.items.length} sản phẩm</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrder(order);
                  }}
                  className="p-2 text-indigo-600 bg-indigo-50 rounded-xl active:scale-90 transition-all"
                >
                  <Eye size={18} />
                </button>
                {permission === 'manage' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
                        onDeleteOrder(order.id);
                      }
                    }}
                    className="p-2 text-red-600 bg-red-50 rounded-xl active:scale-90 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-zinc-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-1">Không tìm thấy đơn hàng</h3>
          <p className="text-zinc-500 text-sm">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc thời gian.</p>
        </div>
      )}

      {/* Create Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl h-[92vh] sm:h-[85vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-full sm:zoom-in duration-300">
            <div className="p-6 sm:p-8 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Tạo đơn hàng mới</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Vui lòng chọn khách hàng và sản phẩm.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 flex items-center justify-center bg-zinc-50 text-zinc-400 hover:text-zinc-600 rounded-full transition-colors active:scale-90"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Product Selection */}
              <div className="flex-1 p-5 sm:p-8 overflow-y-auto border-b lg:border-b-0 lg:border-r border-zinc-100">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-zinc-700 ml-1">Thông tin khách hàng</label>
                    <button 
                      onClick={() => setIsNewCustomer(!isNewCustomer)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {isNewCustomer ? 'Chọn từ danh sách' : '+ Thêm khách mới'}
                    </button>
                  </div>
                  
                  {!isNewCustomer ? (
                    <div className="relative">
                      <select 
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-2xl border border-zinc-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none bg-zinc-50/50 text-sm font-medium"
                      >
                        <option value="">-- Chọn khách hàng --</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                        <Filter size={16} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      <input 
                        type="text"
                        placeholder="Tên khách hàng *"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        className="w-full px-5 py-3 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                      />
                      <input 
                        type="text"
                        placeholder="Số điện thoại"
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        className="w-full px-5 py-3 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-zinc-700 mb-3 ml-1">Tìm kiếm sản phẩm</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Tên sản phẩm, danh mục..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-zinc-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm bg-zinc-50/50"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Danh sách sản phẩm</h3>
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md">
                    {filteredProductsForOrder.length} kết quả
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProductsForOrder.map(product => (
                    <div 
                      key={product.id} 
                      className={cn(
                        "p-4 border rounded-2xl transition-all group relative overflow-hidden",
                        product.stock === 0 ? "bg-zinc-50 border-zinc-100 opacity-60" : "bg-white border-zinc-100 hover:border-indigo-200 hover:shadow-md"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900 truncate">{product.name}</p>
                          <p className="text-xs font-bold text-indigo-600">{formatCurrency(product.price)}</p>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-lg",
                          product.stock > 10 ? "bg-emerald-50 text-emerald-600" : 
                          product.stock > 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                        )}>
                          Tồn: {product.stock}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleAddProductToOrder(product.id)}
                        disabled={product.stock === 0}
                        className={cn(
                          "w-full py-2.5 text-xs font-bold rounded-xl transition-all active:scale-95 mt-2",
                          product.stock > 0 
                            ? "bg-zinc-900 text-white hover:bg-indigo-600 shadow-sm" 
                            : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                        )}
                      >
                        {product.stock > 0 ? 'Thêm vào đơn' : 'Hết hàng'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-96 bg-zinc-50/80 p-6 sm:p-8 flex flex-col border-t lg:border-t-0 border-zinc-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                      <ShoppingCart size={18} />
                    </div>
                    Giỏ hàng
                  </h3>
                  <span className="text-xs font-bold text-zinc-400 bg-white px-3 py-1 rounded-full border border-zinc-100">
                    {newOrderItems.length} mục
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-1 custom-scrollbar">
                  {newOrderItems.map(item => {
                    const product = products.find(p => p.id === item.productId)!;
                    return (
                      <div key={item.productId} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm animate-in fade-in slide-in-from-right-4 duration-200">
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-900 truncate">{product.name}</p>
                            <p className="text-xs font-semibold text-zinc-400">{formatCurrency(product.price)}</p>
                          </div>
                          <button 
                            onClick={() => handleRemoveFromOrder(item.productId)}
                            className="w-7 h-7 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-zinc-50 rounded-xl p-1 border border-zinc-100">
                            <button 
                              onClick={() => handleUpdateQuantity(item.productId, -1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-zinc-600 hover:text-indigo-600 active:scale-90 transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold w-6 text-center text-zinc-900">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.productId, 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-zinc-600 hover:text-indigo-600 active:scale-90 transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-indigo-600">{formatCurrency(item.quantity * product.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {newOrderItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                        <ShoppingCart size={20} className="opacity-20" />
                      </div>
                      <p className="text-sm font-medium">Chưa có sản phẩm nào</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-200">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-zinc-500">Tổng thanh toán:</span>
                    <span className="text-2xl font-black text-indigo-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                  <button 
                    onClick={handleCreateOrder}
                    disabled={(isNewCustomer ? !newCustomerName : !selectedCustomerId) || newOrderItems.length === 0}
                    className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-indigo-100 active:scale-[0.98]"
                  >
                    Xác nhận đơn hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-full sm:zoom-in duration-300">
            <div className="p-6 sm:p-8 border-b border-zinc-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Chi tiết đơn hàng</h2>
                <p className="text-xs font-bold text-indigo-600 mt-0.5">Mã đơn: #{selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="w-10 h-10 flex items-center justify-center bg-zinc-50 text-zinc-400 hover:text-zinc-600 rounded-full transition-colors active:scale-90"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <div className="p-6 sm:p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <p className="text-[10px] text-zinc-400 uppercase font-black mb-1.5 tracking-wider">Khách hàng</p>
                  <p className="text-sm font-bold text-zinc-900">{selectedOrder.customerName}</p>
                </div>
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <p className="text-[10px] text-zinc-400 uppercase font-black mb-1.5 tracking-wider">Ngày tạo</p>
                  <p className="text-sm font-bold text-zinc-900">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Danh sách sản phẩm</p>
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md">
                    {selectedOrder.items.length} mục
                  </span>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm p-3 bg-white border border-zinc-100 rounded-xl">
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="font-bold text-zinc-900 truncate">{item.productName}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase">Số lượng: {Number(item.quantity) || 0}</p>
                      </div>
                      <span className="font-black text-zinc-900 whitespace-nowrap">
                        {formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-dashed border-zinc-200 flex justify-between items-center">
                  <span className="text-sm font-black text-zinc-900 uppercase tracking-wider">Tổng cộng</span>
                  <span className="text-2xl font-black text-indigo-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {permission === 'manage' && (
                  <button 
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
                        onDeleteOrder(selectedOrder.id);
                        setSelectedOrder(null);
                      }
                    }}
                    className="flex-1 py-4 border-2 border-red-100 text-red-600 font-black rounded-2xl hover:bg-red-50 transition-all active:scale-95 text-sm uppercase tracking-wider"
                  >
                    Xóa đơn
                  </button>
                )}
                {permission === 'manage' && selectedOrder.status !== 'cancelled' && (
                  <button 
                    onClick={() => {
                      onUpdateStatus(selectedOrder.id, 'cancelled');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 py-4 border-2 border-amber-100 text-amber-600 font-black rounded-2xl hover:bg-amber-50 transition-all active:scale-95 text-sm uppercase tracking-wider"
                  >
                    Hủy đơn
                  </button>
                )}
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-4 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 text-sm uppercase tracking-wider shadow-xl shadow-zinc-200"
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
