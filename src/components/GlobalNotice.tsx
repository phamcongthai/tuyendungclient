import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

const GlobalNotice: React.FC = () => {
  const { settings } = useSettings();
  if (!settings?.noticeEnabled || !settings.noticeMessage) return null;
  return (
    <div style={{
      background: settings.noticeColor || '#1677ff',
      color: '#fff',
      padding: '8px 12px',
      textAlign: 'center',
      fontWeight: 600
    }}>
      {settings.noticeMessage}
    </div>
  );
};

export default GlobalNotice;


