import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Input,
  Text,
  ThemeType,
  Icon,
  IconProps,
  IconElement,
  Button
} from "@ui-kitten/components";
import { Filter, Search } from "lucide-react-native";
import { colors, spacing, radii } from "@/constants/theme";

const SearchIcon = (props: IconProps): IconElement => (
  <Search size={20} color={colors.icon.secondary} />
);

const FilterIcon = ({ theme, ...props }: IconProps & { theme: ThemeType }): IconElement => (
  <Filter {...props} size={20} color={colors.white} />
);

interface GreetingSearchBarProps {
  theme: ThemeType;
  search: string;
  onSearchChange: (text: string) => void;
  onSubmit: (event: { nativeEvent: { text: string } }) => void;
  onFilterPress: () => void;
}

const GreetingSearchBar: React.FC<GreetingSearchBarProps> = ({
  theme,
  search,
  onSearchChange,
  onSubmit,
  onFilterPress
}) => {
  return (
    <View style={styles.searchRow}>
      <Input
        placeholder="Search products..."
        accessoryLeft={SearchIcon}
        style={styles.searchInput}
        value={search}
        onChangeText={onSearchChange}
        onSubmitEditing={onSubmit}
      />
      <Button
        style={[styles.filterButton, { backgroundColor: colors.primary }]}
        appearance="filled"
        size="small"
        accessoryLeft={(props) => <FilterIcon {...props} theme={theme} />}
        onPress={onFilterPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 0,
  },
  searchInput: {
    flex: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.background.primary,
    borderWidth: 0,
  },
  filterButton: {
    borderRadius: radii.lg,
    minWidth: 40,
    height: 40,
    paddingHorizontal: spacing.sm,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GreetingSearchBar;