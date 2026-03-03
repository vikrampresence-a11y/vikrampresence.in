import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeSiteSettings, DEFAULT_SETTINGS } from '@/lib/siteSettings';

const SiteSettingsContext = createContext(DEFAULT_SETTINGS);

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeSiteSettings((data) => {
            setSettings(data);
            setIsLoading(false);

            // Apply accent color CSS variable
            if (data.accentColor) {
                document.documentElement.style.setProperty('--accent', data.accentColor);
            }

            // Apply glow intensity
            if (data.glowIntensity !== undefined) {
                document.documentElement.style.setProperty('--glow-intensity', `${data.glowIntensity}%`);
            }

            // Inject custom CSS
            let styleEl = document.getElementById('vp-custom-css');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'vp-custom-css';
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = data.customCss || '';

            // Inject header scripts (once)
            if (data.headerScripts && !document.getElementById('vp-header-scripts')) {
                const scriptContainer = document.createElement('div');
                scriptContainer.id = 'vp-header-scripts';
                scriptContainer.innerHTML = data.headerScripts;
                document.head.appendChild(scriptContainer);
            }
        });
        return () => unsub();
    }, []);

    return (
        <SiteSettingsContext.Provider value={{ settings, isLoading }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);

export default SiteSettingsContext;
