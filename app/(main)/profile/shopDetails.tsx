import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Layout, Text, Icon, TopNavigation, Divider, Avatar, Button, Input } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import { IconProps, IconElement } from '@ui-kitten/components';
import DetailItem from './components/detailItem';
import { SafeAreaView } from 'react-native-safe-area-context';

const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="arrow-back" pack="eva" />
);

export default function ShopDetailsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentEditField, setCurrentEditField] = useState('');
  const [currentEditValue, setCurrentEditValue] = useState('');
  
  // Shop details state
  const [shopDetails, setShopDetails] = useState({
    shopName: 'Dante Alejandro',
    address: 'Dante Alejandro | 639658327483\n181K Elizabeth Pond St.\nCamputhaw, Cebu City\nVisayas, Cebu 6015',
    email: 'danteshop@gmail.com',
    password: '••••••••••••••••••',
    mobile: '+639279587387'
  });

  const navigateBack = () => {
    router.back();
  };

  const handleEditPress = (field: string, value: string) => {
    setCurrentEditField(field);
    setCurrentEditValue(value === '••••••••••••••••••' ? '' : value);
    setModalVisible(true);
  };

  const handleSaveEdit = () => {
    setShopDetails({
      ...shopDetails,
      [currentEditField]: currentEditValue
    });
    setModalVisible(false);
  };

  const renderEditModal = () => {
    const fieldLabels = {
      shopName: 'Shop Name',
      address: 'Pick Up Address',
      email: 'Email',
      password: 'Password',
      mobile: 'Mobile No.'
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text category="h6" style={styles.modalTitle}>
              Edit {fieldLabels[currentEditField as keyof typeof fieldLabels]}
            </Text>
            
            <Input
              style={styles.modalInput}
              value={currentEditValue}
              onChangeText={setCurrentEditValue}
              placeholder={`Enter ${fieldLabels[currentEditField as keyof typeof fieldLabels]}`}
              secureTextEntry={currentEditField === 'password'}
              multiline={currentEditField === 'address'}
              textStyle={currentEditField === 'address' ? { minHeight: 80 } : {}}
            />
            
            <View style={styles.modalButtons}>
              <Button
                appearance="outline"
                status="basic"
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                Cancel
              </Button>
              <Button
                style={styles.modalButton}
                status="success"
                onPress={handleSaveEdit}
              >
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNavigation
        title="SHOP PROFILE"
        alignment="center"
        accessoryLeft={() => (
          <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
            <BackIcon fill="#000" width={24} height={24} />
          </TouchableOpacity>
        )}
        style={styles.topNavigation}
      />
      <Divider />

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileContainer}>
          <Avatar
            source={require('../../../assets/images/profile-placeholder.jpg')}
            style={styles.avatar}
            size="giant"
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text category="h6" style={styles.sectionTitle}>Profile Details</Text>
          
          <DetailItem 
            label="Shop Name" 
            value={shopDetails.shopName} 
            onEditPress={() => handleEditPress('shopName', shopDetails.shopName)} 
          />
          
          <DetailItem 
            label="Pick Up Address" 
            value={shopDetails.address} 
            onEditPress={() => handleEditPress('address', shopDetails.address)} 
          />
          
          <DetailItem 
            label="Email" 
            value={shopDetails.email} 
            onEditPress={() => handleEditPress('email', shopDetails.email)} 
          />
          
          <DetailItem 
            label="Password" 
            value={shopDetails.password} 
            onEditPress={() => handleEditPress('password', shopDetails.password)} 
          />
          
          <DetailItem 
            label="Mobile No." 
            value={shopDetails.mobile} 
            onEditPress={() => handleEditPress('mobile', shopDetails.mobile)} 
          />
          
          <Text category="h6" style={[styles.sectionTitle, styles.linkedTitle]}>Linked Accounts</Text>
          
          <Button
            style={styles.googleButton}
            status="success"
            disabled
          >
            Linked with Google
          </Button>
        </View>
      </ScrollView>
      
      {renderEditModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  topNavigation: {
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  sectionTitle: {
    marginVertical: 16,
    fontWeight: 'bold',
  },
  linkedTitle: {
    marginTop: 24,
  },
  googleButton: {
    marginVertical: 16,
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});
