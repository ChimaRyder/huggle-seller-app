import React, { useState } from 'react';
import { Card, Text, Input, Button, Modal, ThemeType, Layout } from '@ui-kitten/components';
import { StyleSheet, View, ImageBackground, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AlertCircle, CheckCircle, X, Save, Calendar } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';

interface InventoryProductItemProps {
  item: any;
  theme: ThemeType;
  onStockChange: (productId: string, newStock: number, newExpiryDate: Date) => void;
  isUpdating?: boolean;
}

const InventoryProductItem: React.FC<InventoryProductItemProps> = ({ 
  item, 
  theme, 
  onStockChange,
  isUpdating = false
}) => {
  const [stockValue, setStockValue] = useState(String(item.stock || 0));
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Default to 30 days from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasStockChanged, setHasStockChanged] = useState(false);

  const getStatusColor = () => {
    if (!item || !item.isActive) return colors.danger;
    const stock = Number(item.stock || 0);
    if (stock <= 10) return colors.warning;
    return colors.success;
  };

  const getStatusIcon = () => {
    if (!item || !item.isActive) return <X size={12} color={colors.danger} />;
    const stock = Number(item.stock || 0);
    if (stock <= 10) return <AlertCircle size={12} color={colors.warning} />;
    return <CheckCircle size={12} color={colors.success} />;
  };

  const getStockStatus = () => {
    if (!item || !item.isActive) return 'Inactive';
    const stock = Number(item.stock || 0);
    if (stock <= 5) return 'Very Low';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };

  const handleStockChange = (value: string) => {
    setStockValue(value);
    const newStock = parseInt(value) || 0;
    const oldStock = parseInt(item.stock) || 0;
    setHasStockChanged(newStock !== oldStock);
  };

  const handleSave = () => {
    const newStock = parseInt(stockValue) || 0;
    
    // Always require expiry date when updating stock
    if (newStock !== item.stock) {
      setShowExpiryModal(true);
      return;
    }
    
    // If stock hasn't changed, just reset the UI
    setHasStockChanged(false);
  };

  const handleExpiryUpdate = () => {
    if (expiryDate <= new Date()) {
      Alert.alert('Error', 'Expiry date must be in the future.');
      return;
    }

    const newStock = parseInt(stockValue) || 0;
    onStockChange(item.id, newStock, expiryDate);
    setShowExpiryModal(false);
    setExpiryDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Reset to default
    setHasStockChanged(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Safety check for item
  if (!item) {
    return (
      <Card style={styles.productCard}>
        <Text>Loading...</Text>
      </Card>
    );
  }
  
  return (
    <>
      <Card style={[styles.productCard, !item.isActive && styles.inactiveCard]}>
        <View style={styles.productContent}>
          <Layout level='3' style={styles.productImagePlaceholder}>
            <ImageBackground source={{ uri: item.coverImage }} style={styles.productImage}>
              {/* Status Badge */}
              <View style={styles.statusBadge}>
                {getStatusIcon()}
              </View>

              {/* Original Price Badge (if discounted) */}
              {Number(item.originalPrice || 0) > Number(item.discountedPrice || 0) ? (
                <View style={styles.discountBadge}>
                  <Text category="c2" style={styles.discountText}>
                    {`${Math.round(((Number(item.originalPrice || 0) - Number(item.discountedPrice || 0)) / Number(item.originalPrice || 1)) * 100)}% OFF`}
                  </Text>
                </View>
              ) : null}
            </ImageBackground>
          </Layout>

          <View style={styles.productInfo}>
            <Text category="s1" style={styles.productName} numberOfLines={2}>
              {String(item.name || 'Untitled Product')}
            </Text>

            <View style={styles.priceSection}>
              <Text category="h6" status='primary'>{`₱${Number(item.discountedPrice || 0).toFixed(2)}`}</Text>
              {Number(item.originalPrice || 0) > Number(item.discountedPrice || 0) ? (
                <Text category="c2" appearance='hint' style={styles.originalPrice}>
                  {`₱${Number(item.originalPrice || 0).toFixed(2)}`}
                </Text>
              ) : null}
            </View>

            <View style={styles.productDetails}>
              <View style={styles.stockInfo}>
                <Text category="c2" appearance='hint' style={[styles.stockText, { color: getStatusColor() }]}>
                  {getStockStatus()}
                </Text>
                {!item.isActive && (
                  <Text category="c2" appearance='hint'>
                    {`• Expires: ${formatDate(item.expirationDate || item.expiresOn)}`}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Stock Input Section */}
          <View style={styles.stockSection}>
            <Text category="label" style={styles.stockLabel}>Stock</Text>
            <View style={styles.stockInputContainer}>
              <Input
                style={styles.stockInput}
                value={stockValue}
                onChangeText={handleStockChange}
                keyboardType="number-pad"
                textStyle={styles.stockInputText}
                placeholder="0"
                disabled={isUpdating}
                status={hasStockChanged ? 'primary' : 'basic'}
              />
              {hasStockChanged && (
                <TouchableOpacity 
                  style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]} 
                  onPress={handleSave}
                  disabled={isUpdating}
                >
                  <Save size={16} color={isUpdating ? colors.text.tertiary : colors.icon.inverse} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Card>

      {/* Expiry Date Modal for Inactive Products */}
      <Modal
        visible={showExpiryModal}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setShowExpiryModal(false)}
      >
        <Card disabled={true} style={styles.modal}>
          <Text category="h6" style={styles.modalTitle}>Update Stock & Expiry Date</Text>
          <Text category="c1" appearance="hint" style={styles.modalSubtitle}>
            Please set the expiry date when updating stock to ensure freshness tracking.
          </Text>
          
          <View style={styles.modalSection}>
            <Text category="label" style={styles.modalLabel}>New Expiry Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={16} color={colors.icon.secondary} />
              <Text style={styles.datePickerText}>
                {expiryDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <Text category="c2" appearance="hint" style={styles.modalCaption}>
              Tap to change the expiry date
            </Text>
          </View>
          
          {showDatePicker && (
            <DateTimePicker
              value={expiryDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.modalButtons}>
            <Button
              appearance="ghost"
              size="small"
              onPress={() => setShowExpiryModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              size="small"
              onPress={handleExpiryUpdate}
              style={styles.modalButton}
            >
              Update Stock
            </Button>
          </View>
        </Card>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: '100%',
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 0,
  },
  inactiveCard: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  productContent: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  productImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: radii.md,
    overflow: "hidden",
    position: 'relative',
  },
  productImage: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: spacing.xs,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radii.sm,
    padding: 2,
    alignSelf: 'flex-start',
  },
  discountBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignSelf: 'flex-end',
  },
  discountText: {
    color: 'white',
    fontWeight: typography.fontWeights.semibold,
    fontSize: 8,
  },
  productInfo: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    fontSize: typography.fontSizes.xs,
  },
  productName: {
    lineHeight: typography.fontSizes.md * typography.lineHeights.tight,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.sm,
  },
  productDetails: {
    gap: spacing.xs,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  stockText: {
    fontWeight: typography.fontWeights.medium,
    fontSize: typography.fontSizes.xs,
  },
  stockSection: {
    alignItems: 'center',
    minWidth: 80,
  },
  stockLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  stockInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stockInput: {
    width: 60,
    minHeight: 40,
  },
  stockInputText: {
    textAlign: 'center',
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },

  // Modal styles
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    margin: spacing.md,
    minWidth: 300,
    borderRadius: radii.lg,
    borderWidth: 0,
  },
  modalTitle: {
    marginBottom: spacing.sm,
    textAlign: "center",
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  modalSubtitle: {
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: typography.fontSizes.sm * typography.lineHeights.relaxed,
  },
  modalSection: {
    marginBottom: spacing.md,
  },
  modalLabel: {
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeights.medium,
  },
  modalInput: {
    marginBottom: spacing.xs,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.sm,
    backgroundColor: colors.background.secondary,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  datePickerText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    flex: 1,
  },
  modalCaption: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalButton: {
    flex: 1,
    borderRadius: radii.lg,
  },
});

export default InventoryProductItem;