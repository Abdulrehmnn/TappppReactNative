import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import {useEffect} from 'react'; // make sure this is imported

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    if (!username || !password) {
      setMessage('');
      setMessageType('');
    }
  }, [username, password]);
  const handleSubmit = async () => {
    try {
      const response = await fetch('https://api.tapppp.com/api/login', {
        method: 'POST',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          useremail: username,
          userPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const {token, storedata} = data;

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('storeId', storedata.storeId.toString());
        await AsyncStorage.setItem('storeName', storedata.storeName);
        await AsyncStorage.setItem('storeImg', storedata.storeImg);

        setMessageType('success');
        setMessage('You have successfully logged in!');

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{name: 'Home'}],
          });
        }, 1500);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessageType('error');
      setMessage('Something went wrong. Try again later.');
    }
  };

  const GreenStar = () => {
    return (
      <View style={styles.starWrapper}>
        {Array.from({length: 6}).map((_, i) => (
          <View
            key={i}
            style={[styles.starLine, {transform: [{rotate: `${i * 60}deg`}]}]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GreenStar />
      <Text style={styles.heading}>Login To Dashboard</Text>

      <View style={styles.inputContainer}>
        <Icon name="user" size={16} color="#999" style={styles.icon} />
        <TextInput
          placeholder="username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholderTextColor="#777"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={16} color="#999" style={styles.icon} />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#777"
        />
      </View>

      {/* Message Area */}
      {message ? (
        <Text
          style={{
            color: messageType === 'error' ? 'red' : 'green',
            marginBottom: 10,
            textAlign: 'center',
          }}>
          {message}
        </Text>
      ) : null}

      <Text style={styles.forgot}>Don't remember your password?</Text>

      <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.agreement}>
        By signing in, you agree to our{' '}
        <Text style={styles.link}>Terms of services</Text> and{' '}
        <Text style={styles.link}>Privacy Policy</Text>.
      </Text>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#edf1e9',
  },
  starWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  starLine: {
    position: 'absolute',
    width: 6,
    height: 40,
    backgroundColor: '#B5E61D',
    borderRadius: 3,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f6fd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 48,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  forgot: {
    color: '#555',
    fontSize: 13,
    textAlign: 'left',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#131528',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#B5E61D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  agreement: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000',
  },
  link: {
    color: '#000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
