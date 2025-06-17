import { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Text,
  Input,
  Button,
  Select,
  SelectItem,
  Icon,
  Datepicker,
  IconElement,
  IconProps,
  Card,
  Layout,
  TopNavigation,
  TopNavigationAction,
} from "@ui-kitten/components";
import { Formik } from "formik";
import * as Yup from "yup";
import { IndexPath, Popover } from "@ui-kitten/components";
import ImageUploader from "../components/ImageUploader";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-expo";

// Icons
const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="arrow-back" pack="eva" />
);

const CalendarIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="calendar" pack="eva" />
);

const InfoIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="info-outline" pack="eva" />
);

const ExitIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="close" pack="eva" />
);

// Product Types
const productTypes = ["Food", "Beverage", "Canned Goods"];

// Validation Schema
const ProductSchema = Yup.object().shape({
  name: Yup.string().required("Product Name is required."),
  description: Yup.string().required("Description is required."),
  productType: Yup.string().required("Product Type is required."),
  coverImage: Yup.string().required("Cover Image is required."),
  additionalImages: Yup.array().of(Yup.string()),
  discountedPrice: Yup.number()
    .required("Discounted Price is required")
    .positive("Discounted Price must be positive"),
  originalPrice: Yup.number()
    .required("Original Price is required")
    .positive("Original Price must be positive")
    .test(
      "is-greater-than-discount",
      "Original price must be greater than the discounted price",
      function (value) {
        const { discountedPrice } = this.parent;
        return (
          !discountedPrice ||
          !value ||
          parseFloat(String(value)) > parseFloat(String(discountedPrice))
        );
      }
    ),
  duration: Yup.date()
    .required("Duration is required")
    .min(new Date(), "Duration must be a future date"),
  stock: Yup.number()
    .required("Initial Stock is required")
    .positive("Initial Stock must be positive"),
  category: Yup.string(),
});

interface ProductFormValues {
  name: string;
  description: string;
  productType: string;
  coverImage: string;
  additionalImages: string[];
  discountedPrice: number;
  originalPrice: number;
  duration: Date;
  stock: number;
  category: string;
}

