import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Icon, Text } from '@ui-kitten/components';
import * as ImagePicker from 'expo-image-picker';

interface ImageUploaderProps {
  image: string;
  onImageSelected: (uri: string) => void;
  style?: object;
}

const ImageUploader = ({ image, onImageSelected, style }: ImageUploaderProps): React.ReactElement => {

  const handleImageSelection = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images','videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })
    // const placeholderImage = 'https://via.placeholder.com/300';
    onImageSelected(result.assets?.[0]?.uri || '');
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handleImageSelection}
      activeOpacity={0.7}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Icon name="cloud-upload-outline" pack="eva" style={styles.icon} fill="#8F9BB3" />
          <Text style={styles.text}>Add or Drop a Photo</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#EDF1F7',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F7F9FC',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    color: '#8F9BB3',
    textAlign: 'center',
  },
});

export default ImageUploader;
