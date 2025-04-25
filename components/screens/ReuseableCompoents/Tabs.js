import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const Tabs = ({activeTab, onChangeTab}) => {
  return (
    <View style={styles.tabsContainer}>
      {['Summary', 'Orders', 'Customers'].map(tab => (
        <TouchableOpacity
          key={tab}
          onPress={() => onChangeTab(tab)}
          style={[styles.navItem, activeTab === tab && styles.activeNavItem]}>
          <Text style={[styles.navText, activeTab === tab && styles.activeNavText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'black',
    paddingVertical: 6,
    justifyContent: 'space-around',
  },
  navItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  navText: {
    color: '#fff',
    fontWeight: 'bold',
  },
//   activeNavItem: {
//     backgroundColor: '',
//   },
  activeNavText: {
    color: '#B5E61D',
  },
});
