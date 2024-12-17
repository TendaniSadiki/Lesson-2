import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import { useState, useEffect, useRef } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  Modal,
  Alert,
} from 'react-native';

export default function CameraScreen() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [gallery, setGallery] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    loadGallery();
  }, []);

  // Load gallery from AsyncStorage
  const loadGallery = async () => {
    const storedImages = await AsyncStorage.getItem('gallery');
    if (storedImages) {
      setGallery(JSON.parse(storedImages));
    }
  };

  // Save gallery to AsyncStorage
  const saveToGallery = async (uri) => {
    const updatedGallery = [...gallery, uri];
    setGallery(updatedGallery);
    await AsyncStorage.setItem('gallery', JSON.stringify(updatedGallery));
  };

  // Capture a photo
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      const fileName = `${Date.now()}.jpg`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;

      // Move the image to app's storage
      await FileSystem.moveAsync({
        from: photo.uri,
        to: newUri,
      });

      await saveToGallery(newUri);
      Alert.alert('Photo saved successfully!');
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  // Show details
  const showDetails = async (uri) => {
    const info = await FileSystem.getInfoAsync(uri);
    const fileName = uri.split('/').pop();
    const details = `File Name: ${fileName}\nCreated: ${new Date(info.modificationTime).toLocaleString()}`;
    Alert.alert('Image Details', details);
  };

  // Share image
  const shareImage = async (uri) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { dialogTitle: 'Share this photo' });
    } else {
      Alert.alert('Sharing is not available on this device.');
    }
  };

  // Delete image
  const deleteImage = async (uri) => {
    await FileSystem.deleteAsync(uri);
    const updatedGallery = gallery.filter((item) => item !== uri);
    setGallery(updatedGallery);
    await AsyncStorage.setItem('gallery', JSON.stringify(updatedGallery));
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Capture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Gallery */}
      <View style={styles.galleryContainer}>
        <Text style={styles.galleryTitle}>My Gallery</Text>
        {gallery.length > 0 ? (
          <FlatList
            data={gallery}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => { setSelectedImage(item); setModalVisible(true); }}>
                <Image source={{ uri: item }} style={styles.image} />
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.noImageText}>No images yet. Capture a photo!</Text>
        )}
      </View>

      {/* Modal for Image Actions */}
      {selectedImage && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
            <View style={styles.modalActions}>
              <Button title="Details" onPress={() => showDetails(selectedImage)} />
              <Button title="Share" onPress={() => shareImage(selectedImage)} />
              <Button title="Delete" color="red" onPress={() => deleteImage(selectedImage)} />
              <Button title="Close" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  camera: { flex: 3 },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  text: { fontSize: 18, color: 'white' },
  galleryContainer: { flex: 2, padding: 10, backgroundColor: '#f8f8f8' },
  galleryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  image: { width: 100, height: 100, marginRight: 10, borderRadius: 5 },
  noImageText: { textAlign: 'center', color: 'gray' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: { width: '80%', height: '60%', marginBottom: 20 },
  modalActions: { width: '80%', alignItems: 'center' },
});
