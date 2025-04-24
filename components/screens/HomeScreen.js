import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Alert} from 'react-native';
import Toast from 'react-native-toast-message';

import Header from './ReuseableCompoents/Header';
import Tabs from './ReuseableCompoents/Tabs';
import OrderCard from './ReuseableCompoents/OrderCard';
import OrderDetailModal from './ReuseableCompoents/OrderDetailModal';
import * as signalR from '@microsoft/signalr';

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('Orders');
  const [storeName, setStoreName] = useState('');
  const [storeImg, setStoreImg] = useState(null);
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const filterOptions = ['All Orders', 'Approved', 'Decline'];
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  
  useEffect(() => {
    let connection;

    const setupSignalR = async () => {
      const storeId = await AsyncStorage.getItem('storeId');

      connection = new signalR.HubConnectionBuilder()
        .withUrl('https://api.tapppp.com/orderHub') // ⚠️ Use your actual SignalR endpoint
        .withAutomaticReconnect()
        .build();

      connection
        .start()
        .then(() => {
          console.log('Connected to SignalR Hub');
          connection.invoke('JoinStoreGroup', storeId);
        })
        .catch(err => {
          console.error('SignalR Connection Error: ', err);
        });

        connection.on('ReceiveOrderNotification', msg => {
          console.log('New order received:', msg);
        
          PushNotification.localNotification({
            title: 'New Order Received',
            message: msg,
            playSound: true,
            soundName: 'default',
            importance: 'high', // ensures sound/vibration
            vibrate: true,
          });
        
          Toast.show({
            type: 'success',
            text1: 'New Order Notification',
            text2: msg,
          });
        
          fetchOrders();
        });
        
    };

    setupSignalR();

    // Cleanup on unmount
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  const handleCardPress = order => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const previousOrderIdsRef = useRef([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storeId = await AsyncStorage.getItem('storeId');
        const res = await fetch(
          `https://api.tapppp.com/api/Stores/fetch_orders?store_id=${storeId}&order_status=All_Orders`,
          {
            method: 'POST',
            headers: {
              Accept: '*/*',
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await res.json();

        const formatted = data.map(order => ({
          ...order,
          id: order.orderId.replace('#', ''),
          name: order.customer?.customerName || 'Unknown',
          image: {uri: order.orderDetails[0]?.productImage || ''},
          time: new Date(order.transactionDt).toLocaleString(),
          method: order.paymentMethodName,
          status: order.orderStatus,
          total: order.totalPrice,
          isSeen: order.isSeen,
        }));

        const sortedOrders = formatted.sort(
          (a, b) => parseInt(b.id) - parseInt(a.id),
        );

        // Detect new orders
        const currentOrderIds = sortedOrders.map(order => order.id);
        const newOrderIds = currentOrderIds.filter(
          id => !previousOrderIdsRef.current.includes(id),
        );

        previousOrderIdsRef.current = currentOrderIds;

        // setPreviousOrderIds(currentOrderIds); // Update previous order IDs
        setOrders(sortedOrders); // Update state with new orders
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'All Orders') return true;
    if (activeFilter === 'Approved') return order.status === 'Dispatch';
    if (activeFilter === 'Decline') return order.status === 'Decline';
  });

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  };

  useEffect(() => {
    const loadStoreInfo = async () => {
      const name = await AsyncStorage.getItem('storeName');
      const img = await AsyncStorage.getItem('storeImg');
      if (name) setStoreName(name);
      if (img) setStoreImg(img);
    };
    loadStoreInfo();
  }, []);

  const handleDelete = order => {
    Alert.alert(
      'Delete Order',
      `Do you want to delete Order ID #${order.id}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const storeId = await AsyncStorage.getItem('storeId');
              const response = await fetch(
                `https://api.tapppp.com/api/Stores/Delete_Order_By_Id?id=${order.mid}&store_id=${storeId}`,
                {
                  method: 'POST',
                  headers: {
                    accept: '*/*',
                  },
                },
              );

              if (response.ok) {
                setOrders(prev => prev.filter(o => o.mid !== order.mid));
                Alert.alert('Success', 'Order deleted successfully.');
              } else {
                Alert.alert('Error', 'Failed to delete order.');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Something went wrong.');
            }
          },
        },
      ],
    );
  };

  const handleStatusChange = (mid, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.mid === mid ? {...order, status: newStatus} : order,
      ),
    );

    if (newStatus === 'Dispatch') {
      setActiveFilter('Approved');
    } else if (newStatus === 'Decline') {
      setActiveFilter('Decline');
    }
  };

  const renderContent = () => {
    if (activeTab === 'Orders') {
      return (
        <>
          <View style={styles.searchContainer}>
            <Icon
              name="search-outline"
              size={20}
              color="#888"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Order ID..."
              placeholderTextColor="#888"
            />
          </View>
          <View style={styles.filterRow}>
            <Icon
              name="filter-outline"
              size={20}
              color="#444"
              style={styles.filterIcon}
            />
            <View style={styles.filterButtonsContainer}>
              {filterOptions.map(label => (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.filterButton,
                    activeFilter === label && styles.activeFilterButton,
                  ]}
                  onPress={() => setActiveFilter(label)}>
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === label && styles.activeFilterText,
                    ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <FlatList
            data={filteredOrders}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <OrderCard
                item={item}
                onPress={() => handleCardPress(item)}
                onDelete={handleDelete}
              />
            )}
          />
        </>
      );
    }
    return <Text style={styles.contentText}>{activeTab} Content</Text>;
  };

  return (
    <>
      <View style={styles.container}>
        <Header
          storeImg={storeImg}
          storeName={storeName}
          onLogout={handleLogout}
        />
        <Tabs activeTab={activeTab} onChangeTab={setActiveTab} />
        <View style={styles.content}>{renderContent()}</View>
      </View>
      {/* <OrderDetailModal
        visible={modalVisible}
        order={selectedOrder}
        onClose={() => setModalVisible(false)}
      /> */}
      <OrderDetailModal
        visible={modalVisible}
        order={selectedOrder}
        onClose={() => setModalVisible(false)}
        onStatusChange={handleStatusChange}
      />

      <Toast />
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  contentText: {
    fontSize: 22,
    color: '#000',
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#000',
  },
  // filterRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'flex-start',
  //   marginBottom: 10,
  //   gap: 8, // you can use gap if your RN version supports it
  // },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 30,
    elevation: 2,
  },

  activeFilterButton: {
    backgroundColor: '#4caf50', // more vibrant green
    elevation: 4,
  },

  filterText: {
    fontSize: 14,
    color: '#333',
  },

  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterIcon: {
    marginRight: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },

  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginLeft: 10,
    gap: 8, // optional spacing if supported in your RN version
  },
});
