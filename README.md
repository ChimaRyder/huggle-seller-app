# Huggle Seller App

The Huggle Seller App is a mobile application built with Expo and React Native, designed to empower sellers on the Huggle platform. It assists sellers in managing their stores, products, orders, and communications with customers.

## 🚀 Features

-   **Seller Registration**: smooth onboarding process for new sellers.
-   **Store Management**: Manage store details and statistics.
-   **Product Management**: Create, update, and manage products and bundles.
-   **Communication**: Real-time chat with customers using Stream Chat.
-   **Notifications**: Stay updated with important events via Firebase and Expo Notifications.
-   **Geolocation**: Location-based services using Google Maps.

## 🛠 Tech Stack

-   **Framework**: [Expo](https://expo.dev/) (SDK 50+) & [React Native](https://reactnative.dev/)
-   **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
-   **UI Library**: [UI Kitten](https://akveo.github.io/react-native-ui-kitten/) & [Eva Design System](https://eva.design/)
-   **Authentication**: [Clerk](https://clerk.com/)
-   **State Management**: React Context (Chat & Notification contexts)
-   **Backend Integration**: Axios for REST API
-   **Real-time Chat**: [Stream Chat](https://getstream.io/chat/)
-   **Maps**: [React Native Maps](https://github.com/react-native-maps/react-native-maps)
-   **Date Handling**: React Native DateTimePicker
-   **Validation**: Formik & Yup

## 🏗 Architecture

The project follows a modular and scalable architecture:

-   **`app/`**: Contains the route structure.
    -   `(auth)`: Authentication screens (outside the main app flow).
    -   `(main)`: Main application screens (likely tab-based).
    -   `(seller-registration)`: Dedicated flow for registering a new seller.
-   **`components/`**: Reusable UI components.
-   **`context/`**: Global state management providers (e.g., `ChatContext`, `NotificationContext`).
-   **`utils/`**:
    -   **`api.ts`**: Centralized API client using Axios.
    -   **`Controllers/`**: Business logic and API interaction layers.
    -   **`productAdapter.ts`**: Adapters for transforming product data.
-   **`hooks/`**: Custom React hooks.

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (LTS recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
-   **Mobile Development Environment**:
    -   [Android Studio](https://developer.android.com/studio) (for Android Emulator)
    -   [Xcode](https://developer.apple.com/xcode/) (for iOS Simulator - macOS only)
    -   [Expo Go](https://expo.dev/client) app on your physical device.

## 🔑 Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
EXPO_PUBLIC_BACKEND_URL=your_backend_api_url
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# Add other keys as required by your specific configuration
```

## 📦 Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd huggle-seller-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

## 🏃‍♂️ Running the App

Start the development server:

```bash
npx expo start
```

This will create a QR code in the terminal.

-   **Scan with Expo Go** (Android) or **Camera app** (iOS) to run on your physical device.
-   Press `a` to run on Android Emulator.
-   Press `i` to run on iOS Simulator.
-   Press `w` to run on Web (if configured).

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📝 Scripts

-   `npm start`: Starts the Expo development server.
-   `npm run android`: Runs the app on Android.
-   `npm run ios`: Runs the app on iOS.
-   `npm run web`: Runs the app in a web browser.
-   `npm run lint`: Lints the codebase using Expo's linting configuration.
-   `npm run reset-project`: Resets the project structure.

## 📄 License

[License Name]
