import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Toggle, Select, SelectItem, IndexPath } from '@ui-kitten/components';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour24 = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minute} ${ampm}`;
});

interface BusinessHourDay {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

interface BusinessHoursPickerProps {
  value: BusinessHourDay[];
  onChange: (val: BusinessHourDay[]) => void;
  errors?: any;
  touched?: any;
}

export default function BusinessHoursPicker({ value, onChange, errors, touched }: BusinessHoursPickerProps) {
  return (
    <View style={styles.container}>
      {DAYS.map((day, idx) => (
        <View key={day} style={styles.row}>
          <Toggle
            checked={value[idx].isOpen}
            onChange={checked => {
              const newHours = [...value];
              newHours[idx].isOpen = checked;
              if (!checked) {
                newHours[idx].openTime = undefined;
                newHours[idx].closeTime = undefined;
              } else {
                newHours[idx].openTime = newHours[idx].openTime || '9:00 AM';
                newHours[idx].closeTime = newHours[idx].closeTime || '5:00 PM';
              }
              onChange(newHours);
            }}
            style={styles.toggle}
          >
            {day}
          </Toggle>
          {value[idx].isOpen ? (
            <View style={styles.hoursContainer}>
              <Select
                style={styles.select}
                value={value[idx].openTime}
                selectedIndex={new IndexPath(TIME_OPTIONS.findIndex(t => t === value[idx].openTime))}
                onSelect={index => {
                  const row = (index as IndexPath).row;
                  const newHours = [...value];
                  newHours[idx].openTime = TIME_OPTIONS[row];
                  onChange(newHours);
                }}
              >
                {TIME_OPTIONS.map(time => <SelectItem key={time} title={time} />)}
              </Select>
              <Text style={{ marginHorizontal: 4}}>to</Text>
              <Select
                style={styles.select}
                value={value[idx].closeTime}
                selectedIndex={new IndexPath(TIME_OPTIONS.findIndex(t => t === value[idx].closeTime))}
                onSelect={index => {
                  const row = (index as IndexPath).row;
                  const newHours = [...value];
                  newHours[idx].closeTime = TIME_OPTIONS[row];
                  onChange(newHours);
                }}
              >
                {TIME_OPTIONS.map(time => <SelectItem key={time} title={time} />)}
              </Select>
            </View>
          ) : (
            <Text appearance="hint" style={styles.closedText}>Closed</Text>
          )}
          {touched?.[idx] && errors?.[idx] && (
            <Text appearance="hint" status="danger" style={styles.errorText}>
              {errors[idx].openTime || errors[idx].closeTime}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'column', alignItems: "flex-start", marginBottom: 12, gap: 10 },
  toggle: { minWidth: 110, marginRight: 8 },
  select: { flex: 1 },
  closedText: { marginLeft: 12 },
  errorText: { marginLeft: 8, color: '#FF3D71' },
  container: {width: "100%", display: "flex", gap: 10},
  hoursContainer: {width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"},
}); 