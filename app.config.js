import dotenv from "dotenv";
dotenv.config();

export default {
  expo: {
    owner: "huggle",
    name: "Huggle Seller",
    slug: "huggle-seller-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.huggle.sellerapp",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#ffffff",
      },
      softwareKeyboardLayoutMode: "pan",
      package: "com.huggle.sellerapp",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      googleServicesFile: "./google-services.json",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/logo.png",
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/images/logo.png",
          color: "#ffffff",
          sounds: [],
        },
      ],
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 1024,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-font",
      "expo-web-browser",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to access your location.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "a60f91f8-061a-48ab-971c-58e262f17caa",
      },
    },
  },
};
