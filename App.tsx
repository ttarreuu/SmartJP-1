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

const App = () => {
  const [list, setList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');

  useEffect(() => {
    getData();
    const interval = setInterval(() => {
      addData();
    }, 10000); // 10000 ms = 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getData = () => {
    fetch('https://6639cbd81ae792804beccbdc.mockapi.io/location/v1/users', {
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
    fetch(`https://6639cbd81ae792804beccbdc.mockapi.io/location/v1/users/${id}`, {
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
    fetch(`https://6639cbd81ae792804beccbdc.mockapi.io/location/v1/users/${id}`, {
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

  const addData = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      const latitude = location.latitude;
      const longitude = location.longitude;
      const currentDate = new Date();
      const datetime = currentDate.toLocaleString();

      fetch('https://6639cbd81ae792804beccbdc.mockapi.io/location/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ datetime, latitude, longitude }),
      }).then(() => {
        getData();
      }).catch((err) => {
        console.log(err);
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Text style={styles.headerText}>List Data</Text>
        <TouchableOpacity onPress={addData} style={styles.addButton}>
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