import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = () => {
    if (!name || !email || !password) {
      Alert.alert('Please fill in all fields!');
      return;
    }

    auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return user.updateProfile({ displayName: name });
      })
      .then(() => {
        Alert.alert('User account created!');
        navigation.navigate('Home');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('That email address is already in use!');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('That email address is invalid!');
        } else if (error.code === 'auth/weak-password') {
          Alert.alert('The password is too weak!');
        } else {
          Alert.alert('Something went wrong', error.message);
        }
      });
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();  // Ensure to sign out to prompt account selection
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      navigation.navigate('Home');
    } catch (error) {
      console.log('Google Sign-In Error:', error);  // Log the full error object
      let errorMessage = 'Something went wrong';

      // Specific error handling
      if (error.code) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            errorMessage = 'User cancelled the login flow';
            break;
          case statusCodes.IN_PROGRESS:
            errorMessage = 'Sign in is in progress already';
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            errorMessage = 'Play services not available or outdated';
            break;
          default:
            errorMessage = `Error code: ${error.code}, message: ${error.message}`;
        }
      } else {
        errorMessage = `Error: ${error.toString()}`;
      }

      Alert.alert('Google Sign-In Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcoming You In The Drive App Please Sign Up Here</Text>
      <TextInput
        placeholder="Name"
        placeholderTextColor="grey"
        style={styles.inputBox}
        value={name}
        onChangeText={value => setName(value)}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="grey"
        style={styles.inputBox}
        value={email}
        onChangeText={value => setEmail(value)}
      />
      <TextInput
        placeholder="Password (Min 6 Characters)"
        placeholderTextColor="grey"
        style={styles.inputBox}
        value={password}
        onChangeText={value => setPassword(value)}
        secureTextEntry
      />
      <TouchableOpacity onPress={onRegister} style={styles.register}>
        <Text style={styles.registerTitle}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onGoogleButtonPress} style={styles.googleSignUp}>
        <Text style={styles.registerTitle}>Sign Up with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.login}>
        <Text style={styles.registerTitle}>Already Registered? Go To Login</Text>
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
  googleSignUp: {
    width: '90%',
    backgroundColor: '#4285F4', // Google's brand color
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  login: {
    width: '90%',
    backgroundColor: '#03D2F7',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  registerTitle: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  welcome: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 30,
  },
});

export default SignUpScreen;
