import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {
    if (!email || !password) {
      Alert.alert('Please fill in all fields!');
      return;
    }

    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        Alert.alert('Login successfully!');
        navigation.navigate('Home');
      })
      .catch(error => {
        switch (error.code) {
          case 'auth/invalid-email':
            Alert.alert('Invalid email address format.');
            break;
          case 'auth/user-not-found':
            Alert.alert('Email not found. Please check and try again.');
            break;
          case 'auth/wrong-password':
            Alert.alert('Incorrect password. Please try again.');
            break;
          default:
            Alert.alert('Login error', error.message);
        }
        console.log('error :', error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.thank}>Thank You For Joining Us Please Login</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="grey"
        style={styles.inputBox}
        value={email}
        onChangeText={value => setEmail(value)}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="grey"
        style={styles.inputBox}
        value={password}
        onChangeText={value => setPassword(value)}
        secureTextEntry
      />
      <TouchableOpacity onPress={onLogin} style={styles.register}>
        <Text style={styles.registerTitle}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signup}>
        <Text style={styles.registerTitle}>Have Not Registered? Go To Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: 12,
    borderRadius: 5,
    width: '90%',
    marginTop: 20,
    color: 'black',
  },
  register: {
    width: '90%',
    backgroundColor: '#FCAF03',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 40,
  },
  signup: {
    width: '90%',
    backgroundColor: '#03D2F7',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 15,
  },
  registerTitle: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  thank: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 50,
  },
});

export default LoginScreen;
