import {
  Input,
  Button,
  Text,
  ThemeType,
  Modal,
  Select,
  SelectItem,
  IndexPath,
  Icon,
  IconProps,
  IconElement,
  Layout,
  Spinner,
  Card
} from "@ui-kitten/components";
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl, ScrollView } from "react-native";
import ProductItem from "./components/productItem";
import InventoryProductItem from "./components/InventoryProductItem";
import GreetingSearchBar from "./components/GreetingSearchBar";
import GreetingSection from "./components/GreetingSection";
import { useFocusEffect, useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { getAllProducts, bulkUpdateStock } from "@/utils/Controllers/ProductController";
import { showToast } from "@/components/Toast";
import { validateSellerAccess } from "@/utils/sellerUtils";
import { AlertCircle, CookingPot, Filter, SortAsc, BarChart3, Package, Plus, Package2 } from "lucide-react-native";
import { colors, spacing, typography, radii } from "@/constants/theme";


const SearchIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="Search" />
);

const FilterIcon = (props: IconProps): IconElement => (
  <Filter {...props} size={20} />
);

const SortIcon = (props: IconProps): IconElement => (
  <SortAsc {...props} size={20} />
);

// Constants moved outside component to prevent recreation
const sortOptions = ['Name A-Z', 'Name Z-A', 'Price Low-High', 'Price High-Low', 'Stock Low-High', 'Recently Added'];
const statusOptions = ['All Products', 'Active', 'Inactive', 'Low Stock (≤10)'];

