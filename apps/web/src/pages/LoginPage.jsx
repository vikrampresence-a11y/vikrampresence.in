
import React from 'react';
import { Helmet } from 'react-helmet';
import { SignIn } from '@clerk/clerk-react';

const LoginPage = () => {
  return (
    <>
      <Helmet>
        <title>Login | Vikram Presence</title>
      </Helmet>

      <div className="min-h-screen bg-black flex items-center justify-center px-6 pt-20 font-sans">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)]',
              headerTitle: 'text-3xl font-bold text-white tracking-tighter',
              headerSubtitle: 'text-gray-400 font-light',
              formButtonPrimary:
                'bg-[#FFD700] text-black hover:bg-yellow-400 font-bold uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-all',
              formFieldInput:
                'bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] transition-colors',
              formFieldLabel:
                'text-xs font-bold text-gray-400 uppercase tracking-widest',
              socialButtonsBlockButton:
                'bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gray-100 transition-all shadow-[0_0_15px_rgba(255,255,255,0.08)]',
              socialButtonsBlockButtonText: 'font-bold uppercase tracking-widest text-sm',
              dividerLine: 'bg-white/10',
              dividerText: 'text-gray-500 text-xs uppercase tracking-widest',
              footerActionLink: 'text-white font-bold hover:text-[#FFD700] transition-colors',
              footerActionText: 'text-gray-400 text-sm font-light',
            },
          }}
        />
      </div>
    </>
  );
};

export default LoginPage;
