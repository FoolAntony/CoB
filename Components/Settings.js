import { StatusBar } from 'expo-status-bar';
import React, {useState} from "react";
import {StyleSheet, Text, View,} from 'react-native';


export default function Settings() {

  return (
    <View style={styles.container}>
      <Text>Change Settings!</Text>
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
