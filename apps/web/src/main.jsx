import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import App from '@/App';
import '@/index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
	throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

ReactDOM.createRoot(document.getElementById('root')).render(
	<ClerkProvider
		publishableKey={PUBLISHABLE_KEY}
		appearance={{
			baseTheme: dark,
			variables: {
				colorPrimary: '#FFD700',
				colorBackground: '#0a0a0a',
				colorInputBackground: '#000000',
				colorInputText: '#ffffff',
				colorText: '#ffffff',
				colorTextSecondary: '#9ca3af',
				borderRadius: '0.75rem',
			},
			elements: {
				formButtonPrimary:
					'bg-[#FFD700] text-black hover:bg-yellow-400 uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(255,215,0,0.3)]',
				card: 'bg-[#0a0a0a] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]',
				headerTitle: 'text-white',
				headerSubtitle: 'text-gray-400',
				socialButtonsBlockButton:
					'bg-white text-black hover:bg-gray-100 border-none',
				socialButtonsBlockButtonText: 'font-bold uppercase tracking-widest',
				formFieldInput:
					'bg-black border-white/20 text-white focus:border-[#FFD700]',
				footerActionLink: 'text-[#FFD700] hover:text-yellow-400',
			},
		}}
	>
		<App />
	</ClerkProvider>
);