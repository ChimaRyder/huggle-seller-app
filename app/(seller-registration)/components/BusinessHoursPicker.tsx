import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Clock, ChevronDown, Check } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';

const DAYS = ['SUN','MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
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
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [timeType, setTimeType] = useState<'open' | 'close'>('open');

  // Ensure we have a valid business hours array
  const safeValue = value && Array.isArray(value) && value.length === 7 
    ? value.map(day => ({
        isOpen: day?.isOpen || false,
        openTime: day?.openTime || '',
        closeTime: day?.closeTime || ''
      }))
    : Array(7).fill({ isOpen: false, openTime: '', closeTime: '' });

  const openTimePicker = (dayIndex: number, type: 'open' | 'close') => {
    setCurrentDay(dayIndex);
    setTimeType(type);
    setTimePickerVisible(true);
  };

  const selectTime = (time: string) => {
    const newHours = [...safeValue];
    if (timeType === 'open') {
      newHours[currentDay].openTime = time;
    } else {
      newHours[currentDay].closeTime = time;
    }
    onChange(newHours);
    setTimePickerVisible(false);
  };

  const getDayName = (day: string) => {
    const dayNames = {
      'SUN': 'Sunday',
      'MON': 'Monday',
      'TUE': 'Tuesday',
      'WED': 'Wednesday',
      'THU': 'Thursday',
      'FRI': 'Friday',
      'SAT': 'Saturday'
    };
    return dayNames[day as keyof typeof dayNames] || day;
  };

  return (
    <View style={styles.container}>
      {DAYS.map((day, idx) => (
        <View key={day} style={styles.dayRow}>
          <View style={styles.dayHeader}>
            <TouchableOpacity
              style={[styles.toggleButton, safeValue[idx].isOpen && styles.toggleButtonActive]}
              onPress={() => {
                const newHours = [...safeValue];
                newHours[idx].isOpen = !newHours[idx].isOpen;
                if (!newHours[idx].isOpen) {
                  newHours[idx].openTime = undefined;
                  newHours[idx].closeTime = undefined;
                } else {
                  newHours[idx].openTime = newHours[idx].openTime || '9:00 AM';
                  newHours[idx].closeTime = newHours[idx].closeTime || '5:00 PM';
                }
                onChange(newHours);
              }}
            >
              {safeValue[idx].isOpen && <Check size={14} color={colors.primary} />}
            </TouchableOpacity>
            <Text style={styles.dayName}>{getDayName(day)}</Text>
          </View>

          {safeValue[idx].isOpen ? (
            <View style={styles.hoursContainer}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => openTimePicker(idx, 'open')}
              >
                <Clock size={16} color={colors.text.secondary} />
                <Text style={styles.timeText}>{safeValue[idx].openTime}</Text>
                <ChevronDown size={16} color={colors.text.secondary} />
              </TouchableOpacity>

              <Text style={styles.toText}>to</Text>

              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => openTimePicker(idx, 'close')}
              >
                <Clock size={16} color={colors.text.secondary} />
                <Text style={styles.timeText}>{safeValue[idx].closeTime}</Text>
                <ChevronDown size={16} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.closedText}>Closed</Text>
          )}
        </View>
      ))}

      {/* Time Picker Modal */}
      <Modal
        visible={timePickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <ScrollView style={styles.timeOptions} showsVerticalScrollIndicator={false}>
              {TIME_OPTIONS.map((time, index) => (
                <TouchableOpacity
                  key={time}
                  style={styles.timeOption}
                  onPress={() => selectTime(time)}
                >
                  <Text style={styles.timeOptionText}>{time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setTimePickerVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: spacing.md,
  },
  dayRow: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  toggleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  dayName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  timeButton: {
    minWidth: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.primary,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.sm,
  },
  timeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  toText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  closedText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  timeOptions: {
    maxHeight: 300,
  },
  timeOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  timeOptionText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
}); 