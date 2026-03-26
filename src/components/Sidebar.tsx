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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Package className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold text-zinc-900 tracking-tight">StoreMaster</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 hover:bg-zinc-100 rounded-2xl transition-all active:scale-90"
        >
          {isOpen ? <X size={24} className="text-zinc-600" /> : <Menu size={24} className="text-zinc-600" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-zinc-100 transform transition-all duration-500 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center gap-3.5">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
              <Package className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-zinc-900 tracking-tighter">StoreMaster</span>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 mt-6">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Menu chính</p>
            {visibleMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300",
                  activeTab === item.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 translate-x-1" 
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 hover:translate-x-1"
                )}
              >
                <item.icon size={20} className={cn(activeTab === item.id ? "text-white" : "text-zinc-400")} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-zinc-50">
            <div className="px-4 py-4 mb-6 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl border border-zinc-200/50">
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mb-1">Tài khoản</p>
              <p className="text-sm font-bold text-zinc-900 truncate">
                {user.name || (user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên')}
              </p>
              <p className="text-[10px] text-zinc-500 font-medium opacity-80">
                {user.role === 'admin' ? 'Quyền tối cao' : 'Quyền nhân viên'}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all duration-300 active:scale-[0.98]"
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