// Create Product Screen
const CreateProduct = () => {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<IndexPath | IndexPath[]>(
    new IndexPath(0)
  );
  const [visible, setVisible] = useState(false);
  const [category, setCategory] = useState<string[]>([]);
  const { getToken } = useAuth();
  const { user } = useUser();

  // Initial form values
  const initialValues: ProductFormValues = {
    name: "",
    description: "",
    productType: "",
    coverImage: "",
    additionalImages: [],
    discountedPrice: 0,
    originalPrice: 0,
    duration: new Date(),
    stock: 0,
    category: "",
  };

  // Handle form submission
  const handleSubmit = async (values: ProductFormValues) => {
    const productData = {
      name: values.name,
      description: values.description,
      productType: values.productType,
      coverImage: values.coverImage,
      additionalImages: values.additionalImages,
      discountedPrice: parseFloat(values.discountedPrice.toString()),
      originalPrice: parseFloat(values.originalPrice.toString()),
      expirationDate: values.duration.toISOString(),
      stock: values.stock,
      category: category,
      storeId: user?.publicMetadata.storeId,
    };
    console.log(productData);

    // Save to database
    const token = await getToken({ template: "seller_app" });
    console.log(token);
    axios
      .post(
        "https://huggle-backend-jh2l.onrender.com/api/seller/products/",
        productData,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Product created successfully:", response.data);
        router.back();
      })
      .catch((error) => {
        console.error("Error creating product:", error);
      });
  };

  // Handle save as draft
  const handleSaveAsDraft = () => {
    console.log("Saved As Draft");
  };

  return (
    <Layout level="1" style={styles.container}>
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title={() => <Text category="h5">Add Product</Text>}
          accessoryLeft={() => (
            <TopNavigationAction
              onPress={() => router.back()}
              icon={BackIcon}
            />
          )}
        />
        <ScrollView>
          <Formik
            initialValues={initialValues}
            validationSchema={ProductSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit: formikSubmit,
              setFieldValue,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.formContainer}>
                <View style={styles.section}>
                  <Text category="h6" style={styles.sectionTitle}>
                    Product Details
                  </Text>

                  <Text style={styles.label}>Product Name</Text>
                  <Input
                    placeholder=""
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    style={styles.input}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}

                  <Text style={styles.label}>Description</Text>
                  <Input
                    placeholder=""
                    value={values.description}
                    onChangeText={handleChange("description")}
                    onBlur={handleBlur("description")}
                    multiline={true}
                    textStyle={{ minHeight: 100 }}
                    style={styles.input}
                  />
                  {touched.description && errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}

                  <Text style={styles.label}>Product Type</Text>
                  <Select
                    placeholder="Choose Type of Product"
                    value={
                      !values.productType
                        ? "Select Type of Product"
                        : productTypes[(selectedIndex as IndexPath).row]
                    }
                    selectedIndex={selectedIndex}
                    onSelect={(index: IndexPath | IndexPath[]) => {
                      setSelectedIndex(index);
                      setFieldValue(
                        "productType",
                        productTypes[(index as IndexPath).row]
                      );
                    }}
                    style={styles.input}
                  >
                    {productTypes.map((type, index) => (
                      <SelectItem key={index} title={type} />
                    ))}
                  </Select>
                  {touched.productType && errors.productType && (
                    <Text style={styles.errorText}>{errors.productType}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text category="h6" style={styles.sectionTitle}>
                    Product Photos
                  </Text>

                  <Text style={styles.label}>Cover Photo</Text>
                  <ImageUploader
                    image={values.coverImage}
                    onImageSelected={(uri: string) =>
                      setFieldValue("coverImage", uri)
                    }
                    style={styles.coverImageUploader}
                  />
                  {touched.coverImage && errors.coverImage && (
                    <Text style={styles.errorText}>{errors.coverImage}</Text>
                  )}

                  <Text style={styles.label}>Additional Photos</Text>
                  <View style={styles.additionalImagesContainer}>
                    {[0, 1, 2].map((index) => (
                      <ImageUploader
                        key={index}
                        image={values.additionalImages[index] || ""}
                        onImageSelected={(uri: string) => {
                          const newImages = [...values.additionalImages];
                          newImages[index] = uri;
                          setFieldValue("additionalImages", newImages);
                        }}
                        style={styles.additionalImageUploader}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text category="h6" style={styles.sectionTitle}>
                    Category
                  </Text>

                  <Text style={styles.label}>Keywords/Tags</Text>
                  <Input
                    placeholder="Add a Keyword"
                    value={values.category}
                    onChangeText={handleChange("category")}
                    onBlur={handleBlur("category")}
                    style={styles.input}
                    onSubmitEditing={() => {
                      category.push(values.category);
                      setFieldValue("category", "");
                      values.category = "";
                    }}
                  />
                  {touched.category && errors.category && (
                    <Text style={styles.errorText}>{errors.category}</Text>
                  )}
                  <View style={styles.categories}>
                    <Text style={styles.label}>Categories:</Text>
                    {category.map((c, index) => (
                      <Button
                        style={styles.categoryText}
                        key={index}
                        status="primary"
                        size="tiny"
                        accessoryLeft={ExitIcon}
                        onPress={() => {
                          const newCategories = category
                            .splice(0, index)
                            .concat(category.splice(index + 1));
                          setCategory(newCategories);
                        }}
                      >
                        {c}
                      </Button>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text category="h6" style={styles.sectionTitle}>
                    Prices
                  </Text>

                  <Text style={styles.label}>Original Price</Text>
                  <Input
                    placeholder="00.00"
                    value={
                      values.originalPrice.toString() === "0"
                        ? ""
                        : values.originalPrice.toString()
                    }
                    onChangeText={handleChange("originalPrice")}
                    onBlur={handleBlur("originalPrice")}
                    keyboardType="numeric"
                    accessoryLeft={(props) => <Text {...props}>₱</Text>}
                    style={styles.input}
                  />
                  {touched.originalPrice && errors.originalPrice && (
                    <Text style={styles.errorText}>{errors.originalPrice}</Text>
                  )}

                  <Text style={styles.label}>Discounted Price</Text>
                  <Input
                    placeholder="00.00"
                    value={
                      values.discountedPrice.toString() === "0"
                        ? ""
                        : values.discountedPrice.toString()
                    }
                    onChangeText={handleChange("discountedPrice")}
                    onBlur={handleBlur("discountedPrice")}
                    keyboardType="numeric"
                    accessoryLeft={(props) => <Text {...props}>₱</Text>}
                    style={styles.input}
                  />
                  {touched.discountedPrice && errors.discountedPrice && (
                    <Text style={styles.errorText}>
                      {errors.discountedPrice}
                    </Text>
                  )}

                  <Text style={[styles.discountText, styles.label]}>
                    Price Reduction: ₱{" "}
                    {values.originalPrice &&
                      values.discountedPrice &&
                      (values.originalPrice - values.discountedPrice).toFixed(
                        2
                      )}
                    {isNaN(values.originalPrice - values.discountedPrice) &&
                      "00.00"}
                  </Text>
                  <Text style={[styles.discountText, styles.label]}>
                    Discount:{" "}
                    {values.originalPrice &&
                      values.discountedPrice &&
                      (
                        ((values.originalPrice - values.discountedPrice) /
                          values.originalPrice) *
                        100
                      ).toFixed(2)}
                    {isNaN(values.originalPrice - values.discountedPrice) &&
                      "00.00"}
                    %
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text category="h6" style={styles.sectionTitle}>
                    Stock
                  </Text>

                  <Text style={styles.label}>Initial Stock</Text>
                  <Input
                    placeholder="0"
                    value={values.stock ? values.stock.toString() : ""}
                    onChangeText={handleChange("stock")}
                    onBlur={handleBlur("stock")}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  {touched.stock && errors.stock && (
                    <Text style={styles.errorText}>{errors.stock}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text category="h6" style={styles.sectionTitle}>
                    Duration
                    <Popover
                      anchor={() => (
                        <Button
                          appearance="ghost"
                          size="small"
                          status="primary"
                          onPress={() => setVisible(!visible)}
                          style={styles.durationButton}
                          accessoryLeft={InfoIcon}
                        ></Button>
                      )}
                      visible={visible}
                      onBackdropPress={() => setVisible(false)}
                      placement={"bottom start"}
                    >
                      <Card disabled={true} style={styles.modalCard}>
                        <Text style={styles.modalText}>
                          The duration is the time period during which the
                          product will be available for purchase.
                        </Text>
                      </Card>
                    </Popover>
                  </Text>

                  <View style={styles.durationRow}>
                    <Text style={styles.label}>Time Duration</Text>
                  </View>

                  <Datepicker
                    date={values.duration}
                    onSelect={(date) => setFieldValue("duration", date)}
                    accessoryRight={CalendarIcon}
                    placeholder="MM/DD/YYYY HH:MM:SS"
                    style={styles.input}
                    min={new Date()}
                  />
                  {touched.duration && errors.duration && (
                    <Text style={styles.errorText}>{errors.duration}</Text>
                  )}
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    style={styles.draftButton}
                    appearance="outline"
                    status="primary"
                    onPress={handleSaveAsDraft}
                  >
                    Save draft
                  </Button>
                  <Button
                    style={styles.publishButton}
                    status="success"
                    onPress={() => formikSubmit()}
                  >
                    Publish now
                  </Button>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </SafeAreaView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  formContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: "#FF3D71",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  coverImageUploader: {
    width: "100%",
    height: 150,
    marginBottom: 16,
  },
  additionalImagesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  additionalImageUploader: {
    width: "30%",
    height: 80,
  },
  discountText: {
    color: "#548C2F",
  },
  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ongoingText: {
    fontSize: 12,
    color: "#8F9BB3",
    backgroundColor: "#EDF1F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  draftButton: {
    flex: 1,
    marginRight: 8,
  },
  publishButton: {
    flex: 1,
    marginLeft: 8,
  },
  durationButton: {
    borderRadius: 40,
    width: 25,
    height: 25,
  },
  modalText: {
    fontSize: 11,
  },
  modalCard: {
    width: 250,
  },
  categoryText: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  categories: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 16,
  },
});

export default CreateProduct;
