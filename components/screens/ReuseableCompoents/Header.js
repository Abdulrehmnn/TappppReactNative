import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';

const Header = ({storeImg, storeName, onLogout}) => {
  return (
    <View style={styles.headerContainer}>
      {storeImg ? (
        <Image source={{uri: storeImg}} style={styles.headerLogo} />
      ) : (
        <Image
          source={require('../ReuseableCompoents/logo.png')}
          style={styles.headerLogo}
        />
      )}
      <TouchableOpacity style={styles.menuButton} onPress={onLogout}>
        <Text style={styles.menuIcon}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.headerTitle}>
        {storeName ? (
          <>
            {storeName.split(' ')[0]}{' '}
            <Text style={styles.greenText}>{storeName.split(' ')[1]}</Text>
          </>
        ) : (
          <>
            Moos <Text style={styles.greenText}>N</Text> Clucks
          </>
        )}
      </Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#000',
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
    position: 'relative',
  },
  headerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  menuButton: {
    position: 'absolute',
    top: 24,
    right: 16,
  },
  menuIcon: {
    fontSize: 15,
    color: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  greenText: {
    color: '#B5E61D',
  },
  headerDivider: {
    marginTop: 6,
    height: 1,
    backgroundColor: '#333',
    width: '100%',
  },
});
