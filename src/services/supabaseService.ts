import { getSupabase } from '../lib/supabase';
import { Product, Order, Customer, User, Permissions } from '../types';

export const supabaseService = {
  // Products
  async getProducts(userId: string) {
    const { data, error } = await getSupabase()
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (error) throw error;
    return data.map(p => ({
      ...p,
      price: Number(p.price),
      costPrice: Number(p.cost_price),
      stock: Number(p.stock)
    })) as Product[];
  },
  async addProduct(product: Omit<Product, 'id'>, userId: string) {
    const id = `p${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const { costPrice, ...rest } = product;
    const { data, error } = await getSupabase().from('products').insert([{ 
      ...rest, 
      id,
      user_id: userId,
      cost_price: costPrice 
    }]).select();
    
    if (error) throw error;
    return { 
      ...data[0], 
      price: Number(data[0].price),
      costPrice: Number(data[0].cost_price),
      stock: Number(data[0].stock)
    } as Product;
  },
  async updateProduct(product: Product, userId: string) {
    const { costPrice, ...rest } = product;
    const { data, error } = await getSupabase().from('products').update({
      ...rest,
      cost_price: costPrice
    }).eq('id', product.id).eq('user_id', userId).select();
    if (error) throw error;
    return { 
      ...data[0], 
      price: Number(data[0].price),
      costPrice: Number(data[0].cost_price),
      stock: Number(data[0].stock)
    } as Product;
  },
  async deleteProduct(id: string, userId: string) {
    const { error } = await getSupabase().from('products').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },
  async updateStock(id: string, newStock: number, userId: string) {
    const { error } = await getSupabase().from('products').update({ stock: newStock }).eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  // Customers
  async getCustomers(userId: string) {
    const { data, error } = await getSupabase()
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (error) throw error;
    return data.map(c => ({ ...c, purchaseHistory: [] })) as Customer[];
  },
  async addCustomer(customer: Omit<Customer, 'id'>, userId: string) {
    const id = `c${Date.now()}`;
    const { name, phone, address } = customer;
    const { data, error } = await getSupabase().from('customers').insert([{ id, name, phone, address, user_id: userId }]).select();
    if (error) throw error;
    return { ...data[0], purchaseHistory: [] } as Customer;
  },
  async updateCustomer(customer: Customer, userId: string) {
    const { name, phone, address } = customer;
    const { data, error } = await getSupabase().from('customers').update({ name, phone, address }).eq('id', customer.id).eq('user_id', userId).select();
    if (error) throw error;
    return { ...data[0], purchaseHistory: customer.purchaseHistory } as Customer;
  },
  async deleteCustomer(id: string, userId: string) {
    const { error } = await getSupabase().from('customers').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  // Orders
  async getOrders(userId: string) {
    const { data, error } = await getSupabase()
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(o => ({
      ...o,
      customerId: o.customer_id,
      customerName: o.customer_name,
      totalAmount: Number(o.total_amount || 0),
      items: (o.order_items || []).map((item: any) => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
        costPrice: Number(item.cost_price || 0)
      })),
      createdAt: o.created_at
    })) as Order[];
  },
  async addOrder(order: Omit<Order, 'id'>, userId: string) {
    const id = `ORD${Math.floor(Math.random() * 10000)}`;
    const { customerId, customerName, totalAmount, status, items } = order;
    
    // 1. Insert Order
    const { error: orderError } = await getSupabase().from('orders').insert([{
      id,
      customer_id: customerId,
      customer_name: customerName,
      total_amount: totalAmount,
      status,
      user_id: userId
    }]);
    
    if (orderError) throw orderError;
    
    // 2. Insert Order Items
    const itemsToInsert = items.map(item => ({
      order_id: id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      price: item.price,
      cost_price: item.costPrice,
      user_id: userId
    }));
    
    const { error: itemsError } = await getSupabase().from('order_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;
    
    return { ...order, id, createdAt: new Date().toISOString() } as Order;
  },
  async updateOrderStatus(id: string, status: Order['status'], userId: string) {
    const { error } = await getSupabase().from('orders').update({ status }).eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },
  async deleteOrder(id: string, userId: string) {
    const { error: itemsError } = await getSupabase().from('order_items').delete().eq('order_id', id).eq('user_id', userId);
    if (itemsError) throw itemsError;
    
    const { error: orderError } = await getSupabase().from('orders').delete().eq('id', id).eq('user_id', userId);
    if (orderError) throw orderError;
  },

  // Users & Auth
  async getUsers() {
    const { data, error } = await getSupabase().from('app_users').select('*');
    if (error) throw error;
    return data as any[];
  },
  async login(identifier: string, password?: string) {
    const { data, error } = await getSupabase()
      .from('app_users')
      .select('*')
      .or(`username.eq.${identifier},email.eq.${identifier},phone.eq.${identifier}`)
      .eq('password', password)
      .single();
    
    if (error) return null;
    return data as User;
  },
  async register(user: any) {
    const { data, error } = await getSupabase().from('app_users').insert([{
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      password: user.password,
      role: user.role,
      name: user.name,
      permissions: user.permissions
    }]).select();
    if (error) throw error;
    return data[0];
  },
  async updatePermissions(userId: string, permissions: Permissions) {
    const { error } = await getSupabase().from('app_users').update({ permissions }).eq('id', userId);
    if (error) throw error;
  },
  async resetPassword(phone: string, newPassword: string) {
    // 1. Find user by phone
    const { data: user, error: findError } = await getSupabase()
      .from('app_users')
      .select('id')
      .eq('phone', phone)
      .single();
    
    if (findError || !user) {
      throw new Error('Không tìm thấy tài khoản với số điện thoại này');
    }

    // 2. Update password
    const { error: updateError } = await getSupabase()
      .from('app_users')
      .update({ password: newPassword })
      .eq('id', user.id);
    
    if (updateError) throw updateError;
    return { success: true, message: 'Mật khẩu đã được cập nhật thành công' };
  },
  async sendSMSOTP(phone: string) {
    // 1. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiry

    // 2. Store in DB
    const { error: dbError } = await getSupabase()
      .from('verification_codes')
      .insert([{ phone, code, expires_at: expiresAt }]);
    
    if (dbError) throw dbError;

    // 3. Send via SMS (Placeholder for real API call)
    console.log(`[SMS API] Sending OTP ${code} to ${phone}`);
    
    // In a real app, you would use fetch() to call an SMS provider's API
    // Example (Twilio):
    /*
    const SMS_API_KEY = import.meta.env.VITE_SMS_API_KEY;
    const SMS_SENDER_ID = import.meta.env.VITE_SMS_SENDER_ID;
    if (SMS_API_KEY && SMS_SENDER_ID) {
      // Call your backend or a proxy to send SMS securely
    }
    */

    return { success: true, message: 'Mã xác minh đã được gửi qua SMS' };
  },
  async verifyOTP(phone: string, code: string) {
    const { data, error } = await getSupabase()
      .from('verification_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      throw new Error('Mã xác minh không đúng hoặc đã hết hạn');
    }

    // Optional: Delete code after use
    await getSupabase().from('verification_codes').delete().eq('id', data.id);

    return { success: true };
  },
  async updateUserProfile(userId: string, data: { name: string, phone?: string, email?: string }) {
    const { error } = await getSupabase()
      .from('app_users')
      .update({ 
        name: data.name, 
        phone: data.phone || null, 
        email: data.email || null 
      })
      .eq('id', userId);
    
    if (error) throw error;
    return { success: true };
  },
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    // 1. Verify old password
    const { data: user, error: findError } = await getSupabase()
      .from('app_users')
      .select('password')
      .eq('id', userId)
      .single();
    
    if (findError || !user) {
      throw new Error('Không tìm thấy người dùng');
    }

    if (user.password !== oldPassword) {
      throw new Error('Mật khẩu hiện tại không đúng');
    }

    // 2. Update to new password
    const { error: updateError } = await getSupabase()
      .from('app_users')
      .update({ password: newPassword })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    return { success: true };
  }
};
