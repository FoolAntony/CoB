import { StatusBar } from 'expo-status-bar';
import React, {useState} from "react";
import {
    Button,
    Image,
    StyleSheet,
    Text,
    View,
    Alert,
    FlatList,
    Modal,
    TouchableHighlight
} from 'react-native';


export default function HomeScreen() {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [chosenTile, setChosenTile] = useState();

  const toggleModal = () => {
          setIsModalVisible(!isModalVisible);
      };

  const testIdImage = () => console.log('Chosen tile:', chosenTile)


  const handleButtonPress = (id) => Alert.alert("Button has been pressed", "You just have pressed the button. Continue?",[
      {text: "Yes, please!", onPress: () => {
          setChosenTile(()=>id)
          toggleModal()
          testIdImage()
      }},
      {text: "Hell no!"}
      ])



  const [listOfItems, setListOfItems] = useState([
      {image: require('../assets/favicon.png'), id: 1},
      {image: require('../assets/favicon.png'), id: 2},
      {image: require('../assets/favicon.png'), id: 3},
      {image: require('../assets/favicon.png'), id: 4}
  ])

  const renderItem = ({ item, index }) => (
  <View>
      <TouchableHighlight onPress={() => handleButtonPress(item.id)}>
        <Image
          style={{ height: 48, width: 48, alignItems:"center", justifyContent: "center"}}
          source={item.image}
          resizeMode="contain"
        />
      </TouchableHighlight>
  </View>
);

  return (
    <View style={styles.container}>
        <Text>Welcome Home!</Text>
        <Button title={'Choose tile'} onPress={toggleModal}/>
        <Modal animationType={'slideOutUp'}
               visible={isModalVisible}
                transparent={true}>
            <View style={styles.containerModal}>
                <View style={styles.containerImage}>
                    <Button style={{paddingBottom:50}} title={'Hide tiles'} onPress={toggleModal}/>
                    <FlatList horizontal={true}
                              style={{paddingTop: 50}}
                              data={listOfItems}
                              keyExtractor={(item) => item.id.toString()}
                              renderItem={renderItem}/>
                </View>
            </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent:"center",
      alignItems:"center"
  },
  containerImage: {
      flex:1,
      justifyContent:"center",
      alignItems:"center",
      paddingTop: '70%',
      width:250,
      marginBottom:350
  },
  containerModal: {
      flex: 1,
      backgroundColor: 'rgba(52,52,52,0.7)',
      alignItems: 'center',
      justifyContent: 'center',
  }
});
