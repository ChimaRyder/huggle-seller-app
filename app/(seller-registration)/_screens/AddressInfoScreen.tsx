import React, { useState, useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import {
  Input,
  Select,
  SelectItem,
  IndexPath,
  Button,
  Text,
} from "@ui-kitten/components";
import { Formik } from "formik";
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
  const [mapVisible, setMapVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 14.5995, // Default to Philippines
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Request location permission on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    })();
  }, []);

  const selectedProvinceIndex = formData.province
    ? new IndexPath(provinces.indexOf(formData.province))
    : new IndexPath(0);

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


            <View style={styles.mapContainer}>
                <Text category="c2" appearance="hint" style={styles.mapLabel}>
                  Set Location
                </Text>
                <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={currentLocation}
                onRegionChangeComplete={(region) => {
                  setCurrentLocation(region);
                  setFieldValue("latitude", region.latitude);
                  setFieldValue("longitude", region.longitude);
                }}
              >
                <Marker
                  coordinate={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  draggable
                  onDragEnd={(e) => {
                    setFieldValue(
                      "latitude",
                      e.nativeEvent.coordinate.latitude
                    );
                    setFieldValue(
                      "longitude",
                      e.nativeEvent.coordinate.longitude
                    );
                  }}
                />
              </MapView>
              <Text category="c1" appearance="hint" style={styles.mapInstructions}>
                Drag the marker to pinpoint your exact location
              </Text>
            </View>

            <Input
              label="Registered Address"
              placeholder="Enter your street address"
              value={values.address}
              onChangeText={handleChange("address")}
              onBlur={handleBlur("address")}
              caption={
                touched.address && errors.address
                  ? errors.address
                  : "Please enter your complete street address including building/unit number"
              }
              status={touched.address && errors.address ? "danger" : "basic"}
              style={styles.input}
              multiline={true}
              textStyle={{ minHeight: 64 }}
            />

            <Input
              label="City"
              placeholder="Enter your city"
              value={values.city}
              onChangeText={handleChange("city")}
              onBlur={handleBlur("city")}
              caption={touched.city && errors.city ? errors.city : ""}
              status={touched.city && errors.city ? "danger" : "basic"}
              style={styles.input}
            />

            <Select
              label="Province"
              placeholder="Select your province"
              value={values.province}
              selectedIndex={selectedProvinceIndex}
              onSelect={(index) => {
                const selectedIndex = index as IndexPath;
                const selectedValue = provinces[selectedIndex.row];
                setFieldValue("province", selectedValue);
              }}
              caption={
                touched.province && errors.province ? errors.province : ""
              }
              status={
                touched.province && errors.province ? "danger" : "basic"
              }
              style={styles.input}
            >
              {provinces.sort().map((province, index) => (
                <SelectItem key={index} title={province} />
              ))}
            </Select>

            <Input
              label="Zip Code"
              placeholder="Enter your zip code"
              value={values.zipCode}
              onChangeText={handleChange("zipCode")}
              onBlur={handleBlur("zipCode")}
              caption={
                touched.zipCode && errors.zipCode ? errors.zipCode : ""
              }
              status={touched.zipCode && errors.zipCode ? "danger" : "basic"}
              keyboardType="numeric"
              style={styles.input}
            />

            
            
        </FormLayout>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
  mapContainer: {
    height: 400,
    width: "100%",
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: 350,
    borderRadius: 8,
  },
  mapButton: {
    marginTop: 10,
  },
  mapPickerButton: {
    marginBottom: 16,
  },
  mapInstructions: {
    marginVertical: 8,
    textAlign: "center",
  },
  coordinatesText: {
    textAlign: "center",
    marginBottom: 16,
  },
  mapLabel: {
    marginBottom: 8,
    fontWeight: "bold",
    textAlign: "center",
  }
});

export default AddressInfoScreen;
