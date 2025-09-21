import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Layout,
  TopNavigation,
  TopNavigationAction,
  useTheme,
  Icon,
  IconProps,
  IconElement,
  Text
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductsTab from "./products/productsTab";
import { useRouter } from "expo-router";
import { BellDot, Plus } from "lucide-react-native";
import { useUser } from "@clerk/clerk-expo";
import { colors, spacing } from "@/constants/theme";

// Icons for the tabs
const BellIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="Bell" />
);

const PlusIcon = (props: IconProps): IconElement => (
  <Plus {...props} size={20} color={colors.primary} />
);

export default function ProductsScreen({unread} : {unread : number}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ProductsTab theme={theme} unread={unread} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  safeArea: {
    flex: 1,
  },
});
