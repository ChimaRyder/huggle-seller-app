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
        <Text category="label" style={styles.label}>{label}</Text>
        <Text category="p2" style={styles.value}>{value}</Text>
      </View>
      <TouchableOpacity onPress={onEditPress}>
        <Text style={styles.editButton}>Edit</Text>
      </TouchableOpacity>
      <Divider style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  contentContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  label: {
    color: '#888',
    marginBottom: 4,
  },
  value: {
    color: '#333',
    marginBottom: 8,
  },
  editButton: {
    color: '#4CAF50',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  divider: {
    backgroundColor: '#f0f0f0',
  },
});
