import React from 'react';
import Navigation from './src/Navigation/Navigation';
import firebase from '@react-native-firebase/app';
import Config from 'react-native-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const App = () => {
  GoogleSignin.configure({
    webClientId: Config.GOOGLE_WEB_CLIENT_ID,
    androidClientId: Config.GOOGLE_ANDROID_CLIENT_ID,
    offlineAccess: true,
  });

  React.useEffect(() => {
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: Config.FIREBASE_API_KEY,
        projectId: Config.FIREBASE_PROJECT_ID,
        storageBucket: Config.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: Config.FIREBASE_PROJECT_NUMBER,
        appId: Config.FIREBASE_MOBILESDK_APP_ID,
      });
    }
  }, []);

  return <Navigation />;
};

export default App;
