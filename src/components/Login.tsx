import React, { useState } from 'react';
import { LogIn, XCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (identifier: string, password?: string) => Promise<boolean>;
  onRegister: (data: { username?: string, email?: string, phone?: string, password: string, name: string, role: 'admin' | 'staff' }) => Promise<{ success: boolean, message: string }>;
  onResetPassword: (phone: string, newPassword: string) => Promise<{ success: boolean, message: string }>;
}

export default function Login({ onLogin, onRegister, onResetPassword }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        if (!phone || !newPassword) {
          setError('Vui lòng nhập số điện thoại và mật khẩu mới');
          return;
        }
        const result = await onResetPassword(phone, newPassword);
        if (result.success) {
          setSuccess(result.message);
          setTimeout(() => {
            setIsForgotPassword(false);
            setSuccess('');
          }, 2000);
        } else {
          setError(result.message);
        }
      } else if (isRegister) {
        if (!phone) {
          setError('Số điện thoại là bắt buộc để đăng ký');
          return;
        }
        if (password.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự');
          return;
        }
        // Default username to phone if not provided
        const finalUsername = (username.trim() || phone.trim());
        const result = await onRegister({ 
          username: finalUsername, 
          email: email.trim(), 
          phone: phone.trim(), 
          password, 
          name: name.trim(), 
          role: 'admin' 
        });
        if (result.success) {
          setSuccess(result.message);
          setTimeout(() => setIsRegister(false), 1500);
        } else {
          setError(result.message);
        }
      } else {
        const success = await onLogin(identifier.trim(), password);
        if (!success) {
          setError('Thông tin đăng nhập hoặc mật khẩu không đúng');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <LogIn className="text-white w-8 h-8" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-zinc-900 mb-2">StoreMaster</h1>
          <p className="text-zinc-500 text-center mb-8">
            {isForgotPassword ? 'Khôi phục mật khẩu qua SĐT' : isRegister ? 'Đăng ký tài khoản mới' : 'Đăng nhập để quản lý cửa hàng của bạn'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isForgotPassword ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Số điện thoại đăng ký</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Nhập mật khẩu mới"
                    required
                  />
                </div>
              </>
            ) : isRegister ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Số điện thoại (Dùng làm tên đăng nhập)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Tên đăng nhập (Tùy chọn)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Mặc định là số điện thoại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Email (Tùy chọn)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Nhập email"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Tên đăng nhập, Email hoặc SĐT</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập thông tin đăng nhập"
                  required
                />
              </div>
            )}

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
            )}

            {!isRegister && !isForgotPassword && (
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs text-zinc-500 hover:text-indigo-600 font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <XCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-indigo-600 text-sm bg-indigo-50 p-3 rounded-lg">
                <LogIn size={16} />
                <span>{success}</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                {isLoading ? 'Đang xử lý...' : isForgotPassword ? 'Khôi phục mật khẩu' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (isForgotPassword) {
                    setIsForgotPassword(false);
                  } else {
                    setIsRegister(!isRegister);
                  }
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-indigo-600 font-medium hover:underline"
              >
                {isForgotPassword ? 'Quay lại đăng nhập' : isRegister ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký ngay'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
