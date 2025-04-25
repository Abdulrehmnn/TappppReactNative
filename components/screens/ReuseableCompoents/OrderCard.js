import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Sound from 'react-native-sound';

const OrderCard = ({item, onPress, onDelete}) => {
  const blinkAnim = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    if (item.isSeen === 1 && item.status === 'Pending') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [blinkAnim, item.isSeen, item.status]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={item.image} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardId}>Order ID #{item.id}</Text>
        <Text style={styles.cardTime}>{item.time}</Text>

        <View style={styles.badgeContainer}>
          <Text
            style={[
              styles.badge,
              item.method === 'Paid' ? styles.paid : styles.cod,
            ]}>
            {item.method}
          </Text>

          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.badge,
                item.status === 'Approved' || item.status === 'Dispatch'
                  ? styles.approved
                  : item.status === 'Decline'
                  ? styles.decline
                  : styles.pending,
              ]}>
              {item.status}
            </Text>

            {item.isSeen === 1 && item.status === 'Pending' && (
              <Animated.Text style={[styles.newBadge, {opacity: blinkAnim}]}>
                New
              </Animated.Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardRight}>
        <TouchableOpacity onPress={() => onDelete(item)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
        <Text style={styles.cardTotal}>{item.total}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  newBadge: {
    fontWeight: 'bold',
    color: '#28a745', // Green color for the "New" label
    marginLeft: 5,
    backgroundColor: '#d0ff15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
  },
  // Header styles
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#131528',
    paddingVertical: 8,
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
  activeNavItem: {
    backgroundColor: '#B5E61D',
  },
  activeNavText: {
    color: '#131528',
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
  filterButton: {
    backgroundColor: '#1a1c2c',
    padding: 8,
    borderRadius: 6,
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  statusTab: {
    backgroundColor: '#e4ebd2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusTabText: {
    fontWeight: 'bold',
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardId: {
    fontSize: 12,
    color: '#666',
  },
  cardTime: {
    fontSize: 12,
    color: '#aaa',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 10,
    color: '#fff',
    overflow: 'hidden',
  },
  paid: {
    backgroundColor: '#1e90ff',
  },
  cod: {
    backgroundColor: '#444',
  },
  approved: {
    backgroundColor: '#b8fbdb',
    color: 'black',
  },
  decline: {
    backgroundColor: '#fedddd',
    color: 'black',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  deleteText: {
    color: '#dc3545',
    fontSize: 12,
    marginBottom: 6,
  },
  cardTotal: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  pending: {
    backgroundColor: '#ffd700',
    color: 'black',
  },
});
