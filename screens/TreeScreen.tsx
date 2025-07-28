import React, { useState } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';

export default function TreeScreen() {
  const [exp, setExp] = useState(50);
  const [decay, setDecay] = useState(50);
  const [coins, setCoins] = useState(100);
  const [gems, setGems] = useState(10);
  return (
    <View style={{flex: 1}}>
      <View style={[styles.balanceBarContainer, { top: 70 }]}>
        <View style={styles.balanceBar}>
          <Image source={require('../assets/coin.png')} style={styles.balanceIcon} />
          <Text style={styles.balanceText}>{coins}</Text>
        </View>
        <View style={styles.balanceBar}>
          <Image source={require('../assets/gem.png')} style={styles.balanceIcon} />
          <Text style={styles.balanceText}>{gems}</Text>
        </View>
      </View>
      {/* Top 70%: Tree background */}
      <View style={{flex: 7}}>
        <ImageBackground source={require('../assets/tree_background.png')} style={styles.treeBg}>
          <View style={styles.screen}>
            {/* Tree image and other content can go here */}
          </View>
        </ImageBackground>
      </View>
      {/* Bottom 30%: Brown frame with progress bars */}
      <View style={styles.treeFrame}>
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'column' }}>
          {/* Green bar at top, 80% width, centered, EXP box in left 10% */}
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 8 }}>
            {/* Left padding equal to coin/gem bar left (10px) */}
            <View style={{ width: 10 }} />
            {/* EXP box */}
            <View style={{ justifyContent: 'center', alignItems: 'flex-end', height: 20 }}>
              <View style={{ height: 20, minWidth: 38, backgroundColor: '#4bbf7f', borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingLeft: 8, paddingRight: 8 }}>
                <Text style={{ color: '#176d3b', fontWeight: 'bold', fontSize: 12 }}>EXP</Text>
              </View>
            </View>
            {/* Padding equal to left padding (10px) */}
            <View style={{ width: 10 }} />
            {/* Green bar, width 70% of screen minus exp box and paddings */}
            <View style={{ flex: 1, minWidth: 0, justifyContent: 'center', alignItems: 'center', height: 20 }}>
              <View style={[styles.progressBarBg, { width: '100%', height: 20, marginVertical: 0 }]}> 
                <View style={[styles.progressBar, { width: `${exp}%`, backgroundColor: '#4bbf7f', height: 20 }]} />
              </View>
            </View>
            {/* Padding equal to exp box width + paddings (38+8+8=54px) */}
            <View style={{ width: 54 }} />
          </View>
          {/* Red bar below, 50% width, thinner and closer */}
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', height: 12 }}>
            {/* Further increased left padding */}
            <View style={{ width: 64 }} />
            {/* Decay label box */}
            <View style={{ justifyContent: 'center', alignItems: 'flex-end', height: 12 }}>
              <View style={{ height: 12, minWidth: 38, backgroundColor: '#ff0000', borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingLeft: 6, paddingRight: 6 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>decay</Text>
              </View>
            </View>
            {/* Decreased padding between box and bar */}
            <View style={{ width: 8 }} />
            {/* Red progress bar, even shorter width (40% of available space) */}
            <View style={[styles.progressBarBg, { width: '40%', height: 12, backgroundColor: '#eee', borderRadius: 6, marginVertical: 0 }]}> 
              <View style={[styles.progressBar, { width: `${decay}%`, backgroundColor: '#ff0000', height: 12, borderRadius: 6 }]} />
            </View>
            {/* Further increased right padding to match left + box + between */}
            <View style={{ width: 64 + 38 + 24 }} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeBg: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-end',
  },
  treeFrame: {
    height: '30%',
    backgroundColor: 'brown',
    borderWidth: 0,
    borderColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  progressBarContainer: {
    width: '40%',
    marginBottom: 0,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 20,
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 5,
  },
  progressBar: {
    height: 20,
    borderRadius: 10,
  },
  balanceBarContainer: {
    position: 'absolute',
    top: 70,
    left: 10,
    zIndex: 10,
  },
  balanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
    minWidth: 80,
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
});
