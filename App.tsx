import React, { useEffect, useState } from 'react';
import {
  Text,
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import GetLocation from 'react-native-get-location';
import NetInfo from '@react-native-community/netinfo';
import {
  initDatabase,
  insertLocation,
  getLocations,
  deleteLocation,
  clearLocations,
} from './database';

const App = () => {
  const [list, setList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');

  useEffect(() => {
    initDatabase();
    const interval = setInterval(() => {
      handleAddData();
    }, 10000); 

    return () => clearInterval(interval);
  }, []);

  const handleAddData = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      const latitude = location.latitude;
      const longitude = location.longitude;
      const currentDate = new Date();
      const datetime = currentDate.toLocaleString();

      const isConnected = await checkInternetConnection();
      
      if (isConnected) {
        await syncDataWithApi();
        await sendDataToApi({ datetime, latitude, longitude });
        getData();
      } else {
        await sendDataToLocalDatabase({ datetime, latitude, longitude });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkInternetConnection = async () => {
    return await NetInfo.fetch().then((state) => state.isConnected);
  };

  const sendDataToApi = async (data) => {
    try {
      await fetch('https://6662b64562966e20ef09a745.mockapi.io/location/v2/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const sendDataToLocalDatabase = async (data) => {
    try {
      await insertLocation(data);
    } catch (error) {
      console.log(error);
    }
  };

  const syncDataWithApi = async () => {
    try {
      const locations = await getLocations();
      
      if (locations.length > 0) {
        await Promise.all(locations.map(async (location) => {
          await sendDataToApi(location);
          await deleteLocation(location.id);
          clearLocations();
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getData = () => {
    fetch('https://6662b64562966e20ef09a745.mockapi.io/location/v2/users', {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((res) => {
        setList(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteData = (id) => {
    fetch(`https://6662b64562966e20ef09a745.mockapi.io/location/v2/users/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        getData();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateData = () => {
    const { id } = selectedItem;
    fetch(`https://6662b64562966e20ef09a745.mockapi.io/location/v2/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude: newLatitude, longitude: newLongitude }),
    }).then(() => {
      setModalVisible(false);
      setNewLatitude('');
      setNewLongitude('');
      getData();
    }).catch((err) => {
      console.log(err);
    });
  };

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Text style={styles.headerText}>List Data</Text>
        <TouchableOpacity onPress={handleAddData} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Data</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {list.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemDate}>DATE   : {item.datetime}</Text>
              <Text>LAT       : {item.latitude}</Text>
              <Text>LONG    : {item.longitude}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}>
                <Text style={styles.updateText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteData(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalDate}>DATE: {selectedItem?.datetime}</Text>
            <Text>LAT: {selectedItem?.latitude}</Text>
            <Text>LONG: {selectedItem?.longitude}</Text>
            <TouchableOpacity onPress={() => {
              setNewLatitude((Math.random() * 90).toString());
              setNewLongitude((Math.random() * 180).toString());
            }}>
              <Text style={styles.changeDataText}>Change Data</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              onChangeText={setNewLatitude}
              value={newLatitude}
              placeholder="New Latitude"
            />
            <TextInput
              style={styles.input}
              onChangeText={setNewLongitude}
              value={newLongitude}
              placeholder="New Longitude"
              />
            <TouchableOpacity onPress={updateData}>
              <Text style={styles.updateDataText}>Update Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },   
  addButton: {
    padding: 5,
    backgroundColor: 'green',
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateText: {
    color: 'blue',
    marginRight: 10,
  },
  deleteText: {
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalDate: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  changeDataText: {
    color: 'blue',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
  },
  updateDataText: {
    color: 'green',
    textAlign: 'center',
  },
});

export default App;