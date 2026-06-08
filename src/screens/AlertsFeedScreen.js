import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';

const MOCK_ALERTS = [
  { id: '1', farm_name: 'North Field', action: 'Irrigate immediately - moisture critically low', cost_inr: 1200, timestamp: '2 hours ago' },
  { id: '2', farm_name: 'South Field', action: 'Apply pesticide - pest activity detected', cost_inr: 800, timestamp: '5 hours ago' },
  { id: '3', farm_name: 'North Field', action: 'Check drainage - waterlogging risk', cost_inr: 500, timestamp: '1 day ago' },
  { id: '4', farm_name: 'East Plot', action: 'Add nitrogen fertilizer - nutrient deficiency', cost_inr: 1500, timestamp: '2 days ago' },
];

export const AlertsFeedScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setAlerts(MOCK_ALERTS);
      setRefreshing(false);
    }, 600);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.alertCard}
      onPress={() => navigation.navigate('InterventionDetail', { alertId: item.id })}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardText}>
          <Text style={styles.farmName}>{item.farm_name}</Text>
          <Text style={styles.actionText}>{item.action}</Text>
          <View style={styles.row}> 
            <Text style={styles.costText}>₹{item.cost_inr}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Alerts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
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
    paddingTop: 54,
    paddingBottom: 18,
    paddingHorizontal: 24,
    backgroundColor: '#183526',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#A8E6A1',
    fontSize: 16,
    fontWeight: '600',
  },
  heading: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  list: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#b71c1c',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardText: {
    flex: 1,
  },
  farmName: {
    color: '#1a3c2e',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  actionText: {
    color: '#2e7d32',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costText: {
    color: '#1a3c2e',
    fontSize: 15,
    fontWeight: '700',
  },
  timestamp: {
    color: '#7a7a7a',
    fontSize: 13,
  },
});
