import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.auracare.healthassistant',
  appName: 'AuraCare Health Assistant',
  webDir: 'dist',
  bundledWebRuntime: false,

  server: {
    androidScheme: 'https',
    cleartext: false,
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
