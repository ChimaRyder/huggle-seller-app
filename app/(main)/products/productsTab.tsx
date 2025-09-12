import {
  Input,
  Button,
  Text,
  ThemeType,
  Modal,
  Radio,
  RadioGroup,
  Icon,
  IconProps,
  IconElement,
  Layout,
  Spinner
} from "@ui-kitten/components";
import { StyleSheet, View, FlatList } from "react-native";
import renderProductItem from "./components/productItem";
import { useFocusEffect, useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { getAllProducts } from "@/utils/data/ProductController";
import { showToast } from "@/components/Toast";
import { AlertCircle, CookingPot } from "lucide-react-native";


const SearchIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="Search" />
);

const PlusIcon = (props: IconProps): IconElement => (
  <Icon {...props} name='Plus'/>
);

// Product Tab Component
const ProductsTab = ({ theme }: { theme: ThemeType }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Array<any>>([]);
  const [search, setSearch] = useState("");
  const { getToken } = useAuth();
  const { user } = useUser();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = await getToken({ template: "seller_app" });
      const response = await getAllProducts(search, token ?? "");

      const data = ((response as any).data);
      setProducts(data);
    } catch (error) {
      console.error("Error getting products: ", error);
      showToast(
        "error",
        "Uh oh!",
        `Something went wrong while getting your products. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: { nativeEvent: { text: string } }) => {
    setSearch(event.nativeEvent.text);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();

      return () => {
        console.log("product list not focused");
      };
    }, [search])
  );

  return (
    <View style={styles.tabContent}>

      <View style={styles.basketHeader}>
        <Input
          placeholder="Search your products"
          accessoryLeft={SearchIcon}
          style={styles.searchInput}
          onSubmitEditing={onSubmit}
        />
        <Button
          style={styles.addProductButton}
          appearance="outline"
          size="small"
          accessoryLeft={PlusIcon}
          onPress={() => router.push('/(main)/products/createProduct')}
        >
        </Button>
      </View>

        <FlatList
          refreshing={loading}
          onRefresh={fetchProducts}
          data={products}
          renderItem={({ item }) => renderProductItem({ item, theme })}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={(products?.length || 0) === 0 && { flex: 1, justifyContent: 'center' }}
          columnWrapperStyle={styles.productRow}
          ListEmptyComponent={
          <View style={styles.noProductsContainer}>
            <CookingPot size={40} style={styles.noProductsIcon} color={theme['color-basic-600']}/>
            <Text style={styles.noProductsText} appearance="hint">
              No Products Found
            </Text>
            <Button
              status="primary"
              size="large"
              onPress={() => router.push("/(main)/products/createProduct")}
              style={styles.ErrorAddProductButton}
            >
              Add a Product
            </Button>
          </View>
          }
        />

        
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    borderRadius: 8,
    flex: 1,
  },
  basketHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  productRow: {
    justifyContent: "space-between",
  },
  addProductButton: {
    borderRadius: 5,
    borderStyle: "dashed",
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noProductsText: {
    fontWeight: "500",
    fontSize: 15,
    marginBottom: 5,
  },
  noProductsIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  ErrorAddProductButton: {
    borderRadius: 5,
    marginTop: 16,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    padding: 20,
    borderRadius: 8,
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    minWidth: 80,
  },
});

export default ProductsTab;
