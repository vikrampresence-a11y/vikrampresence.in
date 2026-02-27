
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext.jsx';
import { Loader2, Lock, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useSmartRedirect from '@/hooks/useSmartRedirect';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { loginUser, loginAdmin, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { executeRedirect } = useSmartRedirect();

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
        // Smart redirect: go back to the product page or wherever the user came from
        executeRedirect(from);
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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast({ title: "Login Successful", description: "Signed in with Google.", style: { backgroundColor: '#FFD700', color: '#000000' } });
      // Smart redirect after Google login
      executeRedirect('/');
    } catch (error) {
      // User may have closed the popup — only show error for real failures
      if (error.message && !error.message.includes('cancel')) {
        toast({
          title: "Google Sign-In Failed",
          description: error.message || "Could not sign in with Google.",
          variant: "destructive"
        });
      }
    } finally {
      setIsGoogleLoading(false);
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

          {/* Google Sign-In (User mode only) */}
          {!isAdminLogin && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                id="google-sign-in-btn"
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gray-100 transition-all shadow-[0_0_15px_rgba(255,255,255,0.08)] disabled:opacity-70 mb-6"
              >
                {isGoogleLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>

              <div className="flex items-center mb-6">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="px-4 text-gray-500 text-xs uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>
            </>
          )}

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
              className={`w-full font-bold uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center disabled:opacity-70 ${isAdminLogin
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