// Product Tab Component
const ProductsTab = ({ theme, unread = 0 }: { theme: ThemeType; unread?: number }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(new IndexPath(0));
  const [filterStatus, setFilterStatus] = useState(new IndexPath(0));
  const [isInventoryMode, setIsInventoryMode] = useState(false);
  const [pendingStockUpdates, setPendingStockUpdates] = useState<Array<{productId: string, newStock: number, newExpiryDate: Date}>>([]);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting fetchProducts...');
      
      // Get token with seller_app template (contains storeId in claims)
      const token = await getToken({ template: "seller_app" });
      console.log('🔑 Token obtained:', token ? 'Token exists' : 'No token');
      
      // Validate seller access using token claims (optional - controller will also validate)
      const sellerValidation = validateSellerAccess(token, user);
      console.log('✅ Seller validation result:', sellerValidation);
      
      if (!sellerValidation.isValid) {
        console.log('❌ Seller validation failed:', sellerValidation.error);
        throw new Error(sellerValidation.error || 'Invalid seller access');
      }
      
      console.log('📞 Calling getAllProducts API...');
      // Call getAllProducts - storeId will be extracted from token automatically
      const response = await getAllProducts("", token ?? "");
      console.log('📦 Products API response:', response);
      
      const data = ((response as any).data);
      console.log('📋 Products data received:', data);
      console.log('📊 Number of products:', Array.isArray(data) ? data.length : 'Not an array');
      
      setProducts(data);
      console.log('✅ Products state updated successfully');
    } catch (error: any) {
      console.log('❌ Error in fetchProducts:', error);
      
      let errorMessage = "Something went wrong while getting your products. Please try again.";
      
      if (error.response?.status === 404) {
        errorMessage = "No products found. Start by adding your first product!";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error.message?.includes('seller registration') || error.message?.includes('Store ID not found')) {
        errorMessage = error.message;
      }
      
      showToast(
        "error",
        "Uh oh!",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...products];

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.category.some((cat: string) => cat.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply status filter
    const statusFilter = statusOptions[filterStatus.row];
    if (statusFilter === 'Active') {
      filtered = filtered.filter(product => product.isActive);
    } else if (statusFilter === 'Inactive') {
      filtered = filtered.filter(product => !product.isActive);
    } else if (statusFilter === 'Low Stock (≤10)') {
      filtered = filtered.filter(product => product.stock <= 10);
    }

    // Apply sorting
    const sortOption = sortOptions[sortBy.row];
    switch (sortOption) {
      case 'Name A-Z':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Name Z-A':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'Price Low-High':
        filtered.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case 'Price High-Low':
        filtered.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case 'Stock Low-High':
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      case 'Recently Added':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredProducts(filtered);
  }, [products, search, sortBy, filterStatus]);

  const getProductStats = () => {
    const activeProducts = products.filter(p => p.isActive).length;
    const lowStockProducts = products.filter(p => p.stock <= 10).length;
    return { activeProducts, lowStockProducts, totalProducts: products.length };
  };

  const onSubmit = (event: { nativeEvent: { text: string } }) => {
    setSearch(event.nativeEvent.text);
  };

  const handleStockChange = (productId: string, newStock: number, newExpiryDate: Date) => {
    setPendingStockUpdates(current => {
      const existing = current.find(u => u.productId === productId);
      if (existing) {
        return current.map(u => u.productId === productId 
          ? { productId, newStock, newExpiryDate }
          : u
        );
      }
      return [...current, { productId, newStock, newExpiryDate }];
    });
  };

  const processPendingStockUpdates = async () => {
    if (pendingStockUpdates.length === 0) return;
    
    try {
      setIsUpdatingStock(true);
      const token = await getToken({ template: "seller_app" });
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await bulkUpdateStock(pendingStockUpdates, token);
      
      if (response.status === 200) {
        // Update local products state with new stock values
        setProducts(currentProducts => 
          currentProducts.map(product => {
            const update = pendingStockUpdates.find(u => u.productId === product.id);
            if (update) {
              return {
                ...product,
                stock: update.newStock,
                expiresOn: update.newExpiryDate.toISOString(),
                expirationDate: update.newExpiryDate.toISOString()
              };
            }
            return product;
          })
        );
        
        setPendingStockUpdates([]);
        
        const result = response.data?.data;
        if (result?.TotalUpdated > 0) {
          showToast(
            "success",
            "Stock Updated!",
            `Successfully updated ${result.TotalUpdated} product${result.TotalUpdated !== 1 ? 's' : ''}.`
          );
        }
        
        if (result?.TotalFailed > 0) {
          showToast(
            "error",
            "Partial Success",
            `${result.TotalFailed} update${result.TotalFailed !== 1 ? 's' : ''} failed. Check the details.`
          );
        }
      }
    } catch (error: any) {
      console.log('❌ Error updating stock:', error);
      console.log('❌ Error response data:', error.response?.data);
      
      let errorMessage = "Failed to update stock. Please try again.";
      let errorTitle = "Update Failed";
      
      // Check if we have detailed error information from the backend
      // The error structure is: error.details.data.failures
      let errorData = null;
      
      if (error.details?.data) {
        errorData = error.details.data;
        console.log('📋 Detailed error data from error.details.data:', errorData);
      } else if (error.response?.data?.data) {
        errorData = error.response.data.data;
        console.log('📋 Detailed error data from error.response.data.data:', errorData);
      } else if (error.response?.data) {
        errorData = error.response.data;
        console.log('📋 Detailed error data from error.response.data:', errorData);
      }
      
      if (errorData) {
        if (errorData.failures && errorData.failures.length > 0) {
          const firstFailure = errorData.failures[0];
          errorTitle = "Stock Update Issues";
          
          if (errorData.failures.length === 1) {
            // Single failure - show specific error with product name if available
            const productName = firstFailure.productName || 'Item';
            const errorMsg = firstFailure.error || 'Update failed';
            errorMessage = productName !== '' ? `${productName}: ${errorMsg}` : errorMsg;
          } else {
            // Multiple failures - show summary
            errorMessage = `${errorData.totalFailed} items failed to update. First error: ${firstFailure.error || 'Update failed'}`;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.response?.data?.message) {
        // Fallback to general error message
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Final fallback
        errorMessage = error.message;
      }
      
      showToast(
        "error",
        errorTitle,
        errorMessage
      );
    } finally {
      setIsUpdatingStock(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();

      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const stats = getProductStats();

  return (
    <View style={styles.tabContent}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Greeting Section */}
        <GreetingSection unread={unread} />
        
        {/* Inventory Mode Toggle */}
        <View style={styles.inventoryModeSection}>
          <View style={styles.inventoryModeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, isInventoryMode && styles.modeButtonActive]}
              onPress={() => setIsInventoryMode(!isInventoryMode)}
              activeOpacity={0.7}
            >
              <Package2 size={18} color={isInventoryMode ? colors.icon.inverse : colors.primary} />
              <Text style={[styles.modeButtonText, isInventoryMode && styles.modeButtonTextActive]}>
                Inventory Mode
              </Text>
            </TouchableOpacity>
            
            {isInventoryMode && pendingStockUpdates.length > 0 && (
              <Button
                size="small"
                status="success"
                onPress={processPendingStockUpdates}
                disabled={isUpdatingStock}
                style={styles.bulkUpdateButton}
              >
                {isUpdatingStock ? 'Updating...' : `Update ${pendingStockUpdates.length}`}
              </Button>
            )}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Text category="c2" style={[styles.statLabel, { color: colors.success }]}>Total</Text>
                </View>
                <Text category="h5" style={{ color: colors.success }}>{stats.totalProducts}</Text>
              </View>
            </Card>
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Text category="c1" style={[styles.statLabel, { color: colors.warning }]}>Active</Text>
                </View>
                <Text category="h5" style={{ color: colors.warning }}>{stats.activeProducts}</Text>
              </View>
            </Card>
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Text category="c1" style={[styles.statLabel, { color: colors.danger }]}>Low Stock</Text>
                </View>
                <Text category="h5" style={{ color: colors.danger }}>{stats.lowStockProducts}</Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <GreetingSearchBar
            theme={theme}
            search={search}
            onSearchChange={setSearch}
            onSubmit={onSubmit}
            onFilterPress={() => setShowFilters(true)}
          />
        </View>

        {/* Active Filters Display */}
        {(search || sortBy.row !== 0 || filterStatus.row !== 0) && (
          <View style={styles.activeFilters}>
            <Text category="c1" appearance="hint">Active filters: </Text>
            {search && <View style={styles.filterBadge}><Text category="c2" style={styles.filterBadgeText}>{`"${search}"`}</Text></View>}
            {sortBy.row !== 0 && <View style={styles.filterBadge}><Text category="c2" style={styles.filterBadgeText}>{sortOptions[sortBy.row]}</Text></View>}
            {filterStatus.row !== 0 && <View style={styles.filterBadge}><Text category="c2" style={styles.filterBadgeText}>{statusOptions[filterStatus.row]}</Text></View>}
            <TouchableOpacity onPress={() => { setSearch(""); setSortBy(new IndexPath(0)); setFilterStatus(new IndexPath(0)); }}>
              <Text category="c1" status="primary">Clear all</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Product List */}
        <View style={styles.productListContainer}>
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => 
              isInventoryMode ? (
                <InventoryProductItem 
                  item={item} 
                  theme={theme} 
                  onStockChange={handleStockChange}
                  isUpdating={isUpdatingStock}
                />
              ) : (
                <ProductItem item={item} theme={theme} />
              )
            }
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={[(filteredProducts?.length || 0) === 0 && { justifyContent: 'center' }, styles.productList]}
            ListEmptyComponent={
              <View style={styles.noProductsContainer}>
                <CookingPot size={60} color={colors.icon.secondary}/>
                <Text style={styles.noProductsTitle} category="h6">
                  {search || filterStatus.row !== 0 ? 'No products match your filters' : 'No products yet'}
                </Text>
                <Text style={styles.noProductsSubtitle} appearance="hint">
                  {search || filterStatus.row !== 0
                    ? 'Try adjusting your search or filters'
                    : 'Start building your inventory by adding your first product'
                  }
                </Text>
                {(!search && filterStatus.row === 0) && (
                  <Button
                    status="primary"
                    size="large"
                    onPress={() => router.push("/(main)/products/createProduct")}
                    style={styles.emptyStateButton}
                    accessoryLeft={(props) => <Plus {...props} size={20} color={colors.icon.inverse} />}
                  >
                    Add Your First Product
                  </Button>
                )}
                {(search || filterStatus.row !== 0) && (
                  <Button
                    appearance="outline"
                    size="medium"
                    onPress={() => { setSearch(""); setFilterStatus(new IndexPath(0)); }}
                    style={styles.emptyStateButton}
                  >
                    Clear Filters
                  </Button>
                )}
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setShowFilters(false)}
      >
        <Card disabled={true} style={styles.filterModal}>
          <Text category="h6" style={styles.modalTitle}>Sort & Filter Products</Text>
          
          <View style={styles.filterSection}>
            <Text category="s1" style={styles.filterLabel}>Sort by</Text>
            <Select
              selectedIndex={sortBy}
              value={sortOptions[sortBy.row]}
              onSelect={(index) => setSortBy(index as IndexPath)}
            >
              {sortOptions.map((option, index) => (
                <SelectItem key={index} title={option} />
              ))}
            </Select>
          </View>

          <View style={styles.filterSection}>
            <Text category="s1" style={styles.filterLabel}>Filter by Status</Text>
            <Select
              selectedIndex={filterStatus}
              value={statusOptions[filterStatus.row]}
              onSelect={(index) => setFilterStatus(index as IndexPath)}
            >
              {statusOptions.map((option, index) => (
                <SelectItem key={index} title={option} />
              ))}
            </Select>
          </View>

          <View style={styles.modalButtons}>
            <Button
              appearance="ghost"
              size="small"
              onPress={() => { setSortBy(new IndexPath(0)); setFilterStatus(new IndexPath(0)); }}
              style={styles.modalButton}
            >
              Reset
            </Button>
            <Button
              size="small"
              onPress={() => setShowFilters(false)}
              style={styles.modalButton}
            >
              Apply
            </Button>
          </View>
        </Card>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  scrollView: {
    flex: 1,
  },

  // Stats Section
  statsSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 0,
  },
  statContent: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  statHeader: {
    flexDirection: 'row',
    gap: 4,
  },
  statLabel: {
    fontWeight: typography.fontWeights.medium,
  },

  // Search Section
  searchSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  // Active Filters
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  filterBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  filterBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },

  // Product List
  productListContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  productList: {
    paddingTop: spacing.xs,
  },

  // Empty State
  noProductsContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    minHeight: 300,
  },
  noProductsTitle: {
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  noProductsSubtitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.fontSizes.md * typography.lineHeights.relaxed,
  },
  emptyStateButton: {
    borderRadius: radii.lg,
    minWidth: 180,
  },

  // Filter Modal
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  filterModal: {
    margin: spacing.md,
    minWidth: 300,
    borderRadius: radii.lg,
    borderWidth: 0,
  },
  modalTitle: {
    marginBottom: spacing.lg,
    textAlign: "center",
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeights.medium,
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

  // Inventory Mode
  inventoryModeSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  inventoryModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.background.primary,
    gap: spacing.sm,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary,
  },
  modeButtonTextActive: {
    color: colors.text.inverse,
  },
  bulkUpdateButton: {
    borderRadius: radii.md,
    minWidth: 100,
  },
});

export default ProductsTab;
