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
    { label: 'Tổng sản phẩm', value: products.length, icon: Package, color: 'bg-indigo-500', trend: '+12%', up: true },
    { label: 'Tổng đơn hàng', value: orders.length, icon: ShoppingCart, color: 'bg-violet-500', trend: '+5%', up: true },
    { label: 'Doanh thu', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'bg-rose-500', trend: '-2%', up: false },
    { label: 'Lợi nhuận', value: formatCurrency(totalProfit), icon: TrendingUp, color: 'bg-blue-500', trend: '+8%', up: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900">Tổng quan</h1>
        <p className="text-sm lg:text-base text-zinc-500">Chào mừng bạn quay trở lại. Đây là tình hình kinh doanh hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl text-white", stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                stat.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
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

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-6">Đơn hàng gần đây</h2>
          <div className="space-y-6">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xs">
                  {(order.customerName || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{order.customerName}</p>
                  <p className="text-xs text-zinc-500">#{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-sm font-bold text-zinc-900">
                  {formatCurrency(order.totalAmount)}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
            Xem tất cả đơn hàng
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="text-amber-500" size={20} />
          <h2 className="text-lg font-bold text-zinc-900">Cảnh báo tồn kho thấp</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.filter(p => p.stock <= 5).map(product => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <div>
                <p className="text-sm font-bold text-zinc-900">{product.name}</p>
                <p className="text-xs text-zinc-500">{product.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-amber-600">{product.stock} sản phẩm</p>
                <p className="text-[10px] text-amber-500 font-medium uppercase tracking-wider">Cần nhập hàng</p>
              </div>
            </div>
          ))}
          {products.filter(p => p.stock <= 5).length === 0 && (
            <div className="col-span-full py-8 text-center text-zinc-400 text-sm">
              Tất cả sản phẩm đều đủ hàng.
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
