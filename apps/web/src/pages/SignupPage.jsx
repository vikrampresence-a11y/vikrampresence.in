
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext.jsx';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signupUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      navigate('/');
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
