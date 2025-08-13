import React from 'react';
import { useUserData } from '../UserDataContext';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ...existing code...

// TEST BUTTON: Simulate new day for daily reset
const simulateNewDay = async (userData: any, setUserData: any) => {
  try {
    // Set lastOpenDate to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yyyy = yesterday.getFullYear();
    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const dd = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${yyyy}-${mm}-${dd}`;
    const newUserData = { ...userData, lastOpenDate: yesterdayStr };
    await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
    setUserData((prev: any) => ({ ...prev, lastOpenDate: yesterdayStr }));
    Alert.alert('Test', 'lastOpenDate set to yesterday. Restart app to test daily reset.');
  } catch (e) {
    Alert.alert('Error', 'Failed to simulate new day.');
  }
};

export default function ShopScreen() {
  const { userData, setUserData } = useUserData();
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [pendingItem, setPendingItem] = React.useState<{ name: string; cost: number } | null>(null);
  const coins = userData.coins;
  const gems = userData.gems;

  // Handler for Buy button
  const handleBuyPress = (name: string, cost: number) => {
    setPendingItem({ name, cost });
    setConfirmVisible(true);
  };

  // Handler for Cancel in modal
  const handleCancelBuy = () => {
    setConfirmVisible(false);
    setPendingItem(null);
  };

  // Handler for Confirm
  const handleConfirmBuy = () => {
    if (pendingItem) {
      if (pendingItem.name === 'Calendar') {
        const currentCount = userData.calendarBoughtCount || 0;
        const calendarCost = 10 + 10 * currentCount;
        if (gems >= calendarCost && currentCount < 5) {
          setUserData(prev => ({
            ...prev,
            gems: prev.gems - calendarCost,
            maxGoodHabits: (prev.maxGoodHabits ?? 1) + 1,
            calendarBoughtCount: (prev.calendarBoughtCount ?? 0) + 1,
          }));
        }
      } else if (pendingItem.name === 'Fertilizer') {
        // Fertilizer: set decay to 0 and subtract gems
        if (gems >= 5) {
          setUserData(prev => ({
            ...prev,
            gems: prev.gems - 5,
            decay: 0,
          }));
        }
      }
      // Możesz dodać logikę dla innych przedmiotów tutaj
    }
    setConfirmVisible(false);
    setPendingItem(null);
  };

  // Calendar dynamic cost and limit
  const calendarBoughtCount = userData.calendarBoughtCount ?? 0;
  const maxGoodHabits = userData.maxGoodHabits ?? 1;
  const calendarCost = 10 + 10 * calendarBoughtCount;
  const calendarDisabled = calendarBoughtCount >= 5 || gems < calendarCost;

  return (
    <View style={styles.bg}>
      {/* TEST BUTTON: Simulate new day for daily reset */}
      <View style={{ width: '100%', alignItems: 'center', marginTop: 8 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#e6b800', padding: 8, borderRadius: 8, marginBottom: 8 }}
          onPress={() => simulateNewDay(userData, setUserData)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Test: Simulate New Day (for daily reset)</Text>
        </TouchableOpacity>
      </View>
      {/* Top shop box */}
      <View style={styles.topBox}>
        <View style={styles.topBoxContent}>
          <View style={styles.shopLabelRow}>
            <Text style={styles.shopLabel}>Shop</Text>
            <View style={styles.shopBalances}>
              <View style={styles.balanceBar}>
                <Image source={require('../assets/coin.png')} style={styles.balanceIcon} />
                <Text style={styles.balanceText}>{coins}</Text>
              </View>
              <View style={styles.balanceBar}>
                <Image source={require('../assets/gem.png')} style={styles.balanceIcon} />
                <Text style={styles.balanceText}>{gems}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      {/* Scrollable shop content below header */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionLabelBox}>
          <Text style={styles.sectionLabelText}>Basic Items</Text>
        </View>
        <View style={styles.itemsGrid}>
          {/* Example item: Calendar */}
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={styles.itemBoxSmall}>
              <Text style={styles.itemText}>Calendar</Text>
              <Image source={require('../assets/items/calendar.png')} style={styles.itemImage} />
              <Text style={styles.itemDescription}>Add one good habit slot</Text>
            </View>
            <View style={styles.buyButtonContainer}>
              <TouchableOpacity
                style={[styles.buyButton, calendarDisabled && { backgroundColor: '#ccc' }]}
                onPress={() => handleBuyPress('Calendar', calendarCost)}
                disabled={calendarDisabled}
              >
                <View style={styles.buyButtonContentColumn}>
                  {calendarBoughtCount >= 5 ? (
                    <Text style={styles.buyButtonText}>Max</Text>
                  ) : (
                    <>
                      <Text style={styles.buyButtonText}>Buy</Text>
                      <View style={styles.buyButtonPriceRow}>
                        <Image source={require('../assets/gem.png')} style={styles.priceIconInButton} />
                        <Text style={styles.priceTextInButton}>{calendarCost}</Text>
                      </View>
                    </>
                  )}
                </View>
              </TouchableOpacity>
              {/* Not enough gems label removed as requested; button remains greyed out when disabled */}
              <Text style={{ fontSize: 12, color: '#7c4d00', marginTop: 4 }}>{`Bought: ${calendarBoughtCount}/5`}</Text>
            </View>
          </View>
          {/* Example item: Fertilizer */}
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={styles.itemBoxSmall}>
              <Text style={styles.itemText}>Fertilizer</Text>
              <Image source={require('../assets/items/fertilizer.png')} style={styles.itemImage} />
              <Text style={styles.itemDescription}>Cure tree and set decay back to 0</Text>
            </View>
            <View style={styles.buyButtonContainer}>
              <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyPress('Fertilizer', 5)}>
                <View style={styles.buyButtonContentColumn}>
                  <Text style={styles.buyButtonText}>Buy</Text>
                  <View style={styles.buyButtonPriceRow}>
                    <Image source={require('../assets/gem.png')} style={styles.priceIconInButton} />
                    <Text style={styles.priceTextInButton}>5</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {/* Example item: Shovel */}
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={styles.itemBoxSmall}>
              <Text style={styles.itemText}>Shovel</Text>
              <Image source={require('../assets/items/shovel.png')} style={styles.itemImage} />
              <Text style={styles.itemDescription}>Dig your tree up to plant a new one</Text>
            </View>
            <View style={styles.buyButtonContainer}>
              <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyPress('Shovel', 5)}>
                <View style={styles.buyButtonContentColumn}>
                  <Text style={styles.buyButtonText}>Buy</Text>
                  <View style={styles.buyButtonPriceRow}>
                    <Image source={require('../assets/gem.png')} style={styles.priceIconInButton} />
                    <Text style={styles.priceTextInButton}>5</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Confirmation Modal */}
        <Modal
          visible={confirmVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={handleCancelBuy}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#7c4d00', textAlign: 'center' }}>
                Confirm Purchase
              </Text>
              {pendingItem && (
                <>
                  <Text style={{ fontSize: 16, color: '#7c4d00', marginBottom: 8, textAlign: 'center' }}>
                    Are you sure you want to buy <Text style={{ fontWeight: 'bold' }}>{pendingItem.name}</Text> for <Text style={{ fontWeight: 'bold' }}>{pendingItem.cost} <Text style={{ color: '#4bbf7f' }}>gems</Text></Text>?
                  </Text>
                </>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
                <Button title="Cancel" onPress={handleCancelBuy} color="#888" />
                <View style={{ width: 12 }} />
                <Button title="Confirm" onPress={handleConfirmBuy} color="#4bbf7f" />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
      {/* You can add more shop content below */}
    </View>
  );
}

const styles = StyleSheet.create({
  buyButtonContentColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  buyButtonPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  buyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  priceIconInButton: {
    width: 16,
    height: 16,
    marginLeft: 0,
    marginRight: 2,
  },
  priceTextInButton: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 0,
  },
  buyButtonContainer: {
    alignItems: 'center',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    gap: 4,
  },
  priceIcon: {
    width: 18,
    height: 18,
    marginRight: 2,
  },
  priceText: {
    fontSize: 14,
    color: '#7c4d00',
    fontWeight: 'bold',
  },
  itemDescription: {
    fontStyle: 'italic',
    fontSize: 11,
    color: '#7c4d00',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 0,
  },
  buyButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginTop: -16,
    marginBottom: 32,
    gap: 12,
  },
  itemImage: {
    width: 48,
    height: 48,
    marginBottom: 6,
    resizeMode: 'contain',
  },
  scrollContent: {
    flex: 1,
    width: '100%',
    marginTop: '0%',
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  itemsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '90%',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 32,
    gap: 12,
  },
  sectionLabelBox: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 14,
    marginTop: '12%',
    marginBottom: 8,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabelText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7c4d00',
    textAlign: 'center',
    letterSpacing: 1,
  },
  itemsRowContainer: {
    marginTop: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBoxSmall: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 110,
    height: 110,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  topBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '15%',
    backgroundColor: '#ffe4b5',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    justifyContent: 'flex-end',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2,
  },
  topBoxContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  shopLabelRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 36,
    paddingRight: 12,
    gap: 16,
  },
  shopLabel: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#7c4d00',
    textAlign: 'left',
    marginBottom: 0,
    flex: 1,
  },
  shopBalances: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 32,
  },
  centerBox: {
    marginHorizontal: 16,
  },
  bg: {
    flex: 1,
    backgroundColor: '#f5e9d7', // soft shop background
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 32,
  },
  balanceBarContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '90%',
    marginBottom: 24,
    gap: 16,
  },
  balanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 80,
    marginRight: 8,
  },
  balanceIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  balanceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 0,
  },
  itemBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 120,
    height: 120,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c4d00',
    textAlign: 'center',
  },
  buyButton: {
    backgroundColor: '#4bbf7f',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 0,
    marginTop: 4,
    shadowColor: '#176d3b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 70,
    maxWidth: 110,
    alignSelf: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  boughtLabel: {
    color: '#7c4d00',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 0,
  },
});