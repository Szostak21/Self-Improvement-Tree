import React, { useState } from 'react';
import { useUserData } from '../UserDataContext';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Button, Alert, ActivityIndicator } from 'react-native';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { API_BASE } from '../config';

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
    // Just update state; the context will persist it per current identity
    setUserData((prev: any) => ({ ...prev, lastOpenDate: yesterdayStr }));
    Alert.alert('Test', 'lastOpenDate set to yesterday. Restart app to test daily reset.');
  } catch (e) {
    Alert.alert('Error', 'Failed to simulate new day.');
  }
};

export default function ShopScreen() {
  const { userData, setUserData } = useUserData();
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [pendingItem, setPendingItem] = React.useState<{ name: string; cost: number; currency: 'gems' | 'coins' | 'usd'; gemsAmount?: number } | null>(null);
  const coins = userData.coins || 0;
  const gems = userData.gems || 0;

  // Stripe payment state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { confirmPayment } = useConfirmPayment();

  // Handler for Buy button
  const handleBuyPress = (name: string, cost: number, currency: 'gems' | 'coins' | 'usd' = 'gems', gemsAmount?: number) => {
    // For real money purchases, open payment modal
    if (currency === 'usd') {
      setPendingItem({ name, cost, currency, gemsAmount });
      setPaymentModalVisible(true);
    } else {
      // For in-game currency, show confirmation modal
      setPendingItem({ name, cost, currency });
      setConfirmVisible(true);
    }
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
      } else if (pendingItem.name === '100 coins') {
        // Buy 100 coins for 1 gem
        if (gems >= 1) {
          setUserData(prev => ({
            ...prev,
            gems: prev.gems - 1,
            coins: (prev.coins || 0) + 100,
          }));
        }
      } else if (pendingItem.name === '1500 coins') {
        // Buy 1500 coins for 10 gems
        if (gems >= 10) {
          setUserData(prev => ({
            ...prev,
            gems: prev.gems - 10,
            coins: (prev.coins || 0) + 1500,
          }));
        }
      } else if (pendingItem.name === '1 gem') {
        // Buy 1 gem for 100 coins
        if (coins >= 100) {
          setUserData((prev: any) => ({
            ...prev,
            coins: (prev.coins || 0) - 100,
            gems: (prev.gems || 0) + 1,
          }));
        }
      } else if (pendingItem.name === '10 gems') {
        // Buy 10 gems for 1500 coins
        if (coins >= 1500) {
          setUserData((prev: any) => ({
            ...prev,
            coins: (prev.coins || 0) - 1500,
            gems: (prev.gems || 0) + 10,
          }));
        }
      }
      // Możesz dodać logikę dla innych przedmiotów tutaj
    }
    setConfirmVisible(false);
    setPendingItem(null);
  };

  // Handler for Stripe payment
  const handleStripePayment = async () => {
    if (!cardComplete) {
      Alert.alert('Card Required', 'Please enter valid card details');
      return;
    }

    if (!pendingItem || pendingItem.currency !== 'usd') {
      return;
    }

    setPaymentLoading(true);

    try {
      // Convert USD to cents for Stripe (e.g., $0.99 -> 99 cents)
      const amountInCents = Math.round(pendingItem.cost * 100);

      // Step 1: Create PaymentIntent on backend
      console.log('Creating PaymentIntent for', pendingItem.name);
      const response = await fetch(`${API_BASE}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInCents,
          currency: 'usd',
          metadata: {
            userId: 'user_' + Date.now(),
            productId: pendingItem.name,
            gemsAmount: pendingItem.gemsAmount?.toString() || '0',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      console.log('PaymentIntent created, confirming payment...');

      // Step 2: Confirm payment with Stripe
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        console.error('Payment confirmation failed:', error);
        Alert.alert(
          'Payment Failed',
          error.message || 'An error occurred during payment'
        );
      } else if (paymentIntent) {
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update gems balance after successful payment
        const gemsToAdd = pendingItem.gemsAmount || 0;
        setUserData((prev: any) => ({
          ...prev,
          gems: (prev.gems || 0) + gemsToAdd,
        }));

        // Close payment modal
        setPaymentModalVisible(false);
        setPendingItem(null);
        setCardComplete(false);

        // Show success message
        Alert.alert(
          'Payment Successful! 🎉',
          `You received ${gemsToAdd} gems!\nYour payment of $${pendingItem.cost.toFixed(2)} was processed successfully.`
        );
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancelPayment = () => {
    setPaymentModalVisible(false);
    setPendingItem(null);
    setCardComplete(false);
  };

  // Calendar dynamic cost and limit
  const calendarBoughtCount = userData.calendarBoughtCount ?? 0;
  const maxGoodHabits = userData.maxGoodHabits ?? 1;
  const calendarCost = 10 + 10 * calendarBoughtCount;
  const calendarDisabled = calendarBoughtCount >= 5 || gems < calendarCost;
  // Coins pack (100 coins) cost in gems
  const coinPackCost = 1;
  const coinPackDisabled = gems < coinPackCost;
  // Mega coins pack (1500 coins) cost in gems
  const coinMegaPackCost = 10;
  const coinMegaPackDisabled = gems < coinMegaPackCost;
  // Gems packs (buy gems using coins)
  const gemPackCostCoins = 100;
  const gemPackDisabled = coins < gemPackCostCoins;
  const gemMegaPackCostCoins = 1500;
  const gemMegaPackDisabled = coins < gemMegaPackCostCoins;
  
  // Daily Coins claim state
  const getTodayStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayStr = getTodayStr();
  const lastDailyClaim = (userData as any).dailyCoinsLastClaimDate;
  const dailyCoinsClaimedToday = lastDailyClaim === todayStr;
  const handleClaimDailyCoins = () => {
    if (dailyCoinsClaimedToday) {
      Alert.alert('Already claimed', 'Come back tomorrow!');
      return;
    }
    setUserData((prev: any) => ({
      ...prev,
      coins: (prev.coins || 0) + 100,
      dailyCoinsLastClaimDate: todayStr,
    }));
  };
  // Daily Gems claim state
  const lastDailyGemsClaim = (userData as any).dailyGemsLastClaimDate;
  const dailyGemsClaimedToday = lastDailyGemsClaim === todayStr;
  const handleClaimDailyGems = () => {
    if (dailyGemsClaimedToday) {
      Alert.alert('Already claimed', 'Come back tomorrow!');
      return;
    }
    setUserData((prev: any) => ({
      ...prev,
      gems: (prev.gems || 0) + 1,
      dailyGemsLastClaimDate: todayStr,
    }));
  };

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
              <Text style={[styles.itemText, { flexWrap: 'wrap', width: '90%', maxWidth: 100 }]}>Calendar</Text>
              <Image source={require('../assets/items/calendar.png')} style={styles.itemImage} />
              <Text style={[styles.itemDescription, { flexWrap: 'wrap', width: '90%', maxWidth: 100 }]}>Add one good habit slot</Text>
            </View>
            <View style={styles.buyButtonContainer}>
              <TouchableOpacity
                style={[styles.buyButton, calendarDisabled && { backgroundColor: '#ccc' }]}
                onPress={() => handleBuyPress('Calendar', calendarCost)}
                disabled={calendarDisabled}
              >
                <View style={styles.buyButtonContentColumn}>
                  {calendarBoughtCount >= 5 ? (
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Max</Text>
                  ) : (
                    <>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Buy</Text>
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
              <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyPress('Fertilizer', 3)}>
                <View style={styles.buyButtonContentColumn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Buy</Text>
                  <View style={styles.buyButtonPriceRow}>
                    <Image source={require('../assets/gem.png')} style={styles.priceIconInButton} />
                    <Text style={styles.priceTextInButton}>3</Text>
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
              <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyPress('Shovel', 1)}>
                <View style={styles.buyButtonContentColumn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Buy</Text>
                  <View style={styles.buyButtonPriceRow}>
                    <Image source={require('../assets/gem.png')} style={styles.priceIconInButton} />
                    <Text style={styles.priceTextInButton}>1</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* New label below the three boxes */}
        <View style={[styles.sectionLabelBox, { marginTop: 0 }]}>
           <Text style={styles.sectionLabelText}>Coins</Text>
         </View>
        {/* Coins section boxes - identical layout to the three boxes on top */}
        <View style={styles.itemsGrid}>
          {/* Daily Coins (first box in this row) */}
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={styles.itemBoxSmall}>
              <Text style={[styles.itemText, { flexWrap: 'wrap', width: '90%', maxWidth: 100 }]}>Daily Coins</Text>
              <Image source={require('../assets/coin.png')} style={styles.itemImage} />
              <Text style={[styles.itemDescription, { flexWrap: 'wrap', width: '90%', maxWidth: 100 }]}>Claim 100 coins every day!</Text>
            </View>
            <View style={styles.buyButtonContainer}>
              <TouchableOpacity
                style={[styles.buyButton, dailyCoinsClaimedToday && { backgroundColor: '#ccc' }]}
                onPress={handleClaimDailyCoins}
                disabled={dailyCoinsClaimedToday}
              >
                <View style={styles.buyButtonContentColumn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{dailyCoinsClaimedToday ? 'Claimed' : 'Free'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {/* 100 coins pack (second box) */}
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={styles.itemBoxSmall}>
              <Text style={[styles.itemText, { flexWrap: 'wrap', width: '90%', maxWidth: 100 }]}>100 coins</Text>
              <Image source={require('../assets/coin.png')} style={styles.itemImage} />
              <Text style={[styles.itemDescription, { flexWrap: 'wrap', width: '90%', maxWidth: 100 }]}>A small pile of 100 coins</Text>
            </View>
            <View style={styles.buyButtonContainer}>
              <TouchableOpacity
                style={[styles.buyButton, coinPackDisabled && { backgroundColor: '#ccc' }]}
                onPress={() => handleBuyPress('100 coins', coinPackCost)}
                disabled={coinPackDisabled}
              >
                <View style={styles.buyButtonContentColumn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Buy</Text>
                  <View style={styles.buyButtonPriceRow}>
                    <Image source={require('../assets/gem.png')} style={styles.priceIconInButton} />
                    <Text style={styles.priceTextInButton}>{coinPackCost}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {/* Example item: Shovel */}
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={styles.itemBoxSmall}>
              <Text style={styles.itemText}>1500 coins</Text>
              {/* Stacked coin icons */}
              <View style={{ width: 72, height: 48, position: 'relative', marginBottom: 6 }}>
                <Image source={require('../assets/coin.png')} style={{ position: 'absolute', width: 36, height: 36, left: 28, top: 0 }} />
                <Image source={require('../assets/coin.png')} style={{ position: 'absolute', width: 36, height: 36, left: 14, top: 6 }} />
                <Image source={require('../assets/coin.png')} style={{ position: 'absolute', width: 36, height: 36, left: 0, top: 12 }} />
              </View>
              <Text style={styles.itemDescription}>A big pile of 1500 coins</Text>
            </View>
            <View style={styles.buyButtonContainer}>
              <TouchableOpacity
                style={[styles.buyButton, coinMegaPackDisabled && { backgroundColor: '#ccc' }]}
                onPress={() => handleBuyPress('1500 coins', coinMegaPackCost)}
                disabled={coinMegaPackDisabled}
              >
                <View style={styles.buyButtonContentColumn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Buy</Text>
                  <View style={styles.buyButtonPriceRow}>
                    <Image source={require('../assets/gem.png')} style={styles.priceIconInButton} />
                    <Text style={styles.priceTextInButton}>{coinMegaPackCost}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Gems label and section */}
        <View style={[styles.sectionLabelBox, { marginTop: 0 }]}>
           <Text style={styles.sectionLabelText}>Gems</Text>
        </View>
        <View style={styles.itemsGrid}>
          {/* Daily Gems (first box in this row) */}
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={styles.itemBoxSmall}>
              <Text style={[styles.itemText, { flexWrap: 'wrap', width: '90%', maxWidth: 100 }]}>Daily Gems</Text>
              <Image source={require('../assets/gem.png')} style={styles.itemImage} />
              <Text style={[styles.itemDescription, { flexWrap: 'wrap', width: '90%', maxWidth: 100 }]}>Claim 1 gem every day!</Text>
            </View>
            <View style={styles.buyButtonContainer}>
              <TouchableOpacity
                style={[styles.buyButton, dailyGemsClaimedToday && { backgroundColor: '#ccc' }]}
                onPress={handleClaimDailyGems}
                disabled={dailyGemsClaimedToday}
              >
                <View style={styles.buyButtonContentColumn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{dailyGemsClaimedToday ? 'Claimed' : 'Free'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {/* 20 Gems IAP placeholder (second box) */}
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={styles.itemBoxSmall}>
              <Text style={[styles.itemText, { flexWrap: 'wrap', width: '90%', maxWidth: 100 }]}>20 Gems</Text>
              {/* Stacked gem icons (3) */}
              <View style={{ width: 72, height: 48, position: 'relative', marginBottom: 6 }}>
                <Image source={require('../assets/gem.png')} style={{ position: 'absolute', width: 36, height: 36, left: 28, top: 0 }} />
                <Image source={require('../assets/gem.png')} style={{ position: 'absolute', width: 36, height: 36, left: 14, top: 6 }} />
                <Image source={require('../assets/gem.png')} style={{ position: 'absolute', width: 36, height: 36, left: 0, top: 12 }} />
              </View>
              <Text style={[styles.itemDescription, { flexWrap: 'wrap', width: '90%', maxWidth: 100 }]}>A bundle of 20 gems!</Text>
            </View>
            <View style={styles.buyButtonContainer}>
              <TouchableOpacity
                style={styles.buyButton}
                onPress={() => handleBuyPress('20 Gems', 0.99, 'usd', 20)}
              >
                <View style={styles.buyButtonContentColumn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Buy</Text>
                  <View style={styles.buyButtonPriceRow}>
                    <Text style={styles.priceTextInButton}>$0.99</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {/* 100 gems IAP (third box) */}
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={styles.itemBoxSmall}>
              <Text style={[styles.itemText, { flexWrap: 'wrap', width: '90%', maxWidth: 100, lineHeight: 18, marginBottom: 0 }]}>100 gems</Text>
              {/* Stacked gem icons (2 rows: 3 on top, 4 on bottom), tighter overlap and adjusted alignment */}
              <View style={{ width: 74, height: 56, position: 'relative', marginTop: -2, marginBottom: 0 }}>
                {/* Top row (3 overlapped) - shifted slightly right */}
                <Image source={require('../assets/gem.png')} style={{ position: 'absolute', width: 22, height: 22, left: 34, top: 6 }} />
                <Image source={require('../assets/gem.png')} style={{ position: 'absolute', width: 22, height: 22, left: 22, top: 10 }} />
                <Image source={require('../assets/gem.png')} style={{ position: 'absolute', width: 22, height: 22, left: 12, top: 14 }} />
                {/* Bottom row (4 overlapped) - moved right and up for more overlap */}
                <Image source={require('../assets/gem.png')} style={{ position: 'absolute', width: 22, height: 22, left: 42, top: 16 }} />
                <Image source={require('../assets/gem.png')} style={{ position: 'absolute', width: 22, height: 22, left: 30, top: 20 }} />
                <Image source={require('../assets/gem.png')} style={{ position: 'absolute', width: 22, height: 22, left: 20, top: 24 }} />
                <Image source={require('../assets/gem.png')} style={{ position: 'absolute', width: 22, height: 22, left: 10, top: 28 }} />
              </View>
              <Text style={[styles.itemDescription, { flexWrap: 'wrap', width: '90%', maxWidth: 100, marginTop: 0, lineHeight: 13 }]}>A big bundle of 100 gems</Text>
            </View>
            <View style={styles.buyButtonContainer}>
              <TouchableOpacity
                style={styles.buyButton}
                onPress={() => handleBuyPress('100 Gems', 1.99, 'usd', 100)}
              >
                <View style={styles.buyButtonContentColumn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Buy</Text>
                  <View style={styles.buyButtonPriceRow}>
                    <Text style={styles.priceTextInButton}>$1.99</Text>
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
                pendingItem.name === 'Shovel' ? (
                  <Text style={{ fontSize: 16, color: '#7c4d00', marginBottom: 8, textAlign: 'center' }}>
                    Coming Soon!
                  </Text>
                ) : (
                  <>
                    <Text style={{ fontSize: 16, color: '#7c4d00', marginBottom: 8, textAlign: 'center' }}>
                      Are you sure you want to buy <Text style={{ fontWeight: 'bold' }}>{pendingItem.name}</Text> for <Text style={{ fontWeight: 'bold' }}>{pendingItem.cost} {pendingItem.currency}</Text>?
                    </Text>
                  </>
                )
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
                <Button title="Cancel" onPress={handleCancelBuy} color="#888" />
                <View style={{ width: 12 }} />
                <Button title="Confirm" onPress={handleConfirmBuy} color="#4bbf7f" />
              </View>
            </View>
          </View>
        </Modal>

        {/* Stripe Payment Modal */}
        <Modal
          visible={paymentModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={handleCancelPayment}
        >
          <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }} contentContainerStyle={{ padding: 20 }}>
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>
                Complete Payment
              </Text>
              
              {pendingItem && (
                <View style={{ alignItems: 'center', marginBottom: 30, backgroundColor: '#fff', padding: 20, borderRadius: 16, width: '100%' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#7c4d00', marginBottom: 10 }}>
                    {pendingItem.name}
                  </Text>
                  <Text style={{ fontSize: 16, color: '#666', marginBottom: 10 }}>
                    {pendingItem.gemsAmount} Gems
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4bbf7f' }}>
                    ${pendingItem.cost.toFixed(2)}
                  </Text>
                </View>
              )}

                            <View style={{ width: '100%', marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' }}>
                  Card Details:
                </Text>
                <View style={{
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e0e0e0',
                  padding: 5,
                  marginVertical: 10,
                }}>
                  <CardField
                    postalCodeEnabled={true}
                    autofocus={true}
                    placeholders={{
                      number: '4242 4242 4242 4242',
                      postalCode: '12345',
                    }}
                    cardStyle={{
                      backgroundColor: '#FFFFFF',
                      textColor: '#000000',
                      placeholderColor: '#999999',
                      fontSize: 16,
                    }}
                    style={{
                      height: 50,
                      width: '100%',
                    }}
                    onCardChange={(cardDetails) => {
                      console.log('Card details:', cardDetails);
                      setCardComplete(cardDetails.complete);
                    }}
                  />
                </View>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                    💳 Test card: 4242 4242 4242 4242
                    📅 Expiry: 12/34 (any future date)
                    🔒 CVC: 123 (any 3 digits)
                    📍 ZIP: 12345 (any 5 digits)
                  </Text>
              </View>

              <TouchableOpacity
                style={[
                  {
                    backgroundColor: '#4bbf7f',
                    padding: 18,
                    borderRadius: 10,
                    alignItems: 'center',
                    width: '100%',
                    marginVertical: 20,
                  },
                  (!cardComplete || paymentLoading) && { backgroundColor: '#ccc' },
                ]}
                onPress={handleStripePayment}
                disabled={!cardComplete || paymentLoading}
              >
                {paymentLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                    Pay ${pendingItem?.cost.toFixed(2)}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  padding: 12,
                  alignItems: 'center',
                  width: '100%',
                }}
                onPress={handleCancelPayment}
                disabled={paymentLoading}
              >
                <Text style={{ color: '#666', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>

              <View style={{ backgroundColor: '#e8f5e9', padding: 15, borderRadius: 10, marginTop: 20, width: '100%' }}>
                <Text style={{ fontSize: 14, color: '#2e7d32', lineHeight: 22 }}>
                  💳 Your payment is secured by Stripe{'\n'}
                  🔒 SSL encrypted connection{'\n'}
                  ✅ PCI compliant
                </Text>
              </View>
            </View>
          </ScrollView>
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
    minHeight: 40,
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
    marginTop: 2,
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
    marginTop: 0,
    marginBottom: 6,
    gap: 12,
  },
  sectionLabelBox: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 14,
    marginTop: '12%',
    marginBottom: 16,
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
    fontSize: 16,
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
  buyButtonFullWidth: {
    width: 110,
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