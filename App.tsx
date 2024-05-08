import React, { useEffect, useState } from 'react';
import {
  Text,
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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

  return (
    <SafeAreaView>
      <Text style={styles.txtMain}>List Data</Text>
      <ScrollView>
        {list.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemDate}>DATE   : {item.date}</Text>
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
  txtMain: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
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
