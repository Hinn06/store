import React from 'react';
import { User, Shield, Lock, Phone, Mail, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '../types';
import { cn } from '../utils';

interface SettingsProps {
  user: UserType;
  onUpdateProfile: (data: { name: string, phone?: string, email?: string }) => Promise<void>;
  onChangePassword: (oldPass: string, newPass: string) => Promise<void>;
}

export default function Settings({ user, onUpdateProfile, onChangePassword }: SettingsProps) {
  const [name, setName] = React.useState(user.name);
  const [phone, setPhone] = React.useState(user.phone || '');
  const [email, setEmail] = React.useState(user.email || '');
  
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  
  const [profileMessage, setProfileMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);
    try {
      await onUpdateProfile({ name, phone, email });
      setProfileMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.message || 'Lỗi cập nhật thông tin' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage(null);
    try {
      await onChangePassword(oldPassword, newPassword);
      setPasswordMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'Lỗi đổi mật khẩu' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Cài đặt tài khoản</h1>
        <p className="text-zinc-500">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="p-6 border-b border-zinc-50 bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-zinc-900">Thông tin cá nhân</h2>
                <p className="text-xs text-zinc-500">Cập nhật họ tên và thông tin liên hệ.</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
            {profileMessage && (
              <div className={cn(
                "p-4 rounded-2xl flex items-center gap-3 text-sm animate-in zoom-in-95 duration-200",
                profileMessage.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
              )}>
                {profileMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {profileMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 ml-1">Họ và tên</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 ml-1">Số điện thoại</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="Nhập địa chỉ email"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-zinc-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUpdatingProfile ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  Lưu thay đổi
                </>
              )}
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="p-6 border-b border-zinc-50 bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Lock className="text-amber-600" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-zinc-900">Đổi mật khẩu</h2>
                <p className="text-xs text-zinc-500">Bảo vệ tài khoản bằng mật khẩu mạnh.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="p-6 space-y-6">
            {passwordMessage && (
              <div className={cn(
                "p-4 rounded-2xl flex items-center gap-3 text-sm animate-in zoom-in-95 duration-200",
                passwordMessage.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
              )}>
                {passwordMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {passwordMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 ml-1">Mật khẩu hiện tại</label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 ml-1">Mật khẩu mới</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 ml-1">Xác nhận mật khẩu mới</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isChangingPassword ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={20} />
                  Cập nhật mật khẩu
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl">
            <User size={48} className="text-white" />
          </div>
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-2xl font-bold">{user.name}</h3>
            <p className="text-emerald-100 font-medium opacity-90">
              {user.role === 'admin' ? 'Quản trị viên hệ thống' : 'Nhân viên cửa hàng'}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold border border-white/20">
                ID: {user.id}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold border border-white/20">
                {user.username || user.phone || user.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
