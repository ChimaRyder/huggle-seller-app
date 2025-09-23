import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Dimensions, Text, TextInput, TouchableOpacity, Alert, Modal, ScrollView } from "react-native";
import { Formik } from "formik";
import { MapPin, Navigation, AlertCircle, Crosshair, RotateCcw, CheckCircle, ChevronDown } from "lucide-react-native";
import { colors, spacing, typography, radii } from "@/constants/theme";
import { FormLayout } from "../components/FormLayout";
import { useSellerRegistration } from "../SellerRegistrationContext";
import { addressInfoSchema } from "../../../utils/validationSchemas";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

const provinces = [
  "Ilocos Norte",
  "Ilocos Sur",
  "La Union",
  "Pangasinan",
  "Batanes",
  "Cagayan",
  "Isabela",
  "Nueva Vizcaya",
  "Quirino",
  "Bataan",
  "Bulacan",
  "Nueva Ecija",
  "Pampanga",
  "Tarlac",
  "Zambales",
  "Aurora",
  "Batangas",
  "Cavite",
  "Laguna",
  "Quezon",
  "Rizal",
  "Marinduque",
  "Occidental Mindoro",
  "Oriental Mindoro",
  "Palawan",
  "Romblon",
  "Albay",
  "Camarines Norte",
  "Camarines Sur",
  "Catanduanes",
  "Masbate",
  "Sorsogon",
  "Aklan",
  "Antique",
  "Capiz",
  "Iloilo",
  "Negros Occidental",
  "Guimaras",
  "Bohol",
  "Cebu",
  "Negros Oriental",
  "Siquijor",
  "Eastern Samar",
  "Leyte",
  "Northern Samar",
  "Samar (Western Samar)",
  "Southern Leyte",
  "Biliran",
  "Zamboanga Del Norte",
  "Zamboanga Del Sur",
  "Zamboanga Sibugay",
  "City Of Isabela",
  "Bukidnon",
  "Camiguin",
  "Lanao Del Norte",
  "Misamis Occidental",
  "Misamis Oriental",
  "Davao Del Norte",
  "Davao Del Sur",
  "Davao Oriental",
  "Compostela Valley",
  "Davao Occidental",
  "Cotabato (North Cotabato)",
  "South Cotabato",
  "Sultan Kudarat",
  "Sarangani",
  "Cotabato City",
  "Ncr, City Of Manila, First District",
  "City Of Manila",
  "Ncr, Second District",
  "Ncr, Third District",
  "Ncr, Fourth District",
  "Abra",
  "Benguet",
  "Ifugao",
  "Kalinga",
  "Mountain Province",
  "Apayao",
  "Basilan",
  "Lanao Del Sur",
  "Maguindanao",
  "Sulu",
  "Tawi-tawi",
  "Agusan Del Norte",
  "Agusan Del Sur",
  "Surigao Del Norte",
  "Surigao Del Sur",
  "Dinagat Islands",
];

const AddressInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 14.5995, // Default to Philippines
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [locationStatus, setLocationStatus] = useState<'loading' | 'found' | 'manual' | 'error'>('loading');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Request location permission on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    setLocationStatus('loading');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setCurrentLocation(newLocation);
        setLocationStatus('found');
        // Animate map to new location if map is ready
        if (mapRef.current) {
          mapRef.current.animateToRegion(newLocation, 1000);
        }
      } else {
        setLocationStatus('error');
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to automatically set your business location.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationStatus('error');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const resetToUserLocation = () => {
    getCurrentLocation();
  };

  const handleNext = (values) => {
    updateFormData(values);
    setCurrentStep(5);
  };

  const handleBack = () => {
    setCurrentStep(3);
  };

  return (
    <Formik
      initialValues={{
        ...formData,
        latitude: formData.latitude || currentLocation.latitude,
        longitude: formData.longitude || currentLocation.longitude,
      }}
      validationSchema={addressInfoSchema}
      onSubmit={handleNext}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        setFieldValue,
      }) => (
        <FormLayout
          title="Address Information"
          subtitle="Provide your registered business address"
          onNext={() => handleSubmit()}
          onBack={handleBack}
          isNextDisabled={
            !values.address ||
            !values.city ||
            !values.province ||
            !values.zipCode ||
            !values.latitude ||
            !values.longitude
          }
        >
          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Navigation size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Set Location</Text>
              <View style={styles.locationStatusContainer}>
                {locationStatus === 'found' && (
                  <View style={styles.locationStatus}>
                    <CheckCircle size={16} color={colors.success} />
                    <Text style={styles.locationStatusText}>Location Found</Text>
                  </View>
                )}
                {locationStatus === 'error' && (
                  <View style={[styles.locationStatus, styles.locationStatusError]}>
                    <AlertCircle size={16} color={colors.error} />
                    <Text style={[styles.locationStatusText, { color: colors.error }]}>Manual Setup</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.sectionDescription}>
              Pinpoint your exact business location on the map for accurate deliveries
            </Text>

            {/* Location Action Button */}
            <View style={styles.locationActions}>
              <TouchableOpacity
                style={[styles.actionButton, isLocationLoading && styles.actionButtonDisabled]}
                onPress={resetToUserLocation}
                disabled={isLocationLoading}
              >
                {isLocationLoading ? (
                  <View style={styles.loadingContainer}>
                    <View style={styles.spinner} />
                    <Text style={styles.actionButtonText}>Finding...</Text>
                  </View>
                ) : (
                  <>
                    <Crosshair size={18} color={colors.primary} />
                    <Text style={styles.actionButtonText}>Use Current Location</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Map Container */}
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={currentLocation}
                onPress={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setFieldValue("latitude", latitude);
                  setFieldValue("longitude", longitude);
                  setLocationStatus('manual');
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={true}
                toolbarEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: values.latitude || currentLocation.latitude,
                    longitude: values.longitude || currentLocation.longitude,
                  }}
                  draggable
                  onDragStart={() => setLocationStatus('manual')}
                  onDragEnd={(e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setFieldValue("latitude", latitude);
                    setFieldValue("longitude", longitude);
                  }}
                  title="Your Business Location"
                  description="Tap map or drag marker to adjust"
                />
              </MapView>

              {/* Map Instructions */}
              <View style={styles.mapInstructionsContainer}>
                <Text style={styles.mapInstructions}>
                  {locationStatus === 'loading' ? 'Finding your location...' :
                   'Tap anywhere on the map to set your business location'}
                </Text>
              </View>
            </View>
          </View>

          {/* Address Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Address Details</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Complete address information for your business
            </Text>

            <Text style={styles.label}>Registered Address</Text>
            {errors.address && touched.address && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.address}</Text>
              </View>
            )}
            <TextInput
              style={[
                styles.textAreaInput,
                errors.address && touched.address && { borderColor: colors.error }
              ]}
              multiline
              placeholder="Enter your complete street address including building/unit number"
              placeholderTextColor={colors.text.tertiary}
              value={values.address}
              onChangeText={handleChange("address")}
              onBlur={handleBlur("address")}
              textAlignVertical="top"
            />

            <Text style={styles.label}>City</Text>
            {errors.city && touched.city && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.city}</Text>
              </View>
            )}
            <TextInput
              style={[
                styles.textInput,
                errors.city && touched.city && { borderColor: colors.error }
              ]}
              placeholder="Enter your city"
              placeholderTextColor={colors.text.tertiary}
              value={values.city}
              onChangeText={handleChange("city")}
              onBlur={handleBlur("city")}
            />

            <Text style={styles.label}>Province</Text>
            {errors.province && touched.province && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.province}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.selectInput,
                errors.province && touched.province && { borderColor: colors.error }
              ]}
              onPress={() => setShowProvinceModal(true)}
            >
              <Text style={[
                styles.selectText,
                !values.province && styles.selectPlaceholder
              ]}>
                {values.province || "Select your province"}
              </Text>
              <ChevronDown size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <Text style={styles.label}>Zip Code</Text>
            {errors.zipCode && touched.zipCode && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.zipCode}</Text>
              </View>
            )}
            <TextInput
              style={[
                styles.textInput,
                errors.zipCode && touched.zipCode && { borderColor: colors.error }
              ]}
              placeholder="Enter your zip code"
              placeholderTextColor={colors.text.tertiary}
              value={values.zipCode}
              onChangeText={handleChange("zipCode")}
              onBlur={handleBlur("zipCode")}
              keyboardType="numeric"
            />
          </View>

          {/* Province Selection Modal */}
          <Modal
            visible={showProvinceModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowProvinceModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Province</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowProvinceModal(false)}
                  >
                    <Text style={styles.modalCloseText}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.provinceList}>
                  {provinces.sort().map((province) => (
                    <TouchableOpacity
                      key={province}
                      style={[
                        styles.provinceItem,
                        values.province === province && styles.provinceItemSelected
                      ]}
                      onPress={() => {
                        setFieldValue("province", province);
                        setShowProvinceModal(false);
                      }}
                    >
                      <Text style={[
                        styles.provinceItemText,
                        values.province === province && styles.provinceItemTextSelected
                      ]}>
                        {province}
                      </Text>
                      {values.province === province && (
                        <CheckCircle size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </FormLayout>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  // Sections
  section: {
    backgroundColor: colors.background.primary,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  sectionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },

  // Error handling
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    marginLeft: spacing.xs,
  },

  // Text Inputs
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.md,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    minHeight: 120,
    lineHeight: 22,
    marginBottom: spacing.md,
  },

  // Location Status
  locationStatusContainer: {
    marginLeft: 'auto',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.successSubtle,
    borderRadius: radii.md,
  },
  locationStatusError: {
    backgroundColor: colors.background.dangerSubtle,
  },
  locationStatusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.success,
  },

  // Location Action Button
  locationActions: {
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.sm,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  spinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    borderTopColor: colors.primary,
  },

  // Map Container
  mapContainer: {
    height: 450,
    width: "100%",
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  map: {
    width: "100%",
    height: 400,
  },
  mapInstructionsContainer: {
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  mapInstructions: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 18,
  },

  // Select Input
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.md,
  },
  selectText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    flex: 1,
  },
  selectPlaceholder: {
    color: colors.text.tertiary,
  },

  // Province Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalCloseText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  provinceList: {
    maxHeight: 400,
  },
  provinceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  provinceItemSelected: {
    backgroundColor: colors.background.successSubtle,
  },
  provinceItemText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    flex: 1,
  },
  provinceItemTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
});

export default AddressInfoScreen;
