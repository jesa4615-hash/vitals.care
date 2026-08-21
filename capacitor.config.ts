import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.auracare.healthassistant',
  appName: 'AuraCare Health Assistant',
  webDir: 'dist',

  android: {
    allowMixedContent: false,
  },

  server: {
    androidScheme: 'https',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
