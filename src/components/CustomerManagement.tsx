import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, User, Phone, MapPin, History, ShoppingBag, X } from 'lucide-react';
import { Customer, Order } from '../types';
import { cn, formatCurrency, formatDate } from '../utils';

interface CustomerManagementProps {
  customers: Customer[];
  orders: Order[];
  onAdd: (customer: Omit<Customer, 'id' | 'storeId'>) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  permission: 'view' | 'manage' | 'none';
}

export default function CustomerManagement({ customers, orders, onAdd, onEdit, onDelete, permission }: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  const getCustomerOrders = (customerId: string) => {
    return orders.filter(o => o.customerId === customerId);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      purchaseHistory: editingCustomer?.purchaseHistory || [],
    };

    if (editingCustomer) {
      onEdit({ ...customerData, id: editingCustomer.id });
    } else {
      onAdd(customerData);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Quản lý khách hàng</h1>
          <p className="text-sm text-zinc-500">Lưu trữ và quản lý thông tin khách hàng thân thiết.</p>
        </div>
        {permission === 'manage' && (
          <button 
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            Thêm khách hàng
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input 
          type="text"
          placeholder="Tìm kiếm theo tên, số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 font-bold text-lg">
                {(customer.name || '?').charAt(0)}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {permission === 'manage' && (
                  <>
                    <button 
                      onClick={() => {
                        setEditingCustomer(customer);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(customer.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-zinc-900 mb-4">{customer.name}</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Phone size={16} className="text-zinc-400" />
                {customer.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <MapPin size={16} className="text-zinc-400" />
                {customer.address}
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <History size={16} className="text-zinc-400" />
                {getCustomerOrders(customer.id).length} đơn hàng đã mua
              </div>
            </div>

            <button 
              onClick={() => setSelectedCustomerForHistory(customer)}
              className="w-full py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              Xem lịch sử mua hàng
            </button>
          </div>
        ))}
      </div>

      {/* Customer Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900">
                {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Họ và tên</label>
                <input 
                  name="name"
                  defaultValue={editingCustomer?.name}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Số điện thoại</label>
                <input 
                  name="phone"
                  defaultValue={editingCustomer?.phone}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Địa chỉ</label>
                <textarea 
                  name="address"
                  defaultValue={editingCustomer?.address}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase History Modal */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Lịch sử mua hàng</h2>
                <p className="text-sm text-zinc-500">{selectedCustomerForHistory.name}</p>
              </div>
              <button onClick={() => setSelectedCustomerForHistory(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {getCustomerOrders(selectedCustomerForHistory.id).length > 0 ? (
                <div className="space-y-4">
                  {getCustomerOrders(selectedCustomerForHistory.id).map(order => (
                    <div key={order.id} className="p-4 border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-bold text-zinc-900">#{order.id}</p>
                          <p className="text-xs text-zinc-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          order.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                          order.status === 'pending' ? "bg-amber-50 text-amber-600" :
                          "bg-red-50 text-red-600"
                        )}>
                          {order.status === 'completed' ? 'Hoàn thành' : order.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                        </div>
                      </div>
                      <div className="space-y-1 mb-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-zinc-600">
                            <span>{item.productName} (x{item.quantity})</span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-900">Tổng tiền</span>
                        <span className="text-sm font-bold text-emerald-600">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="text-zinc-300" size={32} />
                  </div>
                  <p className="text-zinc-500">Khách hàng này chưa có đơn hàng nào.</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-zinc-100">
              <button 
                onClick={() => setSelectedCustomerForHistory(null)}
                className="w-full py-2.5 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
