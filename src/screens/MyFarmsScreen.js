import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const MOCK_FARMS = [
  { id: 'farm_001', name: 'North Field', crop_type: 'Wheat', health_score: 72, zone_type: 'drought' },
  { id: 'farm_002', name: 'South Field', crop_type: 'Rice', health_score: 88, zone_type: 'healthy' },
];

export const MyFarmsScreen = ({ navigation }) => {
  const renderFarm = ({ item }) => {
    const healthBadgeStyle = item.health_score < 75 ? styles.healthBadgePoor : styles.healthBadgeGood;
    const healthTextStyle = item.health_score < 75 ? styles.healthBadgeTextPoor : styles.healthBadgeTextGood;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('FarmDetail', { farm: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.farmName}>{item.name}</Text>
          <View style={[styles.healthBadge, healthBadgeStyle]}>
            <Text style={[styles.healthText, healthTextStyle]}>{item.health_score}</Text>
          </View>
        </View>

        <Text style={styles.cropType}>{item.crop_type}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.zoneChip}>
            <Text style={styles.zoneText}>{item.zone_type}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Farms</Text>
      </View>

      <FlatList
        data={MOCK_FARMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderFarm}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3c2e',
  },
  header: {
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 24,
    backgroundColor: '#183526',
    borderBottomWidth: 1,
    borderBottomColor: '#21412e',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  list: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#224f38',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  farmName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    marginRight: 12,
  },
  cropType: {
    color: '#C6EBC5',
    fontSize: 16,
    marginBottom: 14,
  },
  healthBadge: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 56,
    alignItems: 'center',
  },
  healthBadgeGood: {
    backgroundColor: '#2e7d32',
  },
  healthBadgePoor: {
    backgroundColor: '#b71c1c',
  },
  healthText: {
    fontSize: 14,
    fontWeight: '700',
  },
  healthBadgeTextGood: {
    color: '#E8F5E9',
  },
  healthBadgeTextPoor: {
    color: '#FFEBEE',
  },
  cardFooter: {
    flexDirection: 'row',
  },
  zoneChip: {
    backgroundColor: '#183526',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  zoneText: {
    color: '#B8E6B8',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
