import React from 'react';
import { User, Shield, Lock, Phone, Mail, Save, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
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
  const [copied, setCopied] = React.useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700">
          Cài đặt tài khoản
        </h1>
        <p className="text-xs sm:text-base text-zinc-500 font-medium">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn một cách an toàn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Profile Settings */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden flex flex-col">
          <div className="p-6 sm:p-8 border-b border-zinc-50 bg-gradient-to-br from-blue-50/50 to-white">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <User className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">Thông tin cá nhân</h2>
                <p className="text-[8px] sm:text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-0.5 sm:mt-1">Hồ sơ người dùng</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8 space-y-6 sm:space-y-8 flex-1">
            {profileMessage && (
              <div className={cn(
                "p-4 sm:p-5 rounded-2xl flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold animate-in zoom-in-95 duration-300 shadow-sm",
                profileMessage.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
              )}>
                <div className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0",
                  profileMessage.type === 'success' ? "bg-emerald-100" : "bg-rose-100"
                )}>
                  {profileMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                </div>
                {profileMessage.text}
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              <div className="group">
                <label className="block text-[9px] sm:text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 sm:mb-3 group-focus-within:text-blue-600 transition-colors">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-zinc-50/50 border border-zinc-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-zinc-900 text-sm sm:text-base"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] sm:text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 sm:mb-3 group-focus-within:text-blue-600 transition-colors">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-zinc-50/50 border border-zinc-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-zinc-900 text-sm sm:text-base"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] sm:text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 sm:mb-3 group-focus-within:text-blue-600 transition-colors">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-zinc-50/50 border border-zinc-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-zinc-900 text-sm sm:text-base"
                    placeholder="Nhập địa chỉ email"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-700 hover:from-blue-600 hover:to-indigo-800 text-white font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] uppercase tracking-widest text-[10px] sm:text-xs"
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
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden flex flex-col">
          <div className="p-6 sm:p-8 border-b border-zinc-50 bg-gradient-to-br from-violet-50/50 to-white">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-400 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                <Lock className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">Đổi mật khẩu</h2>
                <p className="text-[8px] sm:text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-0.5 sm:mt-1">Bảo mật tài khoản</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="p-6 sm:p-8 space-y-6 sm:space-y-8 flex-1">
            {passwordMessage && (
              <div className={cn(
                "p-4 sm:p-5 rounded-2xl flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold animate-in zoom-in-95 duration-300 shadow-sm",
                passwordMessage.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
              )}>
                <div className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0",
                  passwordMessage.type === 'success' ? "bg-emerald-100" : "bg-rose-100"
                )}>
                  {passwordMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                </div>
                {passwordMessage.text}
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              <div className="group">
                <label className="block text-[9px] sm:text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 sm:mb-3 group-focus-within:text-violet-600 transition-colors">Mật khẩu hiện tại</label>
                <div className="relative">
                  <Shield className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-violet-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-zinc-50/50 border border-zinc-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all font-bold text-zinc-900 text-sm sm:text-base"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] sm:text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 sm:mb-3 group-focus-within:text-violet-600 transition-colors">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-violet-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-zinc-50/50 border border-zinc-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all font-bold text-zinc-900 text-sm sm:text-base"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] sm:text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 sm:mb-3 group-focus-within:text-violet-600 transition-colors">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-violet-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-zinc-50/50 border border-zinc-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all font-bold text-zinc-900 text-sm sm:text-base"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-700 hover:from-violet-600 hover:to-purple-800 text-white font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] uppercase tracking-widest text-[10px] sm:text-xs"
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
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full -mr-32 -mt-32 sm:-mr-48 sm:-mt-48 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-purple-400/20 rounded-full -ml-24 -mb-24 sm:-ml-32 sm:-mb-32 blur-2xl group-hover:scale-110 transition-transform duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-12">
          <div className="w-20 h-20 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center border border-white/30 shadow-2xl shrink-0 group-hover:rotate-6 transition-transform duration-500">
            <User size={32} className="text-white sm:hidden" />
            <User size={64} className="text-white hidden sm:block" />
          </div>
          <div className="text-center md:text-left space-y-1.5 sm:space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                {user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
              </div>
              <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 bg-emerald-500/20 backdrop-blur-md rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 text-emerald-200">
                <CheckCircle2 size={10} className="mr-1 sm:mr-1.5" />
                Đã xác minh
              </div>
            </div>
            <h3 className="text-2xl sm:text-5xl font-black truncate tracking-tight drop-shadow-sm">{user.name}</h3>
            <p className="text-indigo-100 font-bold opacity-80 text-sm sm:text-lg">
              {user.email || user.phone || user.username}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button 
                onClick={copyId}
                className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/20 backdrop-blur-sm rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black border border-white/10 hover:bg-black/30 transition-colors active:scale-95"
              >
                ID: {user.id.slice(0, 8)}...
                {copied ? <Check size={12} className="text-emerald-400 sm:w-3.5 sm:h-3.5" /> : <Copy size={12} className="sm:w-3.5 sm:h-3.5" />}
              </button>
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-black/20 backdrop-blur-sm rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black border border-white/10">
                STATUS: ACTIVE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
