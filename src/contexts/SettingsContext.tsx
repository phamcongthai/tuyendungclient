import React, { createContext, useContext, useEffect, useState } from 'react';
import { http as axiosInstance } from '../apis/http';

export type PublicSettings = {
  logoUrl?: string;
  faviconUrl?: string;
  clientTitle?: string;
  recruiterTitle?: string;
  noticeEnabled?: boolean;
  noticeMessage?: string;
  noticeColor?: string;
};

type SettingsContextType = {
  settings: PublicSettings | null;
  refresh: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType>({ settings: null, refresh: async () => {} });

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  const applyFavicon = (href?: string) => {
    if (!href) return;
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
  };

  const refresh = async () => {
    try {
      const res = await axiosInstance.get('/site-settings');
      setSettings(res.data);
      if (res.data?.faviconUrl) applyFavicon(res.data.faviconUrl);
      if (res.data?.clientTitle) document.title = res.data.clientTitle;
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
