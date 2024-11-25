// navigationNavigation.js

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import SignUpScreen from '../Auth/SignUpScreen';
import LoginScreen from '../Auth/LoginScreen';
import Home from '../home/Home';
import Config from 'react-native-config';

const Stack = createStackNavigator();

// GoogleSignin.configure(
//   {
//       webClientId: '780416132167-pdfcnohpo7hmrks0q1d50o4ogl6r4i79.apps.googleusercontent.com',
//       androidClientId: '780416132167-h70u99cb5hg41g5llint8apini0i2hbp.apps.googleusercontent.com',
//       offlineAccess: true,
//    // webClientId: Config.GOOGLE_WEB_CLIENT_ID,
//    // androidClientId: Config.GOOGLE_ANDROID_CLIENT_ID,


//   });

//console.log('GOOGLE_WEB_CLIENT_ID', Config.GOOGLE_WEB_CLIENT_ID);
//console.log('GOOGLE_ANDROID_CLIENT_ID', Config.GOOGLE_ANDROID_CLIENT_ID);

const HeaderRight = ({ navigation }) => {
  const onLogout = async () => {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out: ', error);
      Alert.alert('Error logging out', error.message);
    }
  };

  return (
    <TouchableOpacity onPress={onLogout} style={styles.headerButton}>
      <Text style={styles.headerButtonText}>Logout</Text>
    </TouchableOpacity>
  );
};

const Navigation = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Home" : "Login"}>
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={Home} options={({ navigation }) => ({
          headerRight: () => <HeaderRight navigation={navigation} />,
        })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 30,
  },
  headerButtonText: {
    color: '#C6373C',
    fontSize: 19,
    fontWeight: 'bold',
  },
});

export default Navigation;
