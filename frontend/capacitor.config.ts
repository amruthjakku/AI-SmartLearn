import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartlearn.app',
  appName: 'SmartLearn',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
