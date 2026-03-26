import { Product, Customer, Order } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Sản phẩm A', category: 'Điện tử', price: 500000, costPrice: 350000, stock: 20, description: 'Mô tả sản phẩm A' },
  { id: 'p2', name: 'Sản phẩm B', category: 'Gia dụng', price: 150000, costPrice: 100000, stock: 50, description: 'Mô tả sản phẩm B' },
  { id: 'p3', name: 'Sản phẩm C', category: 'Thời trang', price: 300000, costPrice: 200000, stock: 15, description: 'Mô tả sản phẩm C' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Nguyễn Văn A', phone: '0901234567', address: 'Hà Nội', purchaseHistory: ['o1'] },
  { id: 'c2', name: 'Trần Thị B', phone: '0912345678', address: 'TP.HCM', purchaseHistory: [] },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'o1',
    customerId: 'c1',
    customerName: 'Nguyễn Văn A',
    items: [{ productId: 'p1', productName: 'Sản phẩm A', quantity: 1, price: 500000, costPrice: 350000 }],
    totalAmount: 500000,
    status: 'completed',
    createdAt: '2024-03-15T10:00:00Z',
  },
];
