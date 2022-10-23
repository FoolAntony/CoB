import { StatusBar } from 'expo-status-bar';
import {Alert, Button, Image, StyleSheet, Text, View, TouchableHighlight, TouchableWithoutFeedback} from 'react-native';

export default function App() {


  const handleTextPress = () => console.log('Text pressed')
  const handleButtonPress = () => Alert.alert("SomeApp","It is message IDK",[
      {text: "WOW!", onPress: () => console.log("Yoohoo")},
      {text: "Bye!", onPress: () => console.log("GoodBye!!")}])


  return (
    <View style={styles.container}>
      <Text>Citadel Of Blood</Text>
      <Button title={"Press me"} style="auto" color="purple" onPress={handleButtonPress}/>

      <TouchableWithoutFeedback onPress={handleButtonPress} title={"OK"}>
        <Image source={require('./assets/favicon.png')}/>
      </TouchableWithoutFeedback>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
