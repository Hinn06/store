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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-600 hover:bg-zinc-50 transition-all disabled:opacity-50 shadow-sm active:scale-95"
          >
            <div className={cn(isRefreshing && "animate-spin")}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm active:scale-95">
            <Filter size={18} />
            <span className="hidden sm:inline">Bộ lọc</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Giá nhập</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Giá bán</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tồn kho</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                        <Package size={24} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate">{product.name}</p>
                        <p className="text-xs text-zinc-500 truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 uppercase tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-zinc-500">{formatCurrency(product.costPrice)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-zinc-900">{formatCurrency(product.price)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div 
                      className="inline-flex items-center gap-2 cursor-pointer hover:bg-zinc-100 px-2 py-1 rounded-xl transition-colors"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsStockModalOpen(true);
                      }}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                      )} />
                      <p className="text-sm font-bold text-zinc-700">{product.stock}</p>
                      {product.stock <= 5 && <AlertTriangle size={14} className="text-amber-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {permission === 'manage' && (
                        <>
                          <button 
                            onClick={() => {
                              setEditingProduct(product);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => onDelete(product.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                            title="Xóa"
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
                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all active:scale-90"
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
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group active:scale-[0.99]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  <Package size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 leading-tight">{product.name}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-lg font-black text-zinc-900">{formatCurrency(product.price)}</p>
                <p className="text-[10px] text-zinc-400 font-medium">Vốn: {formatCurrency(product.costPrice)}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl mb-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                )} />
                <span className="text-sm font-bold text-zinc-700">Tồn kho: {product.stock}</span>
              </div>
              {product.stock <= 5 && (
                <div className="flex items-center gap-1 text-amber-600 text-[10px] font-bold uppercase">
                  <AlertTriangle size={12} />
                  Sắp hết
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setSelectedProduct(product);
                  setIsStockModalOpen(true);
                }}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-colors"
              >
                Nhập kho
              </button>
              {permission === 'manage' && (
                <>
                  <button 
                    onClick={() => {
                      setEditingProduct(product);
                      setIsModalOpen(true);
                    }}
                    className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(product.id)}
                    className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="text-zinc-200" size={40} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-2">Không có sản phẩm</h3>
          <p className="text-zinc-500 max-w-xs mx-auto">Chúng tôi không tìm thấy sản phẩm nào khớp với tìm kiếm của bạn.</p>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-full sm:slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h2>
                <p className="text-xs text-zinc-500">Vui lòng điền đầy đủ thông tin sản phẩm.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <Plus className="rotate-45 text-zinc-400" size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Tên sản phẩm</label>
                  <input 
                    name="name"
                    defaultValue={editingProduct?.name}
                    required
                    placeholder="Ví dụ: Cà phê Arabica"
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-zinc-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Danh mục</label>
                  <input 
                    name="category"
                    defaultValue={editingProduct?.category}
                    required
                    placeholder="Ví dụ: Đồ uống"
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-zinc-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Số lượng tồn</label>
                  <input 
                    name="stock"
                    type="number"
                    defaultValue={editingProduct?.stock}
                    required
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-zinc-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Giá nhập (VNĐ)</label>
                  <input 
                    name="costPrice"
                    type="number"
                    defaultValue={editingProduct?.costPrice}
                    required
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-zinc-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Giá bán (VNĐ)</label>
                  <input 
                    name="price"
                    type="number"
                    defaultValue={editingProduct?.price}
                    required
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-zinc-50/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Mô tả sản phẩm</label>
                  <textarea 
                    name="description"
                    defaultValue={editingProduct?.description}
                    rows={3}
                    placeholder="Nhập mô tả chi tiết về sản phẩm..."
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-zinc-50/50 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 pb-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-4 border border-zinc-200 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-50 transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'
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
