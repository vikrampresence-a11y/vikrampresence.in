
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext.jsx';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useSmartRedirect from '@/hooks/useSmartRedirect';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signupUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { executeRedirect } = useSmartRedirect();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await signupUser(formData);
      toast({ title: "Account Created", description: "Welcome to Vikram Presence.", style: { backgroundColor: '#FFD700', color: '#000000' } });
      executeRedirect('/');
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create account.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast({ title: "Account Created", description: "Signed up with Google.", style: { backgroundColor: '#FFD700', color: '#000000' } });
      executeRedirect('/');
    } catch (error) {
      if (error.message && !error.message.includes('cancel')) {
        toast({
          title: "Google Sign-Up Failed",
          description: error.message || "Could not sign up with Google.",
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
        <title>Sign Up | Vikram Presence</title>
      </Helmet>

      <div className="min-h-screen bg-black flex items-center justify-center px-6 pt-20 font-sans">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">

          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-white/5 border border-white/10">
              <UserPlus className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tighter">Create Account</h1>
            <p className="text-gray-400 text-sm mt-2 font-light">Join to access premium resources</p>
          </div>

          {/* Google Sign-Up */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            id="google-sign-up-btn"
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
                Sign up with Google
              </>
            )}
          </button>

          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="px-4 text-gray-500 text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm Password</label>
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="Repeat password"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center disabled:opacity-70 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm font-light">
              Already have an account? <Link to="/login" className="text-white font-bold hover:text-[#FFD700] transition-colors">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
