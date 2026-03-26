import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  UserCircle, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Shield,
  Settings
} from 'lucide-react';
import { cn } from '../utils';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: User;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, user }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
    { id: 'products', label: 'Sản phẩm', icon: Package, visible: user.permissions?.products !== 'none' },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart, visible: user.permissions?.orders !== 'none' },
    { id: 'customers', label: 'Khách hàng', icon: Users, visible: user.permissions?.customers !== 'none' },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3, visible: user.permissions?.reports !== 'none' },
    { id: 'settings', label: 'Cài đặt', icon: Settings, visible: true },
  ];

  const visibleMenuItems = menuItems.filter(item => item.visible);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
            <Package className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-zinc-900">StoreMaster</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Package className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-zinc-900">StoreMaster</span>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            {visibleMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === item.id 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-100">
            <div className="px-4 py-3 mb-4 bg-zinc-50 rounded-xl">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Tài khoản</p>
              <p className="text-sm font-medium text-zinc-900 truncate">
                {user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
