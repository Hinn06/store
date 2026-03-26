import React, { useState } from 'react';
import { User, Key, Phone, UserCircle, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';
import { supabaseService } from '../services/supabaseService';
import { cn } from '../utils';

interface AccountSettingsProps {
  user: UserType;
  onUpdateUser: (user: UserType) => void;
}

export default function AccountSettings({ user, onUpdateUser }: AccountSettingsProps) {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      setIsSaving(false);
      return;
    }

    try {
      const updates: any = { name, phone };
      if (password) {
        updates.password = password;
      }

      const updatedUser = await supabaseService.updateUserProfile(user.id, updates);
      onUpdateUser(updatedUser);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công' });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật thông tin' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-zinc-900 mb-2 tracking-tight">Cài đặt tài khoản</h1>
        <p className="text-zinc-500">Cập nhật thông tin cá nhân và bảo mật tài khoản của bạn.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={cn(
            "p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
            message.type === 'success' ? "bg-sky-50 text-sky-700 border border-sky-100" : "bg-rose-50 text-rose-700 border border-rose-100"
          )}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <UserCircle size={16} />
              Thông tin cá nhân
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 space-y-4">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Key size={16} />
              Đổi mật khẩu
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Mật khẩu mới</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
                  placeholder="Để trống nếu không đổi"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
            </div>
            <p className="text-xs text-zinc-500 italic">Để trống phần mật khẩu nếu bạn không muốn thay đổi.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3.5 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 shadow-lg shadow-sky-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
