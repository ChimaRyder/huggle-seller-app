import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Select, SelectItem } from '@ui-kitten/components';
import { IndexPath } from '@ui-kitten/components';
import { categoryService, CategoryData } from '@/utils/categoryService';

interface CategorySelectorProps {
  selectedCategory: string;
  selectedSubcategory: string;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
  disabled?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  disabled = false,
}) => {
  const [categories, setCategories] = useState<CategoryData>({});
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryIndex, setCategoryIndex] = useState<IndexPath | IndexPath[]>(new IndexPath(0));
  const [subcategoryIndex, setSubcategoryIndex] = useState<IndexPath | IndexPath[]>(new IndexPath(0));

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoryData = await categoryService.getAllCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategory) {
        try {
          const subcategoryData = await categoryService.getSubcategoriesForCategory(selectedCategory);
          setSubcategories(subcategoryData);
          
          // Reset subcategory selection when category changes
          onSubcategoryChange('');
          setSubcategoryIndex(new IndexPath(0));
        } catch (error) {
          console.error(`Failed to fetch subcategories for ${selectedCategory}:`, error);
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  // Update indices when selected values change
  useEffect(() => {
    const categoryKeys = Object.keys(categories);
    const categoryIdx = categoryKeys.indexOf(selectedCategory);
    if (categoryIdx !== -1) {
      setCategoryIndex(new IndexPath(categoryIdx));
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    const subcategoryIdx = subcategories.indexOf(selectedSubcategory);
    if (subcategoryIdx !== -1) {
      setSubcategoryIndex(new IndexPath(subcategoryIdx));
    }
  }, [selectedSubcategory, subcategories]);

  const handleCategorySelect = (index: IndexPath | IndexPath[]) => {
    const categoryKeys = Object.keys(categories);
    const selectedIdx = Array.isArray(index) ? index[0].row : index.row;
    const selectedCategoryName = categoryKeys[selectedIdx];
    
    setCategoryIndex(index);
    onCategoryChange(selectedCategoryName);
  };

  const handleSubcategorySelect = (index: IndexPath | IndexPath[]) => {
    const selectedIdx = Array.isArray(index) ? index[0].row : index.row;
    const selectedSubcategoryName = subcategories[selectedIdx];
    
    setSubcategoryIndex(index);
    onSubcategoryChange(selectedSubcategoryName);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text category="s1" style={styles.label}>Category</Text>
        <Text category="p2" style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text category="s1" style={styles.label}>Category</Text>
      <Select
        style={styles.select}
        placeholder="Select Category"
        selectedIndex={categoryIndex}
        onSelect={handleCategorySelect}
        disabled={disabled}
        value={selectedCategory}
      >
        {Object.keys(categories).map((category) => (
          <SelectItem key={category} title={category} />
        ))}
      </Select>

      {selectedCategory && (
        <>
          <Text category="s1" style={styles.label}>Subcategory</Text>
          <Select
            style={styles.select}
            placeholder="Select Subcategory (Optional)"
            selectedIndex={subcategoryIndex}
            onSelect={handleSubcategorySelect}
            disabled={disabled}
            value={selectedSubcategory}
          >
            {subcategories.map((subcategory) => (
              <SelectItem key={subcategory} title={subcategory} />
            ))}
          </Select>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  select: {
    marginBottom: 16,
  },
  loadingText: {
    fontStyle: 'italic',
    color: '#8F9BB3',
  },
});

export default CategorySelector; 