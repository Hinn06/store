import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Calendar, Download, TrendingUp, ShoppingBag, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils';
import { Order, Product } from '../types';

interface ReportsProps {
  orders: Order[];
  products: Product[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#f43f5e', '#3b82f6', '#10b981'];

export default function Reports({ orders, products }: ReportsProps) {
  const [timeRange, setTimeRange] = useState('month');

  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCost = completedOrders.reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, item) => itemSum + (item.costPrice * item.quantity), 0);
  }, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Real data for charts
  const categoryStats = products.reduce((acc: { [key: string]: number }, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value: Math.round((value / products.length) * 100)
  }));

  // Revenue by day of week or month
  const getRevenueData = () => {
    const now = new Date();
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    if (timeRange === 'month') {
      // Show last 30 days
      const chartData = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);
        
        const dailyRevenue = completedOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getDate() === d.getDate() && 
                   orderDate.getMonth() === d.getMonth() && 
                   orderDate.getFullYear() === d.getFullYear();
          })
          .reduce((sum, o) => sum + o.totalAmount, 0);

        chartData.push({
          name: `${d.getDate()}/${d.getMonth() + 1}`,
          revenue: dailyRevenue
        });
      }
      return chartData;
    } else {
      // Show by month for the current year
      const months = ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12'];
      return months.map((month, idx) => {
        const monthlyRevenue = completedOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getMonth() === idx && 
                   orderDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, o) => sum + o.totalAmount, 0);
        
        return {
          name: month,
          revenue: monthlyRevenue
        };
      });
    }
  };

  const revenueData = getRevenueData();

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('Không có dữ liệu để xuất báo cáo.');
      return;
    }

    // CSV Headers
    const headers = [
      'Mã đơn hàng',
      'Ngày tạo',
      'Khách hàng',
      'Sản phẩm',
      'Số lượng',
      'Đơn giá',
      'Giá vốn',
      'Thành tiền',
      'Trạng thái'
    ];

    // CSV Rows
    const rows = orders.flatMap(order => 
      order.items.map(item => [
        order.id,
        new Date(order.createdAt).toLocaleString('vi-VN'),
        order.customerName,
        item.productName,
        item.quantity,
        item.price,
        item.costPrice,
        item.quantity * item.price,
        order.status === 'completed' ? 'Hoàn thành' : order.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'
      ])
    );

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Add BOM for UTF-8 support in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bao_cao_doanh_thu_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Báo cáo & Thống kê</h1>
          <p className="text-sm text-zinc-500">Phân tích hiệu quả kinh doanh của cửa hàng.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setTimeRange(timeRange === 'month' ? 'year' : 'month')}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <Calendar size={18} />
            {timeRange === 'month' ? 'Tháng này' : 'Năm nay'}
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            <Download size={18} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-100">
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <DollarSign size={20} />
            <span className="text-sm font-medium">Tổng doanh thu</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-violet-600 p-6 rounded-2xl text-white shadow-lg shadow-violet-100">
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <TrendingUp size={20} />
            <span className="text-sm font-medium">Tổng lợi nhuận</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalProfit)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-zinc-500">
            <ShoppingBag size={20} />
            <span className="text-sm font-medium">Tổng đơn hàng</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-zinc-500">
            <Users size={20} />
            <span className="text-sm font-medium">Giá trị TB đơn</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{formatCurrency(avgOrderValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-8">Biểu đồ doanh thu</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717a'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717a'}} tickFormatter={(value) => `${value/1000000}M`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-8">Cơ cấu danh mục</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-xs text-zinc-600">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
