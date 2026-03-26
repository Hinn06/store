export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  description: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  purchaseHistory: string[]; // Order IDs
};

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  costPrice: number;
};

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

export type Permissions = {
  products: 'view' | 'manage' | 'none';
  customers: 'view' | 'manage' | 'none';
  orders: 'view' | 'manage' | 'none';
  reports: 'view' | 'none';
};

export type User = {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  role: 'admin' | 'staff';
  name: string;
  permissions: Permissions;
};
