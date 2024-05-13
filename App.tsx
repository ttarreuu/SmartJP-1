import React, { useEffect, useState } from 'react';
import {
  Text,
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';

const App = () => {
  const [list, setList] = useState([]);

  useEffect(() => {
    getData();
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
      .then((res) => res.json())
      .then(() => {
        getData();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const addData = async () => {

    const latitude = Math.random() * 90; 
    const longitude = Math.random() * 180;
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
            <TouchableOpacity onPress={() => deleteData(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
  deleteText: {
    color: 'red',
  },
});

export default App;
