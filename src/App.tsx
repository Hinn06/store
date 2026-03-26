import { useState, useEffect } from 'react';
import { Product, Order, Customer, User } from './types';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import OrderManagement from './components/OrderManagement';
import CustomerManagement from './components/CustomerManagement';
import Reports from './components/Reports';
import SettingsComponent from './components/Settings';
import { Permissions } from './types';
import { supabaseService } from './services/supabaseService';
import { AlertTriangle, Shield, Search, Filter, Plus, Package, Users, ShoppingCart, BarChart3, Settings, LogOut, Menu, X, ChevronRight, TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const DEFAULT_PERMISSIONS: Record<'admin' | 'staff', Permissions> = {
  admin: {
    products: 'manage',
    customers: 'manage',
    orders: 'manage',
    reports: 'view',
  },
  staff: {
    products: 'view',
    customers: 'view',
    orders: 'manage',
    reports: 'none',
  },
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  
  const [dbError, setDbError] = useState<{message: string, code?: string} | null>(null);
  
  // App State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load Initial Data from Supabase
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      setDbError(null);
      try {
        // 1. Check Auth
        const savedUser = localStorage.getItem('store_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error: any) {
        console.error('Error initializing app:', error);
        const errorMessage = error.message || '';
        
        if (errorMessage.includes('Supabase configuration is missing') || 
            errorMessage.includes('Invalid supabaseUrl') ||
            errorMessage.includes('URL Supabase không hợp lệ')) {
          setConfigError(true);
        } else {
          setDbError({
            message: errorMessage || 'Lỗi kết nối Database',
            code: error.code
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  // Fetch data when user changes
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setProducts([]);
        setOrders([]);
        setCustomers([]);
        return;
      }

      try {
        const [p, o, c] = await Promise.all([
          supabaseService.getProducts(user.id),
          supabaseService.getOrders(user.id),
          supabaseService.getCustomers(user.id)
        ]);

        setProducts(p);
        setOrders(o);
        setCustomers(c);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        if (error.message?.includes('relation "products" does not exist')) {
          setDbError({
            message: 'Bảng dữ liệu chưa được tạo trong Supabase.',
            code: error.code
          });
        }
      }
    };

    fetchData();
  }, [user]);

  const handleLogin = async (identifier: string, password?: string) => {
    try {
      const foundUser = await supabaseService.login(identifier, password);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('store_user', JSON.stringify(foundUser));
        return true;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message?.includes('relation "app_users" does not exist')) {
        alert('Lỗi: Bảng "app_users" chưa được tạo trong Supabase. Vui lòng chạy mã SQL trong file supabase_schema.sql.');
      } else {
        alert('Lỗi đăng nhập: ' + error.message);
      }
    }
    return false;
  };

  const handleResetPassword = async (phone: string, newPassword: string) => {
    if (newPassword.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' };
    }
    try {
      return await supabaseService.resetPassword(phone, newPassword);
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, message: error.message || 'Lỗi khôi phục mật khẩu' };
    }
  };

  const handleRegister = async (data: { username?: string, email?: string, phone?: string, password: string, name: string, role: 'admin' | 'staff' }) => {
    try {
      const { username, email, phone, password, name, role } = data;
      
      // Clean up data: convert empty strings to undefined to avoid unique constraint violations on empty strings
      // SQL UNIQUE constraints allow multiple NULLs but only one empty string.
      const cleanUsername = username?.trim() || undefined;
      const cleanEmail = email?.trim() || undefined;
      const cleanPhone = phone?.trim() || undefined;

      const newUser: User = {
        id: `u${Date.now()}`,
        username: cleanUsername,
        email: cleanEmail,
        phone: cleanPhone,
        password,
        role,
        name,
        permissions: DEFAULT_PERMISSIONS[role]
      };

      await supabaseService.register(newUser);
      
      return { success: true, message: 'Đăng ký thành công. Bạn có thể đăng nhập ngay.' };
    } catch (error: any) {
      console.error('Register error:', error);
      let message = 'Đăng ký thất bại';
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('relation "app_users" does not exist')) {
        message = 'Lỗi: Bảng "app_users" chưa được tạo trong Supabase. Vui lòng chạy mã SQL trong file supabase_schema.sql.';
      } else if (errorMessage.includes('duplicate key')) {
        if (errorMessage.includes('username')) {
          message = 'Tên đăng nhập đã tồn tại.';
        } else if (errorMessage.includes('email')) {
          message = 'Email đã tồn tại.';
        } else if (errorMessage.includes('phone')) {
          message = 'Số điện thoại đã tồn tại.';
        } else {
          message = 'Thông tin đăng nhập (Tên đăng nhập, Email hoặc SĐT) đã tồn tại.';
        }
      } else {
        message = 'Lỗi: ' + errorMessage;
      }
      return { success: false, message };
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('store_user');
  };

  const updateProfile = async (data: { name: string, phone?: string, email?: string }) => {
    if (!user) return;
    await supabaseService.updateUserProfile(user.id, data);
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('store_user', JSON.stringify(updatedUser));
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!user) return;
    await supabaseService.changePassword(user.id, oldPass, newPass);
  };

  // Handlers
  const addProduct = async (p: Omit<Product, 'id'>) => {
    if (!user) return;
    try {
      const newProduct = await supabaseService.addProduct(p, user.id);
      setProducts(prev => [...prev, newProduct]);
      alert('Thêm sản phẩm thành công!');
    } catch (error: any) {
      console.error('Error adding product:', error);
      alert('Lỗi thêm sản phẩm: ' + error.message);
    }
  };

  const editProduct = async (p: Product) => {
    if (!user) return;
    try {
      await supabaseService.updateProduct(p, user.id);
      setProducts(prev => prev.map(item => item.id === p.id ? p : item));
      alert('Cập nhật sản phẩm thành công!');
    } catch (error: any) {
      console.error('Error editing product:', error);
      alert('Lỗi cập nhật sản phẩm: ' + error.message);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await supabaseService.deleteProduct(id, user.id);
      setProducts(prev => prev.filter(item => item.id !== id));
      alert('Xóa sản phẩm thành công!');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert('Lỗi xóa sản phẩm: ' + error.message);
    }
  };

  const addOrder = async (o: Omit<Order, 'id'> & { customerPhone?: string }) => {
    if (!user) return;
    try {
      let finalCustomerId = o.customerId;
      let finalCustomerName = o.customerName;

      // Handle new customer creation
      if (o.customerId === 'new') {
        const newCustomer = await supabaseService.addCustomer({
          name: o.customerName,
          phone: o.customerPhone || 'N/A',
          address: 'Chưa cập nhật',
          purchaseHistory: []
        }, user.id);
        setCustomers(prev => [...prev, newCustomer]);
        finalCustomerId = newCustomer.id;
      }

      const newOrder = await supabaseService.addOrder({
        ...o,
        customerId: finalCustomerId,
        customerName: finalCustomerName
      }, user.id);
      
      setOrders(prev => [newOrder, ...prev]);
      
      // Update stock locally and in DB
      o.items.forEach(async (item) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newStock = product.stock - item.quantity;
          await supabaseService.updateStock(item.productId, newStock, user.id);
          setProducts(prev => prev.map(p => 
            p.id === item.productId ? { ...p, stock: newStock } : p
          ));
        }
      });

      // Update customer history locally
      setCustomers(prev => prev.map(c => 
        c.id === finalCustomerId ? { ...c, purchaseHistory: [...c.purchaseHistory, newOrder.id] } : c
      ));
      alert('Tạo đơn hàng thành công!');
    } catch (error: any) {
      console.error('Error adding order:', error);
      alert('Lỗi tạo đơn hàng: ' + error.message);
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    if (!user) return;
    try {
      const order = orders.find(o => o.id === id);
      if (!order) return;

      await supabaseService.updateOrderStatus(id, status, user.id);

      // If changing to cancelled, revert stock
      if (status === 'cancelled' && order.status !== 'cancelled') {
        order.items.forEach(async (item) => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const newStock = product.stock + item.quantity;
            await supabaseService.updateStock(item.productId, newStock, user.id);
            setProducts(prev => prev.map(p => 
              p.id === item.productId ? { ...p, stock: newStock } : p
            ));
          }
        });
      } 
      // If changing FROM cancelled to something else, deduct stock
      else if (order.status === 'cancelled' && status !== 'cancelled') {
        order.items.forEach(async (item) => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const newStock = product.stock - item.quantity;
            await supabaseService.updateStock(item.productId, newStock, user.id);
            setProducts(prev => prev.map(p => 
              p.id === item.productId ? { ...p, stock: newStock } : p
            ));
          }
        });
      }

      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!user) return;
    try {
      const order = orders.find(o => o.id === id);
      if (!order) return;

      // If order is NOT cancelled, revert stock before deleting
      if (order.status !== 'cancelled') {
        for (const item of order.items) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const newStock = product.stock + item.quantity;
            await supabaseService.updateStock(item.productId, newStock, user.id);
            setProducts(prev => prev.map(p => 
              p.id === item.productId ? { ...p, stock: newStock } : p
            ));
          }
        }
      }

      await supabaseService.deleteOrder(id, user.id);
      setOrders(prev => prev.filter(o => o.id !== id));
      alert('Xóa đơn hàng thành công!');
    } catch (error: any) {
      console.error('Error deleting order:', error);
      alert('Lỗi xóa đơn hàng: ' + error.message);
    }
  };

  const addCustomer = async (c: Omit<Customer, 'id'>) => {
    if (!user) return;
    try {
      const newCustomer = await supabaseService.addCustomer(c, user.id);
      setCustomers(prev => [...prev, newCustomer]);
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const editCustomer = async (c: Customer) => {
    if (!user) return;
    try {
      await supabaseService.updateCustomer(c, user.id);
      setCustomers(prev => prev.map(item => item.id === c.id ? c : item));
    } catch (error) {
      console.error('Error editing customer:', error);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user) return;
    try {
      await supabaseService.deleteCustomer(id, user.id);
      setCustomers(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const updateProductStock = async (id: string, newStock: number) => {
    if (!user) return;
    try {
      await supabaseService.updateStock(id, newStock, user.id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-10 border border-amber-100 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Settings className="text-amber-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">Cấu hình Supabase chưa đúng</h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Ứng dụng cần địa chỉ URL và mã bảo mật (Anon Key) của Supabase để hoạt động. 
            Vui lòng copy và dán 2 dòng dưới đây vào phần <strong>Settings &gt; Environment Variables</strong> của AI Studio.
          </p>
          
          <div className="bg-zinc-900 rounded-2xl p-6 text-left text-xs font-mono mb-8 overflow-x-auto relative group">
            <div className="absolute top-4 right-4 text-[10px] text-zinc-500 font-bold uppercase">Environment Variables</div>
            <div className="space-y-3">
              <div>
                <p className="text-zinc-500 mb-1"># Biến 1:</p>
                <p className="text-emerald-400 break-all">VITE_SUPABASE_URL=https://nrzsnhncillisjzhbvsh.supabase.co</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1"># Biến 2:</p>
                <p className="text-emerald-400 break-all">VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yenNuaG5jaWxsaXNqemhidnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTMyMTEsImV4cCI6MjA4OTQ4OTIxMX0.Aw7rnEx8pUQdE4Xa-5HOnHN7p6bbKVfSOvD7Grodvrs</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-100"
            >
              Tôi đã thiết lập xong - Thử lại
            </button>
            <p className="text-xs text-zinc-400 italic">
              * Sau khi dán, hãy nhấn nút Save (Lưu) và tải lại trang này.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl border border-red-100 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Lỗi Cấu Hình Database</h1>
              <p className="text-zinc-500 text-sm">Supabase báo lỗi: {dbError.message}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <Shield size={18} />
                Tại sao lỗi này xảy ra?
              </h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                Supabase của bạn chưa có bảng <strong>products</strong> hoặc thiếu cột <strong>cost_price</strong>. 
                Điều này khiến ứng dụng không thể lưu sản phẩm mới.
              </p>
            </div>

            <div className="relative">
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase rounded">SQL Script</span>
              </div>
              <div className="bg-zinc-900 rounded-2xl p-6 overflow-hidden">
                <pre className="text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed">
{`-- 1. XÓA VÀ TẠO LẠI CÁC BẢNG (ĐỂ ĐẢM BẢO SẠCH SẼ)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS app_users;

CREATE TABLE products (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    cost_price NUMERIC NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TẠO LẠI CÁC BẢNG LIÊN QUAN
CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    customer_id TEXT REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    cost_price NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE app_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    name TEXT NOT NULL,
    permissions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TẮT BẢO MẬT RLS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;`}
                </pre>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                Tôi đã chạy SQL - Thử lại ngay
              </button>
              <a 
                href="https://supabase.com/dashboard/project/_/editor" 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all text-center"
              >
                Mở Supabase SQL Editor
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} onResetPassword={handleResetPassword} />;
  }

  const refreshProducts = async () => {
    if (!user) return;
    try {
      const p = await supabaseService.getProducts(user.id);
      setProducts(p);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  const renderContent = () => {
    const permissions = user.permissions || DEFAULT_PERMISSIONS[user.role as 'admin' | 'staff'];
    
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard products={products} orders={orders} customers={customers} />;
      case 'products':
        return (
          <ProductManagement 
            products={products} 
            onAdd={addProduct} 
            onEdit={editProduct} 
            onDelete={deleteProduct} 
            onUpdateStock={updateProductStock}
            onRefresh={refreshProducts}
            permission={permissions.products}
          />
        );
      case 'orders':
        return (
          <OrderManagement 
            orders={orders} 
            products={products} 
            customers={customers} 
            onAddOrder={addOrder} 
            onUpdateStatus={updateOrderStatus} 
            onDeleteOrder={deleteOrder}
            permission={permissions.orders}
          />
        );
      case 'customers':
        return (
          <CustomerManagement 
            customers={customers} 
            orders={orders}
            onAdd={addCustomer} 
            onEdit={editCustomer} 
            onDelete={deleteCustomer} 
            permission={permissions.customers}
          />
        );
      case 'reports':
        if (permissions.reports === 'none') return <Dashboard products={products} orders={orders} customers={customers} />;
        return <Reports orders={orders} products={products} />;
      case 'settings':
        return <SettingsComponent user={user} onUpdateProfile={updateProfile} onChangePassword={changePassword} />;
      default:
        return <Dashboard products={products} orders={orders} customers={customers} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        user={user} 
      />
      <main className="flex-1 p-4 lg:p-8 lg:ml-64 min-h-screen pt-20 lg:pt-8 w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
