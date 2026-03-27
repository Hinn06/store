import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Filter, ChevronRight, AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, cn } from '../utils';

interface ProductManagementProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id' | 'storeId'>) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onUpdateStock: (id: string, newStock: number) => void;
  onRefresh?: () => void;
  permission: 'view' | 'manage' | 'none';
}

export default function ProductManagement({ products, onAdd, onEdit, onDelete, onUpdateStock, onRefresh, permission }: ProductManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const productData = {
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        price: Number(formData.get('price')),
        costPrice: Number(formData.get('costPrice')),
        stock: Number(formData.get('stock')),
        description: formData.get('description') as string,
      };

      if (editingProduct) {
        await onEdit({ ...productData, id: editingProduct.id });
      } else {
        await onAdd(productData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Submit error:', error);
      // Error is handled by alerts in App.tsx, but we keep modal open
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const formData = new FormData(e.currentTarget);
    const newStock = Number(formData.get('stock'));
    onUpdateStock(selectedProduct.id, newStock);
    setIsStockModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Quản lý sản phẩm</h1>
          <p className="text-sm text-zinc-500">Quản lý kho hàng và thông tin sản phẩm của bạn.</p>
        </div>
        {permission === 'manage' && (
          <button 
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            Thêm sản phẩm
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            <div className={cn(isRefreshing && "animate-spin")}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            Làm mới
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition-colors">
            <Filter size={18} />
            Bộ lọc
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-zinc-50 border-bottom border-zinc-200">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Giá nhập</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Giá bán</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tồn kho</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{product.name}</p>
                        <p className="text-xs text-zinc-500 truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-zinc-500">{formatCurrency(product.costPrice)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-zinc-900">{formatCurrency(product.price)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-zinc-100 p-1 rounded-lg transition-colors"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsStockModalOpen(true);
                      }}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                      )} />
                      <p className="text-sm font-medium text-zinc-700">{product.stock}</p>
                      {product.stock <= 5 && <AlertTriangle size={14} className="text-amber-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 lg:opacity-100 transition-opacity">
                      {permission === 'manage' && (
                        <>
                          <button 
                            onClick={() => {
                              setEditingProduct(product);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => onDelete(product.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsStockModalOpen(true);
                        }}
                        className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-zinc-300" size={32} />
            </div>
            <p className="text-zinc-500">Không tìm thấy sản phẩm nào.</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 sm:p-6 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Tên sản phẩm</label>
                  <input 
                    name="name"
                    defaultValue={editingProduct?.name}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Danh mục</label>
                  <input 
                    name="category"
                    defaultValue={editingProduct?.category}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Giá nhập</label>
                  <input 
                    name="costPrice"
                    type="number"
                    defaultValue={editingProduct?.costPrice}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Giá bán</label>
                  <input 
                    name="price"
                    type="number"
                    defaultValue={editingProduct?.price}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Số lượng tồn</label>
                  <input 
                    name="stock"
                    type="number"
                    defaultValue={editingProduct?.stock}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Mô tả</label>
                  <textarea 
                    name="description"
                    defaultValue={editingProduct?.description}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
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
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    editingProduct ? 'Cập nhật' : 'Thêm mới'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {isStockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900">Cập nhật tồn kho</h2>
              <button onClick={() => setIsStockModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <form onSubmit={handleStockUpdate} className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-zinc-500 mb-1">Sản phẩm</p>
                <p className="text-lg font-bold text-zinc-900">{selectedProduct.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Số lượng tồn mới</label>
                <input 
                  name="stock"
                  type="number"
                  defaultValue={selectedProduct.stock}
                  required
                  autoFocus
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 transition-colors shadow-lg"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
