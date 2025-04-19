import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Divider } from '@ui-kitten/components';

interface DetailItemProps {
  label: string;
  value: string;
  onEditPress: () => void;
}

export default function DetailItem({ label, value, onEditPress }: DetailItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.labelContainer}>
          <Text category="label" style={styles.label}>{label}</Text>
          <TouchableOpacity onPress={onEditPress}>
            <Text category='label' style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        </View>
        <Text category="p2" style={styles.value}>{value}</Text>
      </View>
      
      <Divider style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  contentContainer: {
    flexDirection: 'column',
    flex: 1,
    marginVertical: 16,
  },
  label: {
    color: '#888',
  },
  value: {
    color: '#333',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  editButton: {
    color: '#4CAF50',
    fontWeight: 'light',
  },
  divider: {
    backgroundColor: '#f0f0f0',
  },
});
