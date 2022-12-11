import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from "react";
import {Button, StyleSheet, Text, View,} from 'react-native';



export default function Settings() {

  const [withTools, setWithTools] = useState(false)

  const changeSetting = () => {
    setWithTools(!withTools)
  }

  useEffect(() => console.log(withTools), [withTools])

  return (
    <View style={styles.container}>
      <Text>Change Settings!</Text>
      <View>
        <Button title={'Help!'} onPress={changeSetting}/>
        <Text>Current state {JSON.stringify(withTools)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:"center",
    alignItems:"center"
  }
});
