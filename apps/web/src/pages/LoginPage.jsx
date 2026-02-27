
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext.jsx';
import { Loader2, Lock, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || (isAdminLogin ? '/admin' : '/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isAdminLogin) {
        await loginAdmin(email, password);
        toast({ title: "Admin Login Successful", style: { backgroundColor: '#FFD700', color: '#000000' } });
        navigate('/admin', { replace: true });
      } else {
        await loginUser(email, password);
        toast({ title: "Login Successful", style: { backgroundColor: '#FFD700', color: '#000000' } });
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Vikram Presence</title>
      </Helmet>

      <div className="min-h-screen bg-black flex items-center justify-center px-6 pt-20 font-sans">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          
          <div className="flex justify-center mb-8">
            <div className="flex bg-black border border-white/10 rounded-full p-1">
              <button 
                type="button"
                onClick={() => setIsAdminLogin(false)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${!isAdminLogin ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                User
              </button>
              <button 
                type="button"
                onClick={() => setIsAdminLogin(true)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${isAdminLogin ? 'bg-white/10 text-[#FFD700]' : 'text-gray-500 hover:text-[#FFD700]'}`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center mb-10">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border ${isAdminLogin ? 'bg-[#FFD700]/10 border-[#FFD700]/30' : 'bg-white/5 border-white/10'}`}>
              {isAdminLogin ? <Lock className="text-[#FFD700]" size={28} /> : <User className="text-white" size={28} />}
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tighter">{isAdminLogin ? 'Admin Access' : 'Welcome Back'}</h1>
            <p className="text-gray-400 text-sm mt-2 font-light">
              {isAdminLogin ? 'Secure area for management' : 'Log in to access your purchases'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center disabled:opacity-70 ${
                isAdminLogin 
                  ? 'bg-[#FFD700] text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.2)]' 
                  : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
              }`}
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Authenticate'}
            </button>
          </form>

          {!isAdminLogin && (
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm font-light">
                Don't have an account? <Link to="/signup" className="text-white font-bold hover:text-[#FFD700] transition-colors">Sign up</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginPage;
