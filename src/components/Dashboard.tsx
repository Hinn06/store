import { useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from '../utils';
import { Product, Order, Customer } from '../types';

interface DashboardProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
}

export default function Dashboard({ products, orders, customers }: DashboardProps) {
  const [range, setRange] = useState<'7days' | '30days'>('7days');

  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const totalCost = orders.reduce((sum, order) => {
    const orderCost = (order.items || []).reduce((itemSum, item) => {
      const cost = (Number(item.costPrice) || 0) * (Number(item.quantity) || 0);
      return itemSum + cost;
    }, 0);
    return sum + orderCost;
  }, 0);
  const totalProfit = totalRevenue - totalCost;

  const getChartData = () => {
    const now = new Date();
    const daysToLookBack = range === '7days' ? 7 : 30;
    const chartData = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const dayLabel = range === '7days' 
        ? dayNames[d.getDay()]
        : `${d.getDate()}/${d.getMonth() + 1}`;

      const dailyRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getDate() === d.getDate() && 
                 orderDate.getMonth() === d.getMonth() && 
                 orderDate.getFullYear() === d.getFullYear();
        })
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

      chartData.push({
        name: dayLabel,
        revenue: dailyRevenue
      });
    }
    return chartData;
  };

  const chartData = getChartData();

  const stats = [
    { label: 'Tổng sản phẩm', value: products.length, icon: Package, color: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-100', trend: '+12%', up: true },
    { label: 'Tổng đơn hàng', value: orders.length, icon: ShoppingCart, color: 'from-violet-400 to-purple-600', shadow: 'shadow-violet-100', trend: '+5%', up: true },
    { label: 'Doanh thu', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'from-rose-400 to-pink-600', shadow: 'shadow-rose-100', trend: '-2%', up: false },
    { label: 'Lợi nhuận', value: formatCurrency(totalProfit), icon: TrendingUp, color: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-100', trend: '+8%', up: true },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-xl sm:text-3xl font-black text-zinc-900 tracking-tight">Tổng quan</h1>
        <p className="text-xs sm:text-base text-zinc-500 font-medium">Chào mừng bạn quay trở lại. Đây là tình hình kinh doanh hôm nay.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 sm:p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className={cn("p-2 sm:p-3 rounded-xl text-white bg-gradient-to-br shadow-lg", stat.color, stat.shadow)}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full",
                stat.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {stat.up ? <ArrowUpRight size={10} className="sm:w-3.5 sm:h-3.5" /> : <ArrowDownRight size={10} className="sm:w-3.5 sm:h-3.5" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-bold text-zinc-400 uppercase tracking-wider mb-0.5 sm:mb-1">{stat.label}</p>
              <p className="text-sm sm:text-2xl font-black text-zinc-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-zinc-900">Doanh thu {range === '7days' ? 'tuần này' : 'tháng này'}</h2>
            <select 
              className="text-sm border-none bg-zinc-50 rounded-lg px-3 py-1 outline-none cursor-pointer"
              value={range}
              onChange={(e) => setRange(e.target.value as any)}
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717a'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717a'}} tickFormatter={(value) => `${value/1000000}M`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <ShoppingCart size={20} className="text-indigo-600" />
            Đơn hàng gần đây
          </h2>
          <div className="space-y-6">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  {(order.customerName || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">{order.customerName}</p>
                  <p className="text-xs text-zinc-500">#{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-sm font-bold text-zinc-900">
                  {formatCurrency(order.totalAmount)}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100">
            Xem tất cả đơn hàng
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle className="text-amber-600" size={20} />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">Cảnh báo tồn kho thấp</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.filter(p => p.stock <= 5).map(product => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-white border border-amber-100 rounded-2xl hover:shadow-md transition-all">
              <div>
                <p className="text-sm font-bold text-zinc-900">{product.name}</p>
                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{product.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-amber-600">{product.stock} sản phẩm</p>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Cần nhập hàng</p>
              </div>
            </div>
          ))}
          {products.filter(p => p.stock <= 5).length === 0 && (
            <div className="col-span-full py-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <Package className="mx-auto text-zinc-300 mb-2" size={32} />
              <p className="text-zinc-400 text-sm font-medium">Tất cả sản phẩm đều đủ hàng.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper for class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
