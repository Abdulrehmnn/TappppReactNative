import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Dimensions} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const OrderDetailModal = ({visible, onClose, order, onStatusChange}) => {
  if (!order) return null;
  console.log(order);
  const screenHeight = Dimensions.get('window').height;

  const {
    id,
    time,
    method,
    status,
    total,
    image,
    name,
    customer,
    orderDetails,
    discount,
    salesTax,
    shippingPrice,
    itemPrice,
  } = order;

  const updateOrderStatus = async (mid, newStatus) => {
    try {
      const storeId = await AsyncStorage.getItem('storeId');
      const token = await AsyncStorage.getItem('token');

      const url = `https://api.tapppp.com/api/Stores/update_status_by_mid?store_id=${storeId}&mid=${mid}&new_status=${newStatus}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: '*/*',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: '',
      });

      if (!res.ok) {
        throw new Error(`Failed to update status: ${res.status}`);
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Order status updated to ${newStatus}`,
      });

      console.log(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not update order status',
      });
    }
  };

  const cartItem = orderDetails?.[0] || {};
  const productTitle = cartItem.eColumn || 'Product';
  const productImage = {uri: cartItem.productImage};
  const quantity = cartItem.productItem || 1;

  const totals = itemPrice + discount;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <BlurView
          style={styles.backdrop}
          blurType="light" // 'light' | 'dark' | 'extraLight' | 'extraDark'
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />
      </TouchableWithoutFeedback>

      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.orderIdText}>
            <Text style={{color: '#2F5FD0', fontWeight: 'bold'}}>
              Order ID: #{id}
            </Text>
            {'\n'}
            {time}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Customer Details */}
        <View style={{maxHeight: screenHeight * 0.6}}>
          <ScrollView>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <View style={styles.sectionBox}>
              <Text style={styles.customerName}>
                {customer?.customerName || name}
              </Text>
              <Text style={styles.subText}>{customer?.customerContact}</Text>
              <Text style={styles.subText}>{customer?.customerAddress}</Text>
              <Text style={styles.subText}>{customer?.city}</Text>
            </View>

            {/* Cart Details */}
            <Text style={styles.sectionTitle}>Cart Details</Text>
            {orderDetails?.map((item, index) => (
              <View key={index} style={styles.sectionBoxRow}>
                <Image
                  source={{uri: item.productImage}}
                  style={styles.cartImage}
                />
                <View style={{flex: 1, paddingHorizontal: 10}}>
                  <Text style={styles.productTitle}>
                    {item.eColumn || 'Product'}
                  </Text>
                  <Text style={styles.priceText}>PKR {item.price}</Text>
                </View>
                <Text style={styles.qtyText}>Qty: {item.productItem}</Text>
              </View>
            ))}

            {/* Payment Method */}
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.sectionBox}>
              <View style={styles.radioRow}>
                <View style={styles.radioCircle}>
                  <View style={styles.radioDot} />
                </View>
                <Text style={styles.radioText}>{method}</Text>
              </View>
            </View>

            {/* Payment Summary */}
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.sectionBox}>
              <View style={styles.summaryRow}>
                <Text>Items</Text>
                <Text>{totals}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Discount</Text>
                <Text>{discount}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Sales Tax</Text>
                <Text>{salesTax}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Shipping Cost</Text>
                <Text>{shippingPrice}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Payment</Text>
                <Text style={styles.totalAmount}>{total}</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 16,
          }}>
          {status === 'Pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: '#2ecc71'}]}
                onPress={async () => {
                  await updateOrderStatus(order.mid, 'Dispatch');
                  if (onStatusChange) onStatusChange(order.mid, 'Dispatch');
                  onClose();
                }}
                >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: '#e74c3c'}]}
                onPress={async () => {
                  await updateOrderStatus(order.mid, 'Decline');
                  if (onStatusChange) onStatusChange(order.mid, 'Decline');
                  onClose();
                }}
                >
                <Text style={styles.buttonText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: '#25D366'}]}>
                <Text style={styles.buttonText}>WhatsApp</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'Dispatch' && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {backgroundColor: '#25D366', flex: 1},
              ]}>
              <Text style={styles.buttonText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default OrderDetailModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  imageContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  label: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#222',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statusTag: {
    backgroundColor: '#e0f7e9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  orderIdText: {
    fontSize: 12,
    color: '#777',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  sectionBox: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  sectionBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  customerName: {
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subText: {
    color: '#999',
  },
  cartImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 12,
    color: '#000',
  },
  qtyText: {
    fontSize: 12,
    color: '#000',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2F5FD0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#2F5FD0',
  },
  radioText: {
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
